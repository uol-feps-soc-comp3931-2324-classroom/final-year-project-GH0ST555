import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


//This is the SE Selector Component.
//Takes in the data from the endpoint and uses d3 to create a visual of the Structuring Element enclosed in an svg
//Makes it easier to display the subgraph as i can then conditionally display the nodes and edges with that particular color
const SEComponent = ({ rows,cols, nodes, links,selectedNodes, selectedLinks , selectedOrigin}) => {
  // Reference to the container where the SVG will be appended
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && nodes && links) {
      // Clear any existing SVG to avoid duplicates
      d3.select(d3Container.current).selectAll("*").remove();

      // Base cell size
      const cellSize = 40; // This remains constant for node visualization
      const margin = { top: 0, right: 30, bottom: 0, left: 0 };

      // Increase the distance between nodes dynamically
      // For example, add an additional distance based on the grid size
      const additionalDistance = 50;
      const gap = cellSize + additionalDistance;

      // Calculate dynamic SVG dimensions
      const width = cols * gap + margin.left + margin.right - additionalDistance;
      const height = rows * gap + margin.top + margin.bottom - additionalDistance;

      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      //Calculate the porsition for each node within the image
      nodes.forEach(node => {
        const nodeRow = Math.floor(node.id / cols);
        const nodeCol = node.id % cols;
        node.x = nodeCol * gap + gap / 2; // Calculate X position
        node.y = nodeRow * gap + gap / 2; // Calculate Y position
      });
      

      // Draw the edges (lines)
      //added a class attribte and event handler for clicking to identify edge was clicked
      svg.selectAll(".edge")
        .data(links, d => d.id)
        .enter()
        .append("line")
        .attr("x1", d => nodes[d.source].x)
        .attr("y1", d => nodes[d.source].y)
        .attr("x2", d => nodes[d.target].x)
        .attr("y2", d => nodes[d.target].y)
        .attr("stroke", d => selectedOrigin && selectedOrigin.type != 'node' && selectedOrigin.id === d.id ? "green" : "black")
        .attr("stroke-width", 3)
        .attr("id", d => d.id)
        .attr("class", "edge")
        .attr("opacity", d => selectedLinks.some(link => link.source === d.source && link.target === d.target) ? 1 : 0)


      // Draw the nodes (circles)
      svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", cellSize/4)
        .attr("fill", d => {
          // Check if the node is the selected origin
          const isOrigin = selectedOrigin && selectedOrigin.id === d.id;
          // Check if the node is included in the selected nodes
          const isSelected = selectedNodes.includes(d.id);
        
          if (isOrigin && isSelected) {
            // If the node is the origin and selected, make it green
            return "green";
          } else if (isOrigin && !isSelected) {
            // If the node is the origin but not selected, make it orange
            return "orange";
          } else {
            // If the node is not the origin, keep it black
            return "black";
          }
        })
        
        .attr("class", "node")
        .attr("opacity", d => selectedNodes.includes(d.id) || selectedOrigin.id === d.id ? 1 : 0);

    }
  }, [nodes, links, rows,cols,selectedNodes, selectedLinks , selectedOrigin]); // Dependency array to re-run the effect when the data changes

  return (

    <div ref={d3Container} />

  );
};

export default SEComponent;
