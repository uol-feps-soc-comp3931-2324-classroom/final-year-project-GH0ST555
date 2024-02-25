import React, { useState,useEffect } from 'react';
import axios from 'axios';
import GridComponent from './GridComponent';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './App.css'
import SubgraphSelector from './SubgraphSelector';
import SubgraphComponent from './Subgraph';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

const GridSizeForm = () => {
  const [rows, setRows] = useState('');
  const [cols, setCols] = useState('');
  const [gridData, setGridData] = useState(null); 
  const [subgraphData, setsubgraphDataData] = useState(null); 


  //To store selected nodes and links.
  //Will be useful for the generation of the subgraph
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [dilatedData,setDilatedData] = useState(null);
  const  [generateSG, setGenerateSG] = useState(false);

  const [selectedOption, setSelectedOption] = useState("Single Node");


    const options = [
      'Single Node', 'Horizontal-Edge', 'Vertical-Edge','cross shaped(No Edges)', 'Node + Edge + RNode'
    ];
    const defaultOption = options[0];


    const MMoperation = [
      'Dilation', 'Erosion'
    ];
    const defaultMMOpertaion = MMoperation[0];

  const onNodeSelect = (node) => {
    setSelectedNodes(prevSelectedNodes => {
      const isSelected = prevSelectedNodes.includes(node.id);
      if (isSelected) {
        // If already selected, remove it from the selection
        return prevSelectedNodes.filter(id => id !== node.id);
      } else {
        // If not selected, add it to the selection
        return [...prevSelectedNodes, node.id];
      }
    });
  };
  
  const onLinkSelect = (link) => {
    setSelectedLinks(prevSelectedLinks => {
      const isSelected = prevSelectedLinks.some(selectedLink => selectedLink.id === link.id);
      if (isSelected) {
        // If already selected, remove it from the selection
        return prevSelectedLinks.filter(selectedLink => selectedLink.id !== link.id);
      } else {
        // If not selected, add it to the selection
        return [...prevSelectedLinks, link];
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGenerateSG(false);
      setSelectedNodes([]);
      setSelectedLinks([]);
      const response = await axios.post(`${serverUrl}/api/grid`, { rows:rows, cols:cols });
      setGridData(response.data); // Set the grid data which will be used by the GridComponent
      setsubgraphDataData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error creating grid:', error);
    }
  };

  const handleDilation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${serverUrl}/api/dilateGrid`, {rows:gridData.rows , cols:gridData.cols,size: gridData.size, selectedNodes: selectedNodes, selectedLinks:selectedLinks, nodes:gridData.nodes, links:gridData.links ,SE: selectedOption});
      setDilatedData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error Dilating Grid:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Grid Size (N x N):
          <input type="number" value={rows} onChange={(e) => setRows(parseInt(e.target.value, 10))} min="1" placeholder="Rows"/>
          <input type="number" value={cols} onChange={(e) => setCols(parseInt(e.target.value, 10))} min="1" placeholder="Columns"/>
        </label>
        <button type="submit">Create Grid</button>
      </form>
      {gridData && (
        <>
            <Popup trigger=
                {<button> Select Subgraph Elements </button>} 
                modal nested>
                {
                    close => (
                        <div className='modal'>
                            <div>
                                <button onClick= { ()=>{close(); setSelectedNodes([]); setSelectedLinks([]); setGenerateSG(false);}   }> Close </button>
                                <button onClick= {() => {close(); setGenerateSG(true)}}> Submit Subgraph </button>
                            </div>
                          <p>Select the edges/nodes you would want part of the Subgraphs. Selected Elements Turn Red</p>
                          <SubgraphSelector rows={gridData.rows}  cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} onNodeSelect={onNodeSelect} onLinkSelect={onLinkSelect} />
                        </div>
                    )
                }
            </Popup>
            <Dropdown options={options} onChange={({ value }) => setSelectedOption(value)} value={defaultOption} placeholder="Select Structuring Element" />
            <Dropdown options={MMoperation}  value={defaultMMOpertaion} placeholder="Select MM Operation" />
            <button onClick= {handleDilation}> Perform Operation </button>
        <p>This Is The Grid</p>
        <GridComponent rows={gridData.rows} cols ={gridData.cols} nodes={gridData.nodes} links={gridData.links} />
        </>
      )}
      {generateSG && (
        <>
        <p>This Is The SubGraph</p>
        <SubgraphComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={selectedNodes} selectedLinks={selectedLinks} />
        
        </>
      )}


      {dilatedData && (
              <>
              <p>This Is The Dilated Data</p>
              <SubgraphComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={dilatedData.dilatedNodes} selectedLinks={dilatedData.dilatedLinks} />
              
              </>
            )}

      
    </div>
  );
};

export default GridSizeForm;
