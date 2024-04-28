import { getNeighbors,calculatePositionsNC } from "./helperFunctions.js";
// This file contains the code that is responsible for the 4 MM operations that use a 3 part custom structuring element.

//A custom dilation when the user inputs their own structuring element
export function customDilation(rows, cols, selectedNodes, selectedLinks, nodes, links, SEData) {
    // Placeholder for calculatePositions function
    let rpNodes, rpLinks;
    const{selectedOrigin,selectedSENodes,selectedSELinks,selectedHOrigin,selectedHSENodes,selectedHSELinks,selectedVOrigin,selectedVSENodes,selectedVSELinks} = SEData;
    // Prepare data to hold the results of dilation
    const dilatedNodes = new Set();
    const dilatedLinks = [];
  
    //if the selected origin exists(node case)
    if (selectedOrigin) {
      ({ rpNodes, rpLinks } = calculatePositionsNC(selectedOrigin.id, selectedSENodes, selectedSELinks, rows, cols));
        // Apply the structuring element to each selected node
        selectedNodes.forEach(nodeId => {
          // Apply each relative position of SE nodes to the current node
          rpNodes.forEach(({ relativePosition }) => {
            const newRow = Math.floor(nodeId / cols) + relativePosition.y;
            const newCol = nodeId % cols + relativePosition.x;
            const addNode = !(relativePosition.y==0 && relativePosition.x==0 && selectedOrigin.add !=='yes')
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && addNode) {
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
              const existingLink = links.find(link => (link.source === newSourceId && link.target === newTargetId) );
        
              // If the link exists, add it to the set of dilated links
              if (existingLink) {
                dilatedLinks.push(existingLink);
              }
            }
          });
        });
    }
  
    if (selectedHOrigin) {
      const parts = selectedHOrigin.id.split('-');
      const eNode = parseInt(parts[2], 10); // This converts string to integer
  
      ({ rpNodes, rpLinks } = calculatePositionsNC(eNode, selectedHSENodes, selectedHSELinks, rows, cols));
      // Prepare new sets to hold the results of dilation
  
      // Apply the structuring element to each selected node
      selectedNodes.forEach(nodeId => {
        const neighbors = getNeighbors(nodeId,rows,cols);
        const neighborsR = getNeighbors(nodeId+1,rows,cols);
        //A node, its neighbour and its edge needs to be present to perfrom dilation in this case
        if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+1) &&  selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)){
          dilatedNodes.add(nodeId);
          dilatedNodes.add(nodeId+1);
          dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+1}-${nodeId}`));
  
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
            const existingLink = links.find(link => (link.source === newSourceId && link.target === newTargetId) );
            // If the link exists, add it to the set of dilated links
            if (existingLink) {
              dilatedLinks.push(existingLink);
            }
          }
        });
      }
    });
  }
    if (selectedVOrigin){
      const parts = selectedVOrigin.id.split('-');
      const eNode = parseInt(parts[2], 10); //string to integer conversion 
  
      ({ rpNodes, rpLinks } = calculatePositionsNC(eNode, selectedVSENodes, selectedVSELinks, rows, cols));
  
  
      selectedNodes.forEach(nodeId => {
        const neighbors = getNeighbors(nodeId,rows,cols);
        const neighborsB = getNeighbors(nodeId+cols,rows,cols);
        //A node, its neighbour and its edge needs to be present to perfrom dilation in this case (Edtge has to be vertical)
        if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+cols) && selectedLinks.some(link => link.id === `link-${nodeId+cols}-${nodeId}`)){
          dilatedNodes.add(nodeId);
          dilatedNodes.add(nodeId+cols);
          dilatedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+cols}-${nodeId}`));
  
  
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
            const existingLink = links.find(link => (link.source === newSourceId && link.target === newTargetId));  
            // If the link exists, add it to the set of dilated links
            if (existingLink) {
              dilatedLinks.push(existingLink);
            }
          }
        });
      }
      });
    }
      // Convert sets back to arrays for the response
      const dilatedNodesArray = Array.from(dilatedNodes);
      return { dilatedNodes: dilatedNodesArray, dilatedLinks: dilatedLinks };
  }
  
  //a function that handles erosion when the SE is user inputted
 export function customErosion(rows, cols, selectedNodes, selectedLinks, nodes, links, SEData)
  {
    let rpNodes, rpLinks;
    // if the subgraph is null, the whole grid will now be the result
    if(selectedNodes.length == 0 && selectedLinks.length == 0){
      const nodesArray = [];
      nodes.forEach(nodeId => {
        nodesArray.push(nodeId.id);
      });
      return {erodedNodes: nodesArray,erodedLinks: links}
    }
  
    const{selectedOrigin,selectedSENodes,selectedSELinks,selectedHOrigin,selectedHSENodes,selectedHSELinks,selectedVOrigin,selectedVSENodes,selectedVSELinks} = SEData;
  
    // Prepare new arrays to hold the results of erosion
    const erodedNodes = [];
    const erodedLinks = [];
  
    if (selectedOrigin){
      ({ rpNodes, rpLinks } = calculatePositionsNC(selectedOrigin.id, selectedSENodes, selectedSELinks, rows, cols));
        // We see all selected nodes to check if the SE is within the subgraph
        selectedNodes.forEach(nodeId => {
          let add_flag = true;
          // Apply each relative position of SE nodes to the current node
          rpNodes.forEach(({ relativePosition }) => {
            const newRow = Math.floor(nodeId / cols) + relativePosition.y;
            const newCol = nodeId % cols + relativePosition.x;
            const addNode = !(relativePosition.y==0 && relativePosition.x==0 && addOrigin !=='yes')
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && addNode) { //to check if within bounds
              const newNodeId = newRow * cols + newCol;
              if (!selectedNodes.includes(newNodeId)){ // check if the relative node is within the subgraph
                add_flag = false
              }
            }
            else{
              add_flag = false;
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
              const existingLink = selectedLinks.some(link => (link.source === newSourceId && link.target === newTargetId));
        
              // If the link doesn't exist, set the flag to false
              if (!existingLink) {
               add_flag = false;
              }
            }
          });
          //if all the nodes and edges are within the subgaph we add that node
          if (add_flag == true){
            erodedNodes.push(nodeId);
          }
        });
    }
  
    if (selectedHOrigin) {
      const parts = selectedHOrigin.id.split('-');
      const eNode = parseInt(parts[2], 10); // This converts string to integer
  
      ({ rpNodes, rpLinks } = calculatePositionsNC(eNode, selectedHSENodes, selectedHSELinks, rows, cols));
      // Apply the structuring element to each selected node
      selectedNodes.forEach(nodeId => {
        let add_flag = true;
        const neighbors = getNeighbors(nodeId,rows,cols);
        const neighborsR = getNeighbors(nodeId+1,rows,cols);
        //A node, its neighbour and its edge needs to be present to perfrom erosion in this case
        if(neighbors.includes(nodeId+1) && selectedNodes.includes(nodeId+1) &&  selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)){
  
        // Apply each relative position of SE nodes to the current node
        rpNodes.forEach(({ relativePosition }) => {
          const newRow = Math.floor(nodeId / cols) + relativePosition.y;
          const newCol = nodeId % cols + relativePosition.x;
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols ) { //to check if within bounds
            const newNodeId = newRow * cols + newCol;
            if (!selectedNodes.includes(newNodeId)){ // check if the relative node is within the subgraph
              add_flag = false
            }
          }
          else{
            add_flag = false;
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
            const existingLink = links.find(link => (link.source === newSourceId && link.target === newTargetId) );
            // If the link does not exist, set the add flag to false
            if (!existingLink) {
              add_flag = false;
            }
          }
        });
  
        if (add_flag == true){
          erodedNodes.push(nodeId);
          erodedNodes.push(nodeId+1);
          erodedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+1}-${nodeId}`));
        }
      }
  
    });
    }
  
    if (selectedVOrigin) {
      const parts = selectedVOrigin.id.split('-');
      const eNode = parseInt(parts[2], 10); // This converts string to integer
  
      ({ rpNodes, rpLinks } = calculatePositionsNC(eNode, selectedVSENodes, selectedVSELinks, rows, cols));
      // Apply the structuring element to each selected node
      selectedNodes.forEach(nodeId => {
        let add_flag = true;
        const neighbors = getNeighbors(nodeId,rows,cols);
        const neighborsR = getNeighbors(nodeId+1,rows,cols);
        //A node, its neighbour and its edge needs to be present to perfrom erosion in this case
        if(neighbors.includes(nodeId+cols) && selectedNodes.includes(nodeId+cols) &&  selectedLinks.some(link => link.id === `link-${nodeId+cols}-${nodeId}`)){
  
        // Apply each relative position of SE nodes to the current node
        rpNodes.forEach(({ relativePosition }) => {
          const newRow = Math.floor(nodeId / cols) + relativePosition.y;
          const newCol = nodeId % cols + relativePosition.x;
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols ) { //to check if within bounds
            const newNodeId = newRow * cols + newCol;
            if (!selectedNodes.includes(newNodeId)){ // check if the relative node is within the subgraph
              add_flag = false
            }
          }
          else{
            add_flag = false;
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
            const existingLink = links.find(link => (link.source === newSourceId && link.target === newTargetId) );
            // If the link does not exist, set the add flag to false
            if (!existingLink) {
              add_flag = false;
            }
          }
        });
  
        if (add_flag == true){
          erodedNodes.push(nodeId);
          erodedNodes.push(nodeId+cols);
          erodedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId+cols}-${nodeId}`));
        }
      }
  
      });
      
    }
    return { erodedNodes: erodedNodes, erodedLinks: erodedLinks };
  }
  
  //similar to opening but calling the custom versions of erosion followed by dilation
  export function customOpening(rows, cols, selectedNodes, selectedLinks, nodes, links, SEData)
  {
    const{erodedNodes,erodedLinks} = customErosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SEData);
    const{dilatedNodes,dilatedLinks} = customDilation(rows,cols,erodedNodes,erodedLinks,nodes,links,SEData);
    return { resultNodes: dilatedNodes, resultLinks: dilatedLinks };
  }
  
  //similar to closing but calling the custom versions of dilation followed by erosion
  export function customClosing(rows, cols, selectedNodes, selectedLinks, nodes, links, SEData)
  {
    const{erodedNodes,erodedLinks} = customErosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SEData);
    const{dilatedNodes,dilatedLinks} = customDilation(rows,cols,erodedNodes,erodedLinks,nodes,links,SEData);
    return { resultNodes: dilatedNodes, resultLinks: dilatedLinks };
  }