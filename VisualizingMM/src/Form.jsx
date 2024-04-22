import React, { useState,useEffect } from 'react';
import axios from 'axios';
import GridComponent from './GridComponent';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './App.css'
import SubgraphSelector from './SubgraphSelector';
import SubgraphComponent from './Subgraph';
import SESelector from './SESelector';
import Dropdown from 'react-dropdown';
import SEComponent from './SEComponent';
import HSESelector from './HSESelector';
import VSESelector from './VSESelector';
import 'react-dropdown/style.css'

const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

const GridSizeForm = () => {
  const [rows, setRows] = useState('');
  const [cols, setCols] = useState('');
  const [gridData, setGridData] = useState(null); 
  const [subgraphData, setsubgraphDataData] = useState(null); 
  const [SEData, setSEData] = useState(null); 


  const [customSE, setcustomSE] = useState(false);
  const [customHSE, setcustomHSE] = useState(false);
  const [customVSE, setcustomVSE] = useState(false);

  //To store selected nodes and links.
  //Will be useful for the generation of the subgraph
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);

  //for the node part of SE
  const [selectedSENodes, setSelectedSENodes] = useState([]);
  const [selectedSELinks, setSelectedSELinks] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);

  //for the horizontal part of SE
  const [selectedHSENodes, setSelectedHSENodes] = useState([]);
  const [selectedHSELinks, setSelectedHSELinks] = useState([]);
  const [selectedHOrigin, setSelectedHOrigin] = useState(null);

  //for the vertical part of the SE
  const [selectedVSENodes, setSelectedVSENodes] = useState([]);
  const [selectedVSELinks, setSelectedVSELinks] = useState([]);
  const [selectedVOrigin, setSelectedVOrigin] = useState(null);



  //data structures to hold the output operations
  const [dilatedData,setDilatedData] = useState(null);
  const [erodedData,setErodedData] = useState(null);
  const [openData,setOpenData] = useState(null);
  const  [generateSG, setGenerateSG] = useState(false);

  //default operations for the dropdowns
  const [selectedOption, setSelectedOption] = useState("Single Node");
  const  [selectedMMop, setSelectedMMop] = useState("Dilation");


    const options = [
      'Single Node','cross shaped(No Edges)', 'Node + Edge + RNode','Horizontal Edge', 'Vertical Edge', 'Custom SE'
    ];
    const defaultOption = options[0];

    const MMoperation = [
      'Dilation', 'Erosion','Opening','Closing'
    ];
    const defaultMMOpertaion = MMoperation[0];

  const onNodeSelect = (node, scenario) => {
    if (scenario == 'Subgraph'){
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
    }
    //probelm identified
    else if (scenario =='SE'){
      setSelectedSENodes(prevSelectedNodes => {
        const isSelected = prevSelectedNodes.includes(node.id);
        if (isSelected) {
          // If already selected, remove it from the selection
          return prevSelectedNodes.filter(id => id !== node.id);
        } else {
          // If not selected, add it to the selection
          return [...prevSelectedNodes, node.id];
        }
      });

      
    }

    else if (scenario =='HSE'){
      setSelectedHSENodes(prevSelectedNodes => {
        const isSelected = prevSelectedNodes.includes(node.id);
        if (isSelected) {
          // If already selected, remove it from the selection
          return prevSelectedNodes.filter(id => id !== node.id);
        } else {
          // If not selected, add it to the selection
          return [...prevSelectedNodes, node.id];
        }
      });
    }

    else if (scenario =='VSE'){
      setSelectedVSENodes(prevSelectedNodes => {
        const isSelected = prevSelectedNodes.includes(node.id);
        if (isSelected) {
          // If already selected, remove it from the selection
          return prevSelectedNodes.filter(id => id !== node.id);
        } else {
          // If not selected, add it to the selection
          return [...prevSelectedNodes, node.id];
        }
      });
    }

  };
  
  const onLinkSelect = (link, scenario,node,node2) => {
    if (scenario == 'Subgraph'){ 
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
      //When an edge is selected, both nodes that are linked by the edge must be added if not previously added
      setSelectedNodes(prevSelectedNodes => {
        let updatedNodes = [...prevSelectedNodes];
        const isSelected = prevSelectedNodes.includes(node);
        const isSelected2 = prevSelectedNodes.includes(node2);
        if (!isSelected) {
          updatedNodes.push(node);
        }
        if (!isSelected2) {
          updatedNodes.push(node2);
        }

        return updatedNodes;
      });
      
    }
    else if (scenario =='SE'){
      setSelectedSELinks(prevSelectedLinks => {
        const isSelected = prevSelectedLinks.some(selectedLink => selectedLink.id === link.id);
        if (isSelected) {
          // If already selected, remove it from the selection
          return prevSelectedLinks.filter(selectedLink => selectedLink.id !== link.id);
        } else {
          // If not selected, add it to the selection
          return [...prevSelectedLinks, link];
        }
      });

      //When an edge is selected, both nodes that are linked by the edge must be added if not previously added
      setSelectedSENodes(prevSelectedNodes => {
        let updatedNodes = [...prevSelectedNodes];
        const isSelected = prevSelectedNodes.includes(node);
        const isSelected2 = prevSelectedNodes.includes(node2);
        if (!isSelected) {
          updatedNodes.push(node);
        }
        if (!isSelected2) {
          updatedNodes.push(node2);
        }

        return updatedNodes;
      });
    }

    else if (scenario =='HSE'){
      setSelectedHSELinks(prevSelectedLinks => {
        const isSelected = prevSelectedLinks.some(selectedLink => selectedLink.id === link.id);
        if (isSelected) {
          // If already selected, remove it from the selection
          return prevSelectedLinks.filter(selectedLink => selectedLink.id !== link.id);
        } else {
          // If not selected, add it to the selection
          return [...prevSelectedLinks, link];
        }
      });

      //When an edge is selected, both nodes that are linked by the edge must be added if not previously added
      setSelectedHSENodes(prevSelectedNodes => {
        let updatedNodes = [...prevSelectedNodes];
        const isSelected = prevSelectedNodes.includes(node);
        const isSelected2 = prevSelectedNodes.includes(node2);
        if (!isSelected) {
          updatedNodes.push(node);
        }
        if (!isSelected2) {
          updatedNodes.push(node2);
        }

        return updatedNodes;
      });
    }

    else if (scenario =='VSE'){
      setSelectedVSELinks(prevSelectedLinks => {
        const isSelected = prevSelectedLinks.some(selectedLink => selectedLink.id === link.id);
        if (isSelected) {
          // If already selected, remove it from the selection
          return prevSelectedLinks.filter(selectedLink => selectedLink.id !== link.id);
        } else {
          // If not selected, add it to the selection
          return [...prevSelectedLinks, link];
        }
      });

      //When an edge is selected, both nodes that are linked by the edge must be added if not previously added
      setSelectedVSENodes(prevSelectedNodes => {
        let updatedNodes = [...prevSelectedNodes];
        const isSelected = prevSelectedNodes.includes(node);
        const isSelected2 = prevSelectedNodes.includes(node2);
        if (!isSelected) {
          updatedNodes.push(node);
        }
        if (!isSelected2) {
          updatedNodes.push(node2);
        }

        return updatedNodes;
      });
    }


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

  //need to add the new data here
  const handleDilation = async (e) => {
    try {
      console.log(selectedSENodes);
      console.log(selectedSELinks);
      console.log(selectedOrigin);
      console.log(selectedHSELinks,selectedHSENodes,selectedVSELinks,selectedVSENodes);
      //Convert SE data into a single object to send to the server. Making it easier to read
      const SEData ={selectedOrigin,selectedSENodes,selectedSELinks,selectedHOrigin,selectedHSENodes,selectedHSELinks,selectedVOrigin,selectedVSENodes,selectedVSELinks};
      const response = await axios.post(`${serverUrl}/api/dilateGrid`, {rows:gridData.rows , cols:gridData.cols,size: gridData.size, 
      selectedNodes: selectedNodes, selectedLinks:selectedLinks, nodes:gridData.nodes,
      links:gridData.links ,SE: selectedOption, SEData: SEData});
      setDilatedData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error Dilating Grid:', error);
    }
  };
 

  const handleErosion = async (e) => {
    try {
      //Convert SE data into a single object to send to the server. Making it easier to read
      console.log(selectedNodes);
      console.log(selectedLinks);
      console.log(selectedOrigin);
      const SEData ={selectedOrigin,selectedSENodes,selectedSELinks,selectedHOrigin,selectedHSENodes,selectedHSELinks,selectedVOrigin,selectedVSENodes,selectedVSELinks};
      const response = await axios.post(`${serverUrl}/api/erodeGrid`, {rows:gridData.rows , cols:gridData.cols,size: gridData.size, selectedNodes: selectedNodes, 
      selectedLinks:selectedLinks, nodes:gridData.nodes, links:gridData.links ,SE: selectedOption,  SEData: SEData });
      setErodedData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error Eroding Grid:', error);
    }
  };

  const handleOpening = async (e) => {
    try {
      const response = await axios.post(`${serverUrl}/api/openGrid`, {rows:gridData.rows , cols:gridData.cols,size: gridData.size, selectedNodes: selectedNodes, selectedLinks:selectedLinks, nodes:gridData.nodes, links:gridData.links ,SE: selectedOption, Origin: selectedOrigin, SENodes: selectedSENodes, SELinks: selectedSELinks});
      setOpenData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error Opening Grid:', error);
    }
  };

  const handleOperationClick = async () => {
    if (selectedMMop === "Dilation") {
      await handleDilation();
    } else if (selectedMMop === "Erosion") {
      await handleErosion();
    }
    else if(selectedMMop == "Opening"){
      console.log('BB');
      await handleOpening();
    } else {
      console.log("No operation or unrecognized operation selected");
    }
  };
  

  return (
    <>
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Grid Size (N x N):
          <input type="number" value={rows} onChange={(e) => setRows(parseInt(e.target.value, 10))} min="1" placeholder="Rows"/>
          <input type="number" value={cols} onChange={(e) => setCols(parseInt(e.target.value, 10))} min="1" placeholder="Columns"/>
        </label>
        <button type="submit">Create Grid</button>
      </form>
      {gridData && (        <div className='popups'>
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
                          <SubgraphSelector rows={gridData.rows}  cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} onNodeSelect={onNodeSelect} onLinkSelect={onLinkSelect} scenario = "Subgraph" />
                        </div>
                    )
                }
            </Popup>
            {selectedOption == 'Custom SE' && (
              <>
              <Popup trigger=
                  {<button> Select Node Function </button>} 
                  modal nested>
                  {
                      close => (
                          <div className='modal'>
                              <div>
                                  <button onClick= { ()=>{close(); setSelectedSENodes([]); setSelectedSELinks([]); setSelectedOrigin(null); setcustomSE(false);}   }> Close </button>
                                  <button onClick= {() => {close(); setcustomSE(true)}}> Set </button>
                              </div>
                            <p>Select Nodes/Edges to be applied when a node is identified</p>
                            <SESelector rows={gridData.rows}  cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} onNodeSelect={onNodeSelect} onLinkSelect={onLinkSelect} scenario = "SE" selectedOrigin={selectedOrigin} setSelectedOrigin={setSelectedOrigin} selectedNodes={selectedSENodes} selectedLinks={selectedSELinks}/>
                          </div>
                      )
                  }
              </Popup>
              <Popup trigger=
                  {<button> Select H Edge Function </button>} 
                  modal nested>
                  {
                      close => (
                          <div className='modal'>
                              <div>
                                  <button onClick= { ()=>{close(); setSelectedHSENodes([]); setSelectedHSELinks([]); setSelectedHOrigin(null); setcustomHSE(false);}   }> Close </button>
                                  <button onClick= {() => {close(); setcustomHSE(true)}}> Set </button>
                              </div>
                            <p>Select Nodes/Edges to be applied when a horizontal edge is identified</p>
                            <HSESelector rows={gridData.rows}  cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} onNodeSelect={onNodeSelect} onLinkSelect={onLinkSelect} scenario = "HSE" selectedOrigin={selectedHOrigin} setSelectedOrigin={setSelectedHOrigin} selectedNodes={selectedHSENodes} selectedLinks={selectedHSELinks}/>
                          </div>
                      )
                  }
              </Popup>
              <Popup trigger=
                  {<button> Select V Edge Function </button>} 
                  modal nested>
                  {
                      close => (
                          <div className='modal'>
                              <div>
                                  <button onClick= { ()=>{close(); setSelectedVSENodes([]); setSelectedVSELinks([]); setSelectedVOrigin(null); setcustomVSE(false);}   }> Close </button>
                                  <button onClick= {() => {close(); setcustomSE(true)}}> Set </button>
                              </div>
                            <p>Select Nodes/Edges to be applied when a vertical edge is identified</p>
                            <VSESelector rows={gridData.rows}  cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} onNodeSelect={onNodeSelect} onLinkSelect={onLinkSelect} scenario = "VSE" selectedOrigin={selectedVOrigin} setSelectedOrigin={setSelectedVOrigin} selectedNodes={selectedVSENodes} selectedLinks={selectedVSELinks}/>
                          </div>
                      )
                  }
              </Popup>
              </>         
             )}

            <Dropdown options={options} onChange={({ value }) => setSelectedOption(value)} value={defaultOption} placeholder="Select Structuring Element" />
            <Dropdown options={MMoperation} onChange={({ value }) => setSelectedMMop(value)} value={defaultMMOpertaion} placeholder="Select MM Operation" />
            <button onClick= {handleOperationClick}> Perform Operation </button>
            </div>)}
    </div>
      <div className='Graphs'>
      {gridData && (
        <>

        {/* <p>This Is The Grid</p> */}
        <GridComponent rows={gridData.rows} cols ={gridData.cols} nodes={gridData.nodes} links={gridData.links} />
        </>
      )}
      {generateSG && (
        <>
        {/* <p>This Is The SubGraph</p> */}
        <SubgraphComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={selectedNodes} selectedLinks={selectedLinks} />  
        </>
      )}
      </div>
      <div className='SE'>
      {customSE && (
        <>
        <p>This Is The Selected Strucutring Element</p>
        {selectedOrigin && (<SEComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={selectedSENodes} selectedLinks={selectedSELinks} selectedOrigin={selectedOrigin} />)}
        {selectedHOrigin && (<SEComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={selectedHSENodes} selectedLinks={selectedHSELinks} selectedOrigin={selectedHOrigin} />)}
        {selectedVOrigin && (<SEComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={selectedVSENodes} selectedLinks={selectedVSELinks} selectedOrigin={selectedVOrigin} />)}
        </>
      )}
      </div>

      {dilatedData && (
              <>
                {/* <div className='text-container'>
                  <p className='text'>This Is The Dilated Data</p>
                </div> */}
              <SubgraphComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={dilatedData.dilatedNodes} selectedLinks={dilatedData.dilatedLinks} className='graph-component'/>
              </>
            )}
      {erodedData && (
              <>
              {/* <p>This Is The Eroded Data</p> */}
              <SubgraphComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={erodedData.erodedNodes} selectedLinks={erodedData.erodedLinks} /> 
              </>
            )}
      {openData && (
              <>
              <p>This Is The Data after opening</p>
              <SubgraphComponent rows={gridData.rows} cols={gridData.cols} nodes={gridData.nodes} links={gridData.links} selectedNodes={openData.resultNodes} selectedLinks={openData.resultLinks} /> 
              </>
            )}      
    
    </>
  );
};

export default GridSizeForm;
