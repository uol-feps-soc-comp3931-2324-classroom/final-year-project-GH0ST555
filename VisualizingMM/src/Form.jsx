import React, { useState } from 'react';
import axios from 'axios';
import GridComponent from './GridComponent';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './App.css'
import SubgraphSelector from './SubgraphSelector';
import SubgraphComponent from './Subgraph';
const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

const GridSizeForm = () => {
  const [size, setSize] = useState('');
  const [gridData, setGridData] = useState(null); 
  const [subgraphData, setsubgraphDataData] = useState(null); 

  //To store selected nodes and links.
  //Will be useful for the generation of the subgraph
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);

  const  [generateSG, setGenerateSG] = useState(false);

  const onNodeSelect = (node) => {
    const isSelected = selectedNodes.includes(node.id);
    setSelectedNodes(isSelected ? selectedNodes.filter(id => id !== node.id) : [...selectedNodes, node.id]);
  };

  const onLinkSelect = (link) => {
    const linkId = link.id;
    const isSelected = selectedLinks.includes(linkId);
    setSelectedLinks(isSelected ? selectedLinks.filter(id => id !== linkId) : [...selectedLinks, linkId]);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGenerateSG(false);
      setSelectedNodes([]);
      setSelectedLinks([]);
      const response = await axios.post(`${serverUrl}/api/grid`, { size: parseInt(size, 10) });
      setGridData(response.data); // Set the grid data which will be used by the GridComponent
      setsubgraphDataData(response.data);
    } catch (error) {
      console.error('Error creating grid:', error);
    }
  };

  const handleSESubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${serverUrl}/api/processSE`, { size: parseInt(size, 10) });
      //handle Client side SE processing
    } catch (error) {
      console.error('Error Generating Structuring Element:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Grid Size (N x N):
          <input type="number" value={size} onChange={(e) => setSize(e.target.value)} min="1" />
        </label>
        <button type="submit">Create Grid</button>
      </form>
      {gridData && (
        <>
        <GridComponent size={gridData.size} nodes={gridData.nodes} links={gridData.links} />
          <Popup trigger=
                {<button> Select Subgraph Elements </button>} 
                modal nested>
                {
                    close => (
                        <div className='modal'>
                            <div>
                                <button onClick= { ()=>{close(); setSelectedNodes([]); setSelectedLinks([]);}   }> Close </button>
                                <button onClick= {() => {close(); setGenerateSG(true)}}> Submit Subgraph </button>
                            </div>
                          <p>Select the edges/nodes you would want part of the Subgraphs. Selected Elements Turn Red</p>
                          <SubgraphSelector size={gridData.size} nodes={gridData.nodes} links={gridData.links} onNodeSelect={onNodeSelect} onLinkSelect={onLinkSelect} />

                        </div>
                    )
                }
            </Popup>
        </>
      )}
      {generateSG && (
        <SubgraphComponent size={gridData.size} nodes={gridData.nodes} links={gridData.links} selectedNodes={selectedNodes} selectedLinks={selectedLinks} />
      )}
    </div>
  );
};

export default GridSizeForm;
