import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//This is the SE Selector Component.
//Takes in the data from the endpoint and uses d3 to create a visual of the Structuring Element enclosed in an svg
//This component is explicitly used for Selecting the Subgraphs
//Idea being when the particular edges are clicked color changes
//Makes it easier to display the subgraph as i can then conditionally display the nodes and edges with that particular color
const SESelector = ({ rows,cols, nodes, links,onNodeSelect, onLinkSelect,scenario }) => {
  // Reference to the container where the SVG will be appended
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && nodes && links) {
      // Clear any existing SVG to avoid duplicates
      d3.select(d3Container.current).selectAll("*").remove();

      // Base cell size
      const cellSize = 50; // This remains constant for node visualization
      const margin = { top: 30, right: 30, bottom: 30, left: 30 };

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

      // Adjust node positions based on the increased gap
      nodes.forEach(node => {
        const nodeRow = Math.floor(node.id / cols);
        const nodeCol = node.id % cols;
        node.x = nodeCol * gap + gap / 2; // Adjust for horizontal position
        node.y = nodeRow * gap + gap / 2; // Adjust for vertical position
      });
      

      // Draw the links (lines)
      //added a class attribte and event handler for clicking to identify edge was clicked
      svg.selectAll(".edge")
        .data(links, d => d.id)
        .enter()
        .append("line")
        .attr("x1", d => nodes[d.source].x)
        .attr("y1", d => nodes[d.source].y)
        .attr("x2", d => nodes[d.target].x)
        .attr("y2", d => nodes[d.target].y)
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("id", d => d.id)
        .attr("class", "edge")
        .on("click", function(event, d) {
            // Handle click event on edges
            const currentColor = d3.select(this).attr("stroke");
            const newColor = currentColor === "black" ? "red" : "black";
            d3.select(this).attr("stroke", newColor);
            onLinkSelect(d,scenario);
          });

      // Draw the nodes (circles)
      svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", cellSize/4)
        .attr("fill", "black")
        .attr("class", "node")
        .on("click", function(event, d) {
          // Handle click event on nodes
          const currentColor = d3.select(this).attr("fill");
          const newColor = currentColor === "black" ? "red" : "black";
          d3.select(this).attr("fill", newColor);
          onNodeSelect(d,scenario);
        });

    }
  }, [nodes, links, rows,cols]); // Dependency array to re-run the effect when the data changes

  return (
    <div ref={d3Container} />
  );
};

export default SESelector;