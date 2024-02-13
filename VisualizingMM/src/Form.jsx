import React, { useState } from 'react';
import axios from 'axios';


// This will be The Form That User uses to submit For a Grid
const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;



const GridSizeForm = () => {
  const [size, setSize] = useState('');
  const [svgContent, setSvgContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${serverUrl}/api/grid`, { size: parseInt(size, 10) });
      // Assuming the server sends back SVG content directly
      setSvgContent(response.data); // Update state with SVG content
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
      {/* Conditionally render the SVG content */}
      {svgContent && <div dangerouslySetInnerHTML={{ __html: svgContent }} />}
    </div>
  );
  
};

export default GridSizeForm;
