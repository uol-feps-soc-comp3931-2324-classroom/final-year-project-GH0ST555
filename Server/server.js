import express from 'express';
import cors from 'cors';
import jsdom from 'jsdom';
import { link } from 'd3';
const { JSDOM } = jsdom;
import { createAdjacencyMatrix, createNodesandEdges } from './CreateDS.js';
import { dilation,erosion,opening,closing } from './simpleMM.js';
import { customDilation,customErosion,customOpening,customClosing } from './customMM.js';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

//Endpoints To Perform Computations
app.post('/api/grid', (req, res) => {
  const { rows,cols } = req.body;
  const matrix = createAdjacencyMatrix(rows,cols);
  const { nodes, links } = createNodesandEdges(matrix,rows,cols);
  res.send({rows,cols,matrix,nodes,links});  
});

app.post('/api/dilateGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE,SEData } = req.body;
  
  if (SE != 'Custom SE'){
    res.json(dilation(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));
  }
  else{
    res.json(customDilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SEData));
  }
  
});

app.post('/api/erodeGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE,SEData } = req.body;
  if(SE != 'Custom SE'){
    res.json(erosion(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));
  }
  else{
    res.json(customErosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SEData));
  }
  
});

app.post('/api/openGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE,SEData } = req.body;
  if(SE != 'Custom SE'){
    res.json(opening(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));
  }
  else{
    res.json(customOpening(rows,cols,selectedNodes,selectedLinks,nodes,links,SEData));
  }
});

app.post('/api/closeGrid', (req, res) => {
  const {rows,cols,selectedNodes,selectedLinks, nodes, links, SE,SEData} = req.body;
  if(SE != 'Custom SE'){
    res.json(closing(rows,cols,selectedNodes,selectedLinks, nodes, links, SE));
  }
  else{
    res.json(customClosing(rows,cols,selectedNodes,selectedLinks,nodes,links,SEData));
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
