import React, { useState } from 'react';
import axios from 'axios';
import GridComponent from './GridComponent'; // Make sure the path is correct

const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

const GridSizeForm = () => {
  const [size, setSize] = useState('');
  const [gridData, setGridData] = useState(null); // State to store the response data

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${serverUrl}/api/grid`, { size: parseInt(size, 10) });
      setGridData(response.data); // Set the grid data which will be used by the GridComponent
    } catch (error) {
      console.error('Error creating grid:', error);
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
        <GridComponent
          size={gridData.size} // Ensure these match the data structure sent by the server
          nodes={gridData.nodes}
          links={gridData.links}
        />
      )}
    </div>
  );
};

export default GridSizeForm;
