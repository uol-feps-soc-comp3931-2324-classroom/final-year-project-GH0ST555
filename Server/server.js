import express from 'express';
import cors from 'cors';
import jsdom from 'jsdom';
import { link } from 'd3';
const { JSDOM } = jsdom;

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

//Endpoints To Perform Computations
app.post('/api/grid', (req, res) => {
  const { rows,cols } = req.body;
  const matrix = createAdjacencyMatrix(rows,cols);
  const { nodes, links } = createNodesandEdges(matrix,rows,cols);
  res.send({rows,cols,matrix,nodes,links});
});

app.post('/api/dilateGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE,Origin, SENodes, SELinks } = req.body;
  
  if (SE != 'Custom SE'){
    res.json(dilation(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));
  }
  else{
    const{id,type} = Origin
    // res.json(customDilation(rows,cols,selectedNodes,selectedLinks,nodes,links,origin,SENodes,SELinks));
    res.json(customDilation(rows,cols,selectedNodes,selectedLinks,nodes,links,id,type,SENodes,SELinks));
  }
  

});

app.post('/api/erodeGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE } = req.body;
  res.json(erosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));
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
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: null };
  }

  //origin is the node followed by the edge and its right node
  // N==N
  // *
  else if (SE == 'Node + Edge + RNode'){
    const newSelectedNodes = new Set(selectedNodes);
    const dilatedLinks = [];
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      // if R neighbour exists and not present in the selected nodes 
      if(neighbors.includes(nodeId+1) && !newSelectedNodes.has(nodeId+1)){
          newSelectedNodes.add(nodeId+1);
          dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+1}-${nodeId}`));
          const linkbwNodes = `link-${nodeId+1}-${nodeId}`
          const linkObject = links.find(link => link.id === linkbwNodes);
          if (linkObject && !selectedLinks.some(link => link.id === linkbwNodes)) {
            dilatedLinks.push(linkObject); 
          }
      }

      //if R neighbour Exists and Is present in selected nodes. We still need to check if the edge between them exists
      else if(neighbors.includes(nodeId+1) && newSelectedNodes.has(nodeId+1)){
        const linkbwNodes = `link-${nodeId+1}-${nodeId}`
        const linkObject = links.find(link => link.id === linkbwNodes);
        if (linkObject && !selectedLinks.some(link => link.id === linkbwNodes)) {
          dilatedLinks.push(linkObject); 
        }
    }

    });

    // Convert the Set back to an array for the response
    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: dilatedLinks };
  }



  else if (SE == 'Horizontal Edge'){
    console.log('HUH?');
    const newSelectedNodes = new Set(); 
    const dilatedLinks = [];
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      const neighborsR = getNeighbors(nodeId+1,rows,cols);
      //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+1) &&  selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)){
        newSelectedNodes.add(nodeId);
        newSelectedNodes.add(nodeId+1);
        dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+1}-${nodeId}`));

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
            dilatedLinks.push(link);
          }
        });
        
        const connectedLinksR = getConnectedLinks(nodeId+1, links);
        connectedLinksR.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (!linkExistsInSelectedR) {
            dilatedLinks.push(link);
          }
        });
    }
    });

    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: dilatedLinks };
  }

  else if (SE == 'Vertical Edge'){
    console.log('BANG');
    const newSelectedNodes = new Set();
    const dilatedLinks = [];
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      const neighborsB = getNeighbors(nodeId+cols,rows,cols);
      //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+cols) && selectedLinks.some(link => link.id === `link-${nodeId+cols}-${nodeId}`)){
        newSelectedNodes.add(nodeId);
        newSelectedNodes.add(nodeId+cols);
        dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+cols}-${nodeId}`));
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
            dilatedLinks.push(link);
          }
        });
        
        const connectedLinksB = getConnectedLinks(nodeId+cols, links);
        connectedLinksB.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (!linkExistsInSelectedR) {
            dilatedLinks.push(link);
          }
        });
    }
    });

    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: dilatedLinks };
  }
}

//Function that performs erosion 
//The idea behind erosion is to find the largest portion of the subgraph when dilated with the SE does not exceed the sturcture of the subgraph
// Takes in Similar params like the dilation function and returns similar output, making it consitent and helps with rendering client side
function erosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SE){
  if (SE == 'Single Node'){
    return { dilatedNodes: selectedNodes, dilatedLinks: null }
  }
  else if (SE == 'cross shaped(No Edges)'){
    const newSelectedNodes = new Set(); // Use a Set for efficient lookups and to avoid duplicates
    selectedNodes.forEach(nodeId => {
      var AllNeighboursExist = true;
      const neighbors = getNeighbors(nodeId,rows,cols);
      if (neighbors.length != 4){
        AllNeighboursExist = false;
      }
      neighbors.forEach(neighbor => {
        if (!selectedNodes.includes(neighbor)) {
          AllNeighboursExist = false;
        }
      });
      if(AllNeighboursExist){
        newSelectedNodes.add(nodeId);
      }
    });

    // Convert the Set back to an array for the response
    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: null };

  }

  //origin is the node followed by the edge and its right node
  // N==N
  // *
  else if (SE == 'Node + Edge + RNode'){
    const newSelectedNodes = new Set();
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      // if R neighbour exists and present in the selected nodes 
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+1) && selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)){
          newSelectedNodes.add(nodeId);
      }
    });
    // Convert the Set back to an array for the response
    const dilatedSelectedNodes = Array.from(newSelectedNodes);
    return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: null };
  }
}

function customDilation(rows, cols, selectedNodes, selectedLinks, nodes, links, originId, originType, SENodes, SELinks) {
  // Placeholder for calculatePositions function
  let rpNodes, rpLinks;
  console.log(originType);

  if (originType == 'node') {
    ({ rpNodes, rpLinks } = calculatePositionsNC(originId, SENodes, SELinks, rows, cols));
      // Prepare new sets to hold the results of dilation
      const dilatedNodes = new Set();
      const dilatedLinks = [];

      // Apply the structuring element to each selected node
      selectedNodes.forEach(nodeId => {
        // Apply each relative position of SE nodes to the current node
        rpNodes.forEach(({ relativePosition }) => {
          const newRow = Math.floor(nodeId / cols) + relativePosition.y;
          const newCol = nodeId % cols + relativePosition.x;
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const newNodeId = newRow * cols + newCol;
            dilatedNodes.add(newNodeId);
          }
        });

        // Apply the structuring element's links to each selected node if applicable
        rpLinks.forEach(({ sourceRelativePosition, targetRelativePosition }) => {
          // Calculate new positions for source and target
          const sourceRow = Math.floor(nodeId / cols) + sourceRelativePosition.y;
          const sourceCol = nodeId % cols + sourceRelativePosition.x;
          const targetRow = Math.floor(nodeId / cols) + targetRelativePosition.y;
          const targetCol = nodeId % cols + targetRelativePosition.x;
      
          // Ensure both source and target positions are within bounds
          if (sourceRow >= 0 && sourceRow < rows && sourceCol >= 0 && sourceCol < cols &&
              targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
            
            const newSourceId = sourceRow * cols + sourceCol;
            const newTargetId = targetRow * cols + targetCol;
      
            // Check if a link exists between the new source and target
            const existingLink = links.find(link => 
              (link.source === newSourceId && link.target === newTargetId) 
              //  (link.source === newTargetId && link.target === newSourceId) // Depending on if your graph is directed or undirected
            );
      
            // If the link exists, add it to the set of dilated links
            if (existingLink) {
              dilatedLinks.push(existingLink);
            }
          }
        });
      });
      
      // Convert sets back to arrays for the response
      const dilatedNodesArray = Array.from(dilatedNodes);

      return { dilatedNodes: dilatedNodesArray, dilatedLinks: dilatedLinks };
  }

  else if (originType == 'Horizontal') {
    const parts = originId.split('-');
    const eNode = parseInt(parts[2], 10); // This converts "12" to the integer 12

    ({ rpNodes, rpLinks } = calculatePositionsNC(eNode, SENodes, SELinks, rows, cols));
    // Prepare new sets to hold the results of dilation
    const dilatedNodes = new Set();
    const dilatedLinks = [];

    // Apply the structuring element to each selected node
    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      const neighborsR = getNeighbors(nodeId+1,rows,cols);
      //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+1) &&  selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)){
        dilatedNodes.add(nodeId);
        dilatedNodes.add(nodeId+1);
        dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+1}-${nodeId}`));

        neighbors.forEach(neighbor => {
          if (!dilatedNodes.has(neighbor)) {
            dilatedNodes.add(neighbor);
          }
        });

        neighborsR.forEach(neighbor => {
          if (!dilatedNodes.has(neighbor)) {
            dilatedNodes.add(neighbor);
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
            dilatedLinks.push(link);
          }
        });
        
        const connectedLinksR = getConnectedLinks(nodeId+1, links);
        connectedLinksR.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (!linkExistsInSelectedR) {
            dilatedLinks.push(link);
          }
        });

              // Apply each relative position of SE nodes to the current node
      rpNodes.forEach(({ relativePosition }) => {
        const newRow = Math.floor(nodeId / cols) + relativePosition.y;
        const newCol = nodeId % cols + relativePosition.x;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          const newNodeId = newRow * cols + newCol;
          dilatedNodes.add(newNodeId);
        }
      });

      // Apply the structuring element's links to each selected node if applicable
      rpLinks.forEach(({ sourceRelativePosition, targetRelativePosition }) => {
        // Calculate new positions for source and target
        const sourceRow = Math.floor(nodeId / cols) + sourceRelativePosition.y;
        const sourceCol = nodeId % cols + sourceRelativePosition.x;
        const targetRow = Math.floor(nodeId / cols) + targetRelativePosition.y;
        const targetCol = nodeId % cols + targetRelativePosition.x;
    
        // Ensure both source and target positions are within bounds
        if (sourceRow >= 0 && sourceRow < rows && sourceCol >= 0 && sourceCol < cols &&
            targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
          
          const newSourceId = sourceRow * cols + sourceCol;
          const newTargetId = targetRow * cols + targetCol;
    
          // Check if a link exists between the new source and target
          const existingLink = links.find(link => 
            (link.source === newSourceId && link.target === newTargetId) 
            //  (link.source === newTargetId && link.target === newSourceId) // Depending on if your graph is directed or undirected
          );
          // If the link exists, add it to the set of dilated links
          if (existingLink) {
            dilatedLinks.push(existingLink);
          }
        }
      });
    }

    });
    
    // Convert sets back to arrays for the response
    const dilatedNodesArray = Array.from(dilatedNodes);

    return { dilatedNodes: dilatedNodesArray, dilatedLinks: dilatedLinks };
  }

  else if (originType =='Vertical'){
    const parts = originId.split('-');
    const eNode = parseInt(parts[2], 10); 
    console.log('Here');

    ({ rpNodes, rpLinks } = calculatePositionsNC(eNode, SENodes, SELinks, rows, cols));
    // Prepare new sets to hold the results of dilation
    const dilatedNodes = new Set();
    const dilatedLinks = [];

    selectedNodes.forEach(nodeId => {
      const neighbors = getNeighbors(nodeId,rows,cols);
      const neighborsB = getNeighbors(nodeId+cols,rows,cols);
      //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
      if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+cols) && selectedLinks.some(link => link.id === `link-${nodeId+cols}-${nodeId}`)){
        dilatedNodes.add(nodeId);
        dilatedNodes.add(nodeId+cols);
        dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+cols}-${nodeId}`));
        neighbors.forEach(neighbor => {
          if (!dilatedNodes.has(neighbor)) {
            dilatedNodes.add(neighbor);
          }
        });

        neighborsB.forEach(neighbor => {
          if (!dilatedNodes.has(neighbor)) {
            dilatedNodes.add(neighbor);
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
            dilatedLinks.push(link);
          }
        });
        
        const connectedLinksB = getConnectedLinks(nodeId+cols, links);
        connectedLinksB.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (!linkExistsInSelectedR) {
            dilatedLinks.push(link);
          }
        });

      // Apply each relative position of SE nodes to the current node
      rpNodes.forEach(({ relativePosition }) => {
        const newRow = Math.floor(nodeId / cols) + relativePosition.y;
        const newCol = nodeId % cols + relativePosition.x;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          const newNodeId = newRow * cols + newCol;
          dilatedNodes.add(newNodeId);
        }
      });

      // Apply the structuring element's links to each selected node if applicable
      rpLinks.forEach(({ sourceRelativePosition, targetRelativePosition }) => {
        // Calculate new positions for source and target
        const sourceRow = Math.floor(nodeId / cols) + sourceRelativePosition.y;
        const sourceCol = nodeId % cols + sourceRelativePosition.x;
        const targetRow = Math.floor(nodeId / cols) + targetRelativePosition.y;
        const targetCol = nodeId % cols + targetRelativePosition.x;
    
        // Ensure both source and target positions are within bounds
        if (sourceRow >= 0 && sourceRow < rows && sourceCol >= 0 && sourceCol < cols &&
            targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
          
          const newSourceId = sourceRow * cols + sourceCol;
          const newTargetId = targetRow * cols + targetCol;
    
          // Check if a link exists between the new source and target
          const existingLink = links.find(link => 
            (link.source === newSourceId && link.target === newTargetId) 
            //  (link.source === newTargetId && link.target === newSourceId) // Depending on if your graph is directed or undirected
          );  
          // If the link exists, add it to the set of dilated links
          if (existingLink) {
            dilatedLinks.push(existingLink);
          }
        }
      });
    }
    });
    // Convert sets back to arrays for the response
    const dilatedNodesArray = Array.from(dilatedNodes);
    return { dilatedNodes: dilatedNodesArray, dilatedLinks: dilatedLinks };
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
  return connectedLinks;
}



// Calculate relative positions (When the origin is a node)
const calculatePositionsNC = (originNode, nodes, links, rows, cols) => {
  const { row: originRow, col: originCol } = getRowCol(originNode, cols);
  // Calculate relative positions for nodes
  const rpNodes = nodes.map(node => {
    const { row, col } = getRowCol(node, cols);
    return {
      nodeId: node,
      relativePosition: { x: col - originCol, y: row - originRow }
    };
  });

  // Calculate relative positions for links
  const rpLinks = links.map(link => {
    const { row: sourceRow, col: sourceCol } = getRowCol(link.source, cols);
    const { row: targetRow, col: targetCol } = getRowCol(link.target, cols);
    return {
      linkId: link.id,
      sourceRelativePosition: { x: sourceCol - originCol, y: sourceRow - originRow },
      targetRelativePosition: { x: targetCol - originCol, y: targetRow - originRow },
      edgetype: link.edgetype
    };
  });

  return { rpNodes, rpLinks };
};

// Function to get row and col for a node ID
const getRowCol = (nodeId, cols) => {
  const row = Math.floor(nodeId / cols);
  const col = nodeId % cols;
  return { row, col };
};


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
