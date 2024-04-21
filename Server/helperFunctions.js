// The collection of helper functions that are called when performing MM

//given a node and the structure of the grid,
//Retrieves all possible neighbours in the form of an array
export function getNeighbors(nodeId, rows, cols) {
    const neighbors = [];

    // Check if nodeId, rows, and cols are positive integers
    if (!Number.isInteger(nodeId) || nodeId < 0 || !Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
      throw new Error('nodeId, rows, and cols must be positive integers');
    }
    const row = Math.floor(nodeId / cols);
    const col = nodeId % cols;

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
   
  export function getConnectedLinks(nodeId, links) {
    if (!Number.isInteger(nodeId) || nodeId < 0 ) {
      throw new Error('nodeId must be a positive integer');
    }
     // Filter links where the current nodeId is either the source or the target
     const connectedLinks = links.filter(link => link.source === nodeId || link.target === nodeId);  
     return connectedLinks;
   }
   
   

   // Calculate relative positions (When the origin is a node)
   export const calculatePositionsNC = (originNode, nodes, links, rows, cols) => {
    // Check if nodeId, rows, and cols are positive integers
    if (!Number.isInteger(originNode) || originNode < 0 || !Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
      throw new Error('origin node, rows, and cols must be positive integers');
    }

    const { row: originRow, col: originCol } = getRowCol(originNode, cols);

    // Calculate relative positions for nodes
    const rpNodes = nodes.map(node => {
      const { row, col } = getRowCol(node, cols);

      return {
        nodeId: node,
        relativePosition: { x: col - originCol, y: row - originRow }
      };
    });
  
    // Calculate relative positions for edges
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
  export const getRowCol = (nodeId, cols) => {
  const row = Math.floor(nodeId / cols);
  const col = nodeId % cols;
  return { row, col };
  };
  
   

   