import express from 'express';
import cors from 'cors';
import jsdom from 'jsdom';
import { link } from 'd3';
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
  res.json(dilation(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));

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

//perform dilation
//The idea is to match the orign SE to elemtents of the subgraph
//if there is match, the SE is added to the subgraph
function dilation(rows,cols,selectedNodes,selectedLinks, nodes, links, SE){
  //Single Node SE, Nodes are dilated, removing edges
  if (SE == 'Single Node'){
    return { dilatedNodes: selectedNodes, dilatedLinks: null }
  }

  //Origin is at the center
  //Means That all neighbours that are not in the subgraph are added in this case of dilation
  else if (SE == 'cross shaped(No Edges)'){
    const newSelectedNodes = new Set(selectedNodes); // Use a Set for efficient lookups and to avoid duplicates
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      neighbors.forEach(neighbor => {
        if (!newSelectedNodes.has(neighbor)) {
          newSelectedNodes.add(neighbor);
        }
      });
    });

    // Convert the Set back to an array for the response
    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: selectedLinks };
  }

  //origin is the node followed by the edge and its right node
  // N==N
  // *
  else if (SE == 'Node + Edge + RNode'){
    const newSelectedNodes = new Set(selectedNodes);
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      // if R neighbour exists and not present in the selected nodes 
      if(neighbors.includes(nodeId+1) && !newSelectedNodes.has(nodeId+1)){
          newSelectedNodes.add(nodeId+1);
          const linkbwNodes = `link-${nodeId+1}-${nodeId}`
          const linkObject = links.find(link => link.id === linkbwNodes);
          if (linkObject && !selectedLinks.some(link => link.id === linkbwNodes)) {
            selectedLinks.push(linkObject); 
          }
      }

      //if R neighbour Exists and Is present in selected nodes. We still need to check if the edge between them exists
      else if(neighbors.includes(nodeId+1) && newSelectedNodes.has(nodeId+1)){
        const linkbwNodes = `link-${nodeId+1}-${nodeId}`
        const linkObject = links.find(link => link.id === linkbwNodes);
        if (linkObject && !selectedLinks.some(link => link.id === linkbwNodes)) {
          selectedLinks.push(linkObject); 
        }
    }

    });

    // Convert the Set back to an array for the response
    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: selectedLinks };
  }



  else if (SE == 'Horizontal Edge'){
    const newSelectedNodes = new Set(selectedNodes); 
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      const neighborsR = getNeighbors(nodeId+1,rows,cols);
      //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+1) && selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)){
        neighbors.forEach(neighbor => {
          if (!newSelectedNodes.has(neighbor)) {
            newSelectedNodes.add(neighbor);
          }
        });

        neighborsR.forEach(neighbor => {
          if (!newSelectedNodes.has(neighbor)) {
            newSelectedNodes.add(neighbor);
          }
        });

        //start with left side of this process.
        //Add all neigbours of the Node
        const connectedLinks = getConnectedLinks(nodeId, links);
        connectedLinks.forEach(link => {
          // Check if the link exists in selectedLinks by comparing link ids
          const linkExistsInSelected = selectedLinks.some(selectedLink => selectedLink.id === link.id);
        
          // If the link is not already in selectedLinks, add it
          if (!linkExistsInSelected) {
            selectedLinks.push(link);
          }
        });
        
        const connectedLinksR = getConnectedLinks(nodeId+1, links);
        connectedLinksR.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (!linkExistsInSelectedR) {
            selectedLinks.push(link);
          }
        });
    }
    });

    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: selectedLinks };
  }

  else if (SE == 'Vertical Edge'){
    const newSelectedNodes = new Set(selectedNodes); 
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      const neighborsB = getNeighbors(nodeId+cols,rows,cols);
      //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+cols) && selectedLinks.some(link => link.id === `link-${nodeId+cols}-${nodeId}`)){
        neighbors.forEach(neighbor => {
          if (!newSelectedNodes.has(neighbor)) {
            newSelectedNodes.add(neighbor);
          }
        });

        neighborsB.forEach(neighbor => {
          if (!newSelectedNodes.has(neighbor)) {
            newSelectedNodes.add(neighbor);
          }
        });

        //start with left side of this process.
        //Add all neigbours of the Node
        const connectedLinks = getConnectedLinks(nodeId, links);
        connectedLinks.forEach(link => {
          // Check if the link exists in selectedLinks by comparing link ids
          const linkExistsInSelected = selectedLinks.some(selectedLink => selectedLink.id === link.id);
        
          // If the link is not already in selectedLinks, add it
          if (!linkExistsInSelected) {
            selectedLinks.push(link);
          }
        });
        
        const connectedLinksB = getConnectedLinks(nodeId+cols, links);
        connectedLinksB.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (!linkExistsInSelectedR) {
            selectedLinks.push(link);
          }
        });
    }
    });

    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: selectedLinks };
  }
}


//given a node and the structure of the grid,
//Retrieves all possible neighbours in the form of an array
function getNeighbors(nodeId, rows, cols) {
  const row = Math.floor(nodeId / cols);
  const col = nodeId % cols;
  const neighbors = [];

  // Check left neighbor
  if (col > 0) neighbors.push(nodeId - 1);

  // Check right neighbor
  if (col < cols - 1) neighbors.push(nodeId + 1);

  // Check top neighbor
  if (row > 0) neighbors.push(nodeId - cols);

  // Check bottom neighbor
  if (row < rows - 1) neighbors.push(nodeId + cols);
  return neighbors;
}

function getConnectedLinks(nodeId, links) {
  // Filter links where the current nodeId is either the source or the target
  const connectedLinks = links.filter(link => link.source === nodeId || link.target === nodeId);
  console.log(connectedLinks);
  
  return connectedLinks;
}




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
