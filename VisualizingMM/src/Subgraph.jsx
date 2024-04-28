import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//The component that will display the subgraph
const SubgraphComponent = ({ rows,cols, nodes, links,selectedNodes, selectedLinks }) => {
  // Reference to the container where the SVG will be appended
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && nodes && links) {
      // Clear any existing SVG to avoid duplicates
      d3.select(d3Container.current).selectAll("*").remove();

        // Base cell size
        const cellSize = 50;
        const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  
        // Increase the distance between nodes dynamically
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
          node.x = nodeCol * gap + gap / 2; // Calclulate X position
          node.y = nodeRow * gap + gap / 2; // Calculate Y position
        });

      // Fallback to an empty array if selectedLinks or selectedNodes is null
      //This prevents console errors
      const safeSelectedLinks = selectedLinks || [];
      const safeSelectedNodes = selectedNodes || [];

      // Draw the edges (lines)
      svg.selectAll(".edge")
          .data(links)
          .enter()
          .append("line")
          .attr("x1", d => nodes[d.source].x)
          .attr("y1", d => nodes[d.source].y)
          .attr("x2", d => nodes[d.target].x)
          .attr("y2", d => nodes[d.target].y)
          .attr("stroke", d => safeSelectedLinks.some(link => link.source === d.source && link.target === d.target) ? 'blue' : 'black')
          .attr("stroke-width", 3)
          .attr("id", d => d.id)
          .attr("class", "edge");

      // Draw the nodes (circles)
      svg.selectAll(".node")
          .data(nodes)
          .enter()
          .append("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", cellSize / 4)
          .attr("fill", d => safeSelectedNodes.includes(d.id) ? "blue" : "black")
          .attr("class", "node");

          }
  }, [nodes, links, rows,cols]); // Dependency array to re-run the effect when the data changes

  return (
    <div ref={d3Container}/>
  );
};

export default SubgraphComponent;
