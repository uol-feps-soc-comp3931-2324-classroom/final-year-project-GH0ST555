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
  const { nodes, links } = createNodesandEdges(matrix);
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

function createNodesandEdges(matrix){
  const nodes = matrix.map((_, i) => ({ id: i }));
  const links = [];

  matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 1) {
        links.push({
          id: `link-${i}-${j}`,
          source: i,
          target: j
        });
      }
    });
  });
  return { nodes, links };
  
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
