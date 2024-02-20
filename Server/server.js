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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
