import express from 'express';
import cors from 'cors';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;



const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/api/grid', (req, res) => {
  const { rows,cols } = req.body;
  const matrix = createAdjacencyMatrix(rows,cols);
  const { nodes, links } = createNodesandEdges(matrix,rows,cols);

  res.send({rows,cols,matrix,nodes,links});
});


app.post('/api/dilateGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE } = req.body;
  // Perform dilation when SE is a single Node
  //THis results in all Selected nodes being highlighted only
  //THerefore Dilated Subgaprh would be Only Selected Nodes
  if (SE == 'Single Node'){
    res.json({ dilatedNodes: selectedNodes, dilatedLinks: null })
  }

  // const newSelectedNodes = new Set(selectedNodes); // Use a Set for efficient lookups and to avoid duplicates
  // selectedNodes.forEach(nodeId => {
  //   const neighbors = getNeighbors(nodeId,rows,cols);
  //   neighbors.forEach(neighbor => {
  //     if (!newSelectedNodes.has(neighbor)) {
  //       newSelectedNodes.add(neighbor);
  //     }
  //   });
  // });

  // // Convert the Set back to an array for the response
  // const dilatedSelectedNodes = Array.from(newSelectedNodes);

  // Respond with the updated list of selected nodes
  // res.json({ dilatedNodes: dilatedSelectedNodes, dilatedLinks: selectedLinks });
});


function createAdjacencyMatrix(rows, cols) {
  const size = rows * cols;
  const matrix = [];

  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size).fill(0);
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Right neighbor
    if (col < cols - 1) matrix[i][i + 1] = 1;
    // Left neighbor
    if (col > 0) matrix[i][i - 1] = 1;
    // Bottom neighbor
    if (row < rows - 1) matrix[i][i + cols] = 1;
    // Top neighbor
    if (row > 0) matrix[i][i - cols] = 1;
  }

  return matrix;
}

function createNodesandEdges(matrix, rows, cols) {
  const size = rows * cols;
  const nodes = matrix.map((_, i) => ({ id: i }));
  const links = [];

  matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 1) {
        const sourceRow = Math.floor(i / cols);
        const sourceCol = i % cols;
        const targetRow = Math.floor(j / cols);
        const targetCol = j % cols;

        if (sourceRow === targetRow) {
          links.push({
            id: `link-${i}-${j}`,
            source: i,
            target: j,
            edgetype: 'Horizontal'
          });
        } else if (sourceCol === targetCol) {
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

function getNeighbors(nodeId, rows, cols) {
  const totalNodes = rows * cols;
  const row = Math.floor(nodeId / cols);
  const col = nodeId % cols;
  const neighbors = [];

  if (col > 0) neighbors.push(nodeId - 1); // Left
  if (col < cols - 1) neighbors.push(nodeId + 1); // Right
  if (row > 0) neighbors.push(nodeId - cols); // Top
  if (row < rows - 1) neighbors.push(nodeId + cols); // Bottom

  return neighbors;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
