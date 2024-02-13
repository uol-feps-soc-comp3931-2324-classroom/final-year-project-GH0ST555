import express from 'express';
import cors from 'cors';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import * as d3 from 'd3';


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/api/grid', (req, res) => {
  const { size } = req.body;
  const matrix = createAdjacencyMatrix(size);
  const { nodes, links } = createNodesandEdges(matrix);

  const { document } = (new JSDOM(`<!DOCTYPE html><body></body>`)).window;
  global.document = document;

  const svg = d3.select(document.body).append("svg")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("width", 750)
                .attr("height", 750);

  // Calculate node positions based on the grid size
  const gap = (700 - 2 * 30) / (size + 1); // Adjust gap to account for offset
  nodes.forEach(node => {
    node.x = (node.id % size) * gap + 30; // Add the offset here
    node.y = Math.floor(node.id / size) * gap + 30; // And here
  });

  // Draw lines for links first so they appear behind the circles
  svg.selectAll("line")
     .data(links)
     .enter()
     .append("line")
     .attr("x1", d => nodes[d.source].x)
     .attr("y1", d => nodes[d.source].y)
     .attr("x2", d => nodes[d.target].x)
     .attr("y2", d => nodes[d.target].y)
     .attr("stroke", "black");

  // Draw circles for nodes
  svg.selectAll("circle")
     .data(nodes)
     .enter()
     .append("circle")
     .attr("cx", d => d.x ) // Offset by one gap to center
     .attr("cy", d => d.y ) // Offset by one gap to center
     .attr("r", 10)
     .attr("fill", "black");

  // Send SVG as a string
  res.send(document.body.innerHTML);
});


function createAdjacencyMatrix(size) { //with nodes and links
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

  //console.log(matrix)
  return matrix;
}

function createNodesandEdges(matrix){
  const nodes = matrix.map((_, i) => ({ id: i }));
  const links = [];

  matrix.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 1) {
        links.push({
          source: i,
          target: j
        });
      }
    });
  });
  return {nodes,links};
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
