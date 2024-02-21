import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

//The Component Used To Describe the Grid
const GridComponent = ({ size, nodes, links }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && nodes && links) {
      d3.select(d3Container.current).selectAll("*").remove();

      // Base cell size
      const cellSize = 50; // This remains constant for node visualization
      const margin = { top: 30, right: 30, bottom: 30, left: 30 };

      // Increase the distance between nodes
      const additionalDistance = 50;
      const gap = cellSize + additionalDistance;

      // Calculate dynamic SVG dimensions based on the new gap
      const width = size * gap + margin.left + margin.right - additionalDistance; // Adjust for the gap in the last cell
      const height = size * gap + margin.top + margin.bottom - additionalDistance;

      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Adjust node positions based on the increased gap
      nodes.forEach(node => {
        node.x = (node.id % size) * gap + gap / 2; // Center nodes within the increased gap
        node.y = Math.floor(node.id / size) * gap + gap / 2;
      });

      // Draw the edges (lines)
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
        .attr("class", "edge");

      // Draw the nodes (circles)
      svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", cellSize / 4) 
        .attr("fill", "black")
        .attr("class", "node");

    }
  }, [nodes, links, size]); // Dependency array to re-run the effect when the data changes

  return <div ref={d3Container} />;
};

export default GridComponent;
