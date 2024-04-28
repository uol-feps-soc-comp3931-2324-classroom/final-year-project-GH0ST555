import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const VSESelector = ({ rows, cols, nodes, links ,onLinkSelect,onNodeSelect,setSelectedOrigin, selectedOrigin,scenario, selectedNodes, selectedLinks }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current) {
      // Clear any existing SVG to avoid duplicates
      d3.select(d3Container.current).selectAll("*").remove();

      // Base cell size
      const cellSize = 50; // This remains constant for node visualization
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

      // Caclaulate position of each node in the SVG image
      nodes.forEach(node => {
        const nodeRow = Math.floor(node.id / cols);
        const nodeCol = node.id % cols;
        node.x = nodeCol * gap + gap / 2; // Calculate X position
        node.y = nodeRow * gap + gap / 2; // Calculate Y position
      });
      
      //to prevent null errors
      const safeSelectedLinks = selectedLinks || [];
      const safeSelectedNodes = selectedNodes || [];

      // Links rendering
      svg.selectAll(".edge")
         .data(links)
         .enter().append("line")
         .attr("x1", d => nodes[d.source].x)
         .attr("y1", d => nodes[d.source].y)
         .attr("x2", d => nodes[d.target].x)
         .attr("y2", d => nodes[d.target].y)
         .attr("stroke", d => {
            //Modidfied to allow only Vertical Edges as the origin
          if (selectedOrigin && selectedOrigin.type === d.edgetype && selectedOrigin.id === d.id && safeSelectedLinks.some(link => link.source === d.source && link.target === d.target )) return "green"; // Origin
          else if (safeSelectedLinks.some(link => link.source === d.source && link.target === d.target)) return "red"; // Selected but not the origin
          else return "black"; 
        })        
         .attr("stroke-width", 3)
         .attr("class", "edge")
         .on("contextmenu", (event, d) => {
            event.preventDefault();
            if (safeSelectedLinks.some(link => link.source === d.source && link.target === d.target && link.edgetype == 'Vertical')){
              const origin = { id: d.id, type: d.edgetype, add:'yes'}; //Edges as an origin always have to be added
              setSelectedOrigin(origin);
            }
         })
         .on("click", function(event, d) {
          // Handle click event on edges
          const currentColor = d3.select(this).attr("stroke");
          const newColor = currentColor === "black" ? "red" : "black";
          d3.select(this).attr("stroke", newColor);

          // Change node colors linked to the edge if they are un-selected only
          [d.source, d.target].forEach(nodeId => {
            const node = svg.selectAll(".node").filter(n => n.id === nodeId);
            const currentNodeColor = node.attr("fill");
            if (currentNodeColor === "black") {
              node.attr("fill", "red");
            }
          });
          onLinkSelect(d,scenario,d.source,d.target);
        });

      // Nodes rendering remmains the same as Subgraph selector
      svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", cellSize / 4)
        .attr("fill", d => {
          if (safeSelectedNodes.includes(d.id)) return "red";
          else return "black"; 
        })
        
        .attr("class", "node")
        .on("click", function(event, d) {
        // Handle click event on nodes
        const currentColor = d3.select(this).attr("fill");
        const newColor = currentColor === "black" ? "red" : "black";
        d3.select(this).attr("fill", newColor);
        onNodeSelect(d,scenario);
      });

    }
  }, [nodes, links, rows, cols, selectedOrigin,selectedNodes,selectedLinks]); // Dependency array

  return <div ref={d3Container} />;
};

export default VSESelector;
