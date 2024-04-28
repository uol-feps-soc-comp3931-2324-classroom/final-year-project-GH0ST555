import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


const GridComponent = ({ rows, cols, nodes, links }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && nodes && links) {
      d3.select(d3Container.current).selectAll("*").remove();

      const cellSize = 50; // This remains constant for node visualization
      const margin = { top: 30, right: 30, bottom: 30, left: 30 };
      const additionalDistance = 50; // Additional distance between nodes
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

      // Calculate the position of each node in the SVG image
      nodes.forEach(node => {
        const nodeRow = Math.floor(node.id / cols);
        const nodeCol = node.id % cols;
        node.x = nodeCol * gap + gap / 2; // Calculate X position
        node.y = nodeRow * gap + gap / 2; // Calculate Y position
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
  }, [nodes, links, rows, cols]); // Updated dependency array, Reruns when any of the values change

  return <div ref={d3Container} />;
};

export default GridComponent;
