import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//This is the Grid Component.
const GridComponent = ({ size, nodes, links }) => {
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
      svg.selectAll(".edge")
        .data(links)
        .enter()
        .append("line")
        .attr("x1", d => nodes[d.source].x)
        .attr("y1", d => nodes[d.source].y)
        .attr("x2", d => nodes[d.target].x)
        .attr("y2", d => nodes[d.target].y)
        .attr("stroke", "black")
        .attr("class", "edge")
        .on("click", function(event, d) {
            // Handle click event on nodes
            console.log("Edge clicked", d);
          });

      // Draw the nodes (circles)
      svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 10)
        .attr("fill", "black")
        .attr("class", "node")
        .on("click", function(event, d) {
          // Handle click event on nodes
          console.log("Node clicked", d);
        });

    }
  }, [nodes, links, size]); // Dependency array to re-run the effect when the data changes

  return (
    <div ref={d3Container} />
  );
};

export default GridComponent;
