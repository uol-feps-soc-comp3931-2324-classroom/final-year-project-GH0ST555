import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//This is the Subgraph Component.
//Takes in the data from the endpoint and uses d3 to create a subgraph enclosed in an svg
//This component is explicitly used for Selecting the Subgraphs
//Idea being when the particular edges are clicked color changes
//Makes it easier to display the subgraph as i can then conditionally display the nodes and edges with that particular color
const SubgraphComponent = ({ size, nodes, links }) => {
  // Reference to the container where the SVG will be appended
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && nodes && links) {
      // Clear any existing SVG to avoid duplicates
      d3.select(d3Container.current).selectAll("*").remove();

      // Set dimensions and gap for the grid
      const width = 750;
      const height = 750;
      const gap = (width - 2 * 30) / (size + 1);

      // Create the SVG element
      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      // Set the positions of the nodes
      nodes.forEach(node => {
        node.x = (node.id % size) * gap + 30;
        node.y = Math.floor(node.id / size) * gap + 30;
      });

      // Draw the links (lines)
      //added a class attribte and event handler for clicking to identify edge was clicked
      svg.selectAll(".edge")
        .data(links)
        .enter()
        .append("line")
        .attr("x1", d => nodes[d.source].x)
        .attr("y1", d => nodes[d.source].y)
        .attr("x2", d => nodes[d.target].x)
        .attr("y2", d => nodes[d.target].y)
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("class", "edge")
        .on("click", function(event, d) {
            // Handle click event on nodes
            const currentColor = d3.select(this).attr("stroke");
            const newColor = currentColor === "black" ? "red" : "black"; // Change "red" to your preferred color
            d3.select(this).attr("stroke", newColor);
          });

      // Draw the nodes (circles)
      svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 12)
        .attr("fill", "black")
        .attr("class", "node")
        .on("click", function(event, d) {
          // Handle click event on nodes
          const currentColor = d3.select(this).attr("fill");
          const newColor = currentColor === "black" ? "red" : "black"; // Change "red" to your preferred color
          d3.select(this).attr("fill", newColor);
        });

    }
  }, [nodes, links, size]); // Dependency array to re-run the effect when the data changes

  return (
    <div ref={d3Container} />
  );
};

export default SubgraphComponent;
