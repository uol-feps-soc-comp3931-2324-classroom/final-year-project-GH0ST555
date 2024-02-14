import React, { useState } from 'react';
import axios from 'axios';
import GridComponent from './GridComponent'; // Make sure the path is correct
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import SubgraphComponent from './Subgraph';

const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

const GridSizeForm = () => {
  const [size, setSize] = useState('');
  const [gridData, setGridData] = useState(null); // State to store the response data
  const [subgraphData, setsubgraphDataData] = useState(null); // State to store the response data

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            min="1"
          />
        </label>
        <button type="submit">Create Grid</button>
      </form>
      {gridData && (
        <>
        <GridComponent
          size={gridData.size} // Ensure these match the data structure sent by the server
          nodes={gridData.nodes}
          links={gridData.links}
        />
          <Popup trigger=
                {<button> Click to open modal </button>} 
                modal nested>
                {
                    close => (
                        <div className='modal'>
                          <SubgraphComponent
                          size={gridData.size} 
                          nodes={gridData.nodes}
                          links={gridData.links}
                          />
                            <div>
                                <button onClick=
                                    {() => close()}>
                                        Close
                                </button>
                            </div>
                        </div>
                    )
                }
            </Popup>
        </>
      )}
    </div>
  );
};

export default GridSizeForm;
