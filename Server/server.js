import express from 'express';
import cors from 'cors';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;



const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/api/grid', (req, res) => {
  const { size } = req.body;
  const matrix = createAdjacencyMatrix(size);
  const { nodes, links } = createNodesandEdges(matrix,size);
  res.send({size,matrix,nodes,links});
});


app.post('/api/dilateGrid', (req, res) => {
  const {size,selectedNodes,selectedLinks, nodes, links } = req.body;

  // Perform dilation
  const newSelectedNodes = new Set(selectedNodes); // Use a Set for efficient lookups and to avoid duplicates
  selectedNodes.forEach(nodeId => {
    const neighbors = getNeighbors(nodeId,size);
    neighbors.forEach(neighbor => {
      if (!newSelectedNodes.has(neighbor)) {
        newSelectedNodes.add(neighbor);
      }
    });
  });

  // Convert the Set back to an array for the response
  const dilatedSelectedNodes = Array.from(newSelectedNodes);

  // Respond with the updated list of selected nodes
  res.json({ dilatedNodes: dilatedSelectedNodes, selectedLinks });
});


function createAdjacencyMatrix(size) {
  const matrix = [];
  for (let i = 0; i < size * size; i++) {
    matrix[i] = new Array(size * size).fill(0);
    const row = Math.floor(i / size);
    const col = i % size;
    // Fill the adjacency matrix for a grid
    if (col < size - 1) { // Right neighbor
      matrix[i][i + 1] = 1;
    }
    if (col > 0) { // Left neighbor
      matrix[i][i - 1] = 1;
    }
    if (row < size - 1) { // Bottom neighbor
      matrix[i][i + size] = 1;
    }
    if (row > 0) { // Top neighbor
      matrix[i][i - size] = 1;
    }
  }
  return matrix;
}

function createNodesandEdges(matrix, size){
  const nodes = matrix.map((_, i) => ({ id: i }));
  const links = [];

  matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 1) {
        // Calculate the row and column of the source and target nodes
        const sourceRow = Math.floor(i / size);
        const sourceCol = i % size;
        const targetRow = Math.floor(j / size);
        const targetCol = j % size;
        
        // Determine if the edge is horizontal or vertical
        if (sourceRow === targetRow) {
          // If the rows are the same and the columns differ by 1, it's a horizontal edge
          links.push({
            id: `link-${i}-${j}`,
            source: i,
            target: j,
            edgetype: 'Horizontal'
          });
        } else if (sourceCol === targetCol) {
          // If the columns are the same and the rows differ by 1, it's a vertical edge
          links.push({
            id: `link-${i}-${j}`,
            source: i,
            target: j,
            edgetype: 'Vertical'
          });
        }
      }
    });
  });
  
  return { nodes, links };
  
}
  // Helper function to get node's neighbors
  function getNeighbors(nodeId, size) {
    const row = Math.floor(nodeId / size);
    const col = nodeId % size;
    const neighbors = [];

    // Add left neighbor if not on the left edge
    if (col > 0) neighbors.push(nodeId - 1);
    // Add right neighbor if not on the right edge
    if (col < size - 1) neighbors.push(nodeId + 1);
    // Add top neighbor if not on the top edge
    if (row > 0) neighbors.push(nodeId - size);
    // Add bottom neighbor if not on the bottom edge
    if (row < size - 1) neighbors.push(nodeId + size);

    return neighbors;
  }
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
