import { getNeighbors,getConnectedLinks } from "./helperFunctions.js";

//This code handles the 4 MM operations dilation, erosion, opening and closing for cases where the SE is predefined

//perform dilation on predefined cases
//The idea is to match the orign SE to elemtents of the subgraph
//if there is match, the SE is added to the subgraph
export function dilation(rows,cols,selectedNodes,selectedLinks, nodes, links, SE){
    //Single Node SE, Nodes are dilated, removing edges
    if (SE == 'Single Node'){
      return { dilatedNodes: selectedNodes, dilatedLinks: null }
    }
  
    //Origin is at the center
    //Means That all neighbours that are not in the subgraph are added in this case of dilation
    else if (SE == 'cross shaped(No Edges)'){
      const newSelectedNodes = new Set(selectedNodes); 
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
  
    //origin is the node
    //The SE consists of its right neighbour and the horizontal edge connecting the 2 nodes
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
            const linkbwNodes = `link-${nodeId+1}-${nodeId}`
            const linkObject = links.find(link => link.id === linkbwNodes);
            if (linkObject != null) {
              dilatedLinks.push(linkObject); 
            }
        }
  
        //if R neighbour Exists and Is present in selected nodes. We still need to check if the edge between them exists
        else if(neighbors.includes(nodeId+1) && newSelectedNodes.has(nodeId+1)){
          const linkbwNodes = `link-${nodeId+1}-${nodeId}`
          const linkObject = links.find(link => link.id === linkbwNodes);
          if (linkObject!= null && selectedLinks && !selectedLinks.some(link => link.id === linkbwNodes)) {
            dilatedLinks.push(linkObject); 
          }
      }
  
      });
  
      // Convert the Set back to an array for the response
      const dilatedSelectedNodes = Array.from(newSelectedNodes);
      return { dilatedNodes: dilatedSelectedNodes, dilatedLinks: dilatedLinks };
    }
  
  
  
    else if (SE == 'Horizontal Edge'){
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
  export function erosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SE){
    // if the subgraph is null, the whole grid will now be the result
    if(selectedNodes.length == 0 && selectedLinks.length == 0){
      const nodesArray = [];
      nodes.forEach(nodeId => {
        nodesArray.push(nodeId.id);
      });
      return {erodedNodes: nodesArray,erodedLinks: links}
    }
    if (SE == 'Single Node'){
      return { erodedNodes: selectedNodes, erodedLinks: null }
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
      const erodedSelectedNodes = Array.from(newSelectedNodes);
      return { erodedNodes: erodedSelectedNodes, erodedLinks: null };
  
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
      const erodedSelectedNodes = Array.from(newSelectedNodes);
      return { erodedNodes: erodedSelectedNodes, erodedLinks: null };
    }
  
    else if (SE == 'Horizontal Edge') {
      const erodedNodes = [];
      const erodedLinks = [];
      // console.log(selectedNodes);
      // console.log(selectedLinks);
      selectedNodes.forEach(nodeId => {
          let add_flag = true;
          let count = 0;
          let countr = 0;
          const neighbors = getNeighbors(nodeId, rows, cols);
          const neighborsR = getNeighbors(nodeId + 1, rows, cols);
          //The required pattern must be present to perform erosion in this case
          if (neighbors.includes(nodeId + 1) && selectedNodes.includes(nodeId + 1) && selectedLinks.some(link => link.id === `link-${nodeId+1}-${nodeId}`)) {
            neighbors.forEach(neighbor => {
                if (!selectedNodes.includes(neighbor)) {
                    add_flag = false;
                }
            });
  
            neighborsR.forEach(neighbor => {
                if (!selectedNodes.includes(neighbor)) {
                    add_flag = false;
                }
            });
              
          //start with left side of this process.
          //Add all neigbours of the Node
          const connectedLinks = getConnectedLinks(nodeId, links);
          connectedLinks.forEach(link => {
            // Check if the link exists in selectedLinks by comparing link ids
            const linkExistsInSelected = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          
            // If the link is not already in selectedLinks, add it
            if (linkExistsInSelected) {
              count = count + 1;
            }
          });
          
          const connectedLinksR = getConnectedLinks(nodeId+1, links);
          connectedLinksR.forEach(link => {
            const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
            if (linkExistsInSelectedR) {
             countr = countr + 1
            }
          });
          if (add_flag === true  && count==4 && countr == 4) {
              erodedNodes.push(nodeId);
              erodedNodes.push(nodeId + 1);
              erodedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId + 1}-${nodeId}`));
          }
          }
      });
      return { erodedNodes: erodedNodes, erodedLinks: erodedLinks };
  }
  
  else if (SE == 'Vertical Edge') {
    const erodedNodes = [];
    const erodedLinks = [];
    selectedNodes.forEach(nodeId => {
        let add_flag = true;
        let count = 0;
        let countr = 0;
        const neighbors = getNeighbors(nodeId, rows, cols);
        const neighborsR = getNeighbors(nodeId + cols, rows, cols);
        //A node, its neighbour and its edge needs to be present to perform dilation in this case
        if (neighbors.includes(nodeId + 1) && selectedNodes.includes(nodeId + cols) && selectedLinks.some(link => link.id === `link-${nodeId+cols}-${nodeId}`)) {
          neighbors.forEach(neighbor => {
              if (!selectedNodes.includes(neighbor)) {
                  add_flag = false;
              }
          });
  
          neighborsR.forEach(neighbor => {
              if (!selectedNodes.includes(neighbor)) {
                  add_flag = false;
              }
          });
            
        //start with left side of this process.
        //Add all neigbours of the Node
        const connectedLinks = getConnectedLinks(nodeId, links);
        connectedLinks.forEach(link => {
          // Check if the link exists in selectedLinks by comparing link ids
          // console.log(selectedLinks.find(selectedLink => selectedLink.id === link.id));
          const linkExistsInSelected = selectedLinks.some(selectedLink => selectedLink.id === link.id);
        
          // If the link is not already in selectedLinks, add it
          if (linkExistsInSelected) {
            count = count + 1;
          }
        });
        
        //Same process for the right side
        const connectedLinksR = getConnectedLinks(nodeId+cols, links);
        connectedLinksR.forEach(link => {
          const linkExistsInSelectedR = selectedLinks.some(selectedLink => selectedLink.id === link.id);
          if (linkExistsInSelectedR) {
           countr = countr + 1
          }
        });

        //Only if all  the nodes and edges are within the subgraph, this section is executed.
        //Adds the origin to the resulting graph
        if (add_flag === true  && count==4 && countr == 4) {
            erodedNodes.push(nodeId);
            erodedNodes.push(nodeId + cols);
            erodedLinks.push(selectedLinks.find(link => link.id === `link-${nodeId + cols}-${nodeId}`));
        }
        }
    });
    return { erodedNodes: erodedNodes, erodedLinks: erodedLinks };
  }
  
  }
  
  //erosion followed by dilation results in opening
  //This function is for preset cases
  export function opening(rows,cols,selectedNodes,selectedLinks, nodes, links, SE){
    //Just call the erosion function first and use the nodes as the selected nodes in dilation
      const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SE);
      const{dilatedNodes,dilatedLinks} = dilation(rows,cols,erodedNodes,erodedLinks,nodes,links,SE);
      return { resultNodes: dilatedNodes, resultLinks: dilatedLinks };
  }
  
  
  //dilation followed by erosion results in opening
  //This function is for preset cases
  export function closing(rows,cols,selectedNodes,selectedLinks, nodes, links, SE){
    //Just call the dilation function first and use the nodes as the selected nodes in erosion
    const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);
      const{erodedNodes,erodedLinks} = erosion(rows,cols,dilatedNodes,dilatedLinks, nodes, links, SE);
      
      //the eroded nodes and edges are what we need to return 
      return { resultNodes: erodedNodes, resultLinks: erodedLinks };
  }
  