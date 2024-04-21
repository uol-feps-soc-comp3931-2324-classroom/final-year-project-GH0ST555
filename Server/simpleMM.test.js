import { getNeighbors,getConnectedLinks,calculatePositionsNC,getRowCol } from "./helperFunctions";
import { createAdjacencyMatrix, createNodesandEdges } from './CreateDS.js';
import { dilation,erosion } from "./simpleMM.js";


describe('dilation',()=>{
    test(' test Single Node SE ',()=>{
        //Expected behaviour is that the result will only contain nodes
        const rows = 3;
        const cols = 3;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Single Node';

        const selectedNodes = [0,1,2,3];
        const selectedLinks = [{id:'link-0-1',source:0,target:1,edgetype:'Horizontal'}];

        const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(dilatedNodes).toEqual([0,1,2,3]);
        expect(dilatedLinks).toEqual(null);

    });

    test(' test cross shaped SE ',()=>{
        //Expected behaviour is that the result will only contain nodes
        const rows = 3;
        const cols = 3;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'cross shaped(No Edges)';

        const selectedNodes = [4];
        const selectedLinks = [{id:'link-0-1',source:0,target:1,edgetype:'Horizontal'}];

        const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(dilatedNodes.sort()).toEqual([1,3,4,5,7]);
        expect(dilatedLinks).toEqual(null);

    });

    test(' test Node + Edge + RNode SE ',()=>{
        //Expected behaviour is that the result will contain nodes and edges
        //The original edge in this case will not be present
        const rows = 3;
        const cols = 3;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Node + Edge + RNode';

        const selectedNodes = [4,1];
        const selectedLinks = [{id:'link-4-1',source:4,target:1,edgetype:'Vertical'}];

        const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(dilatedNodes.sort()).toEqual([1,2,4,5]);
        expect(dilatedLinks).toEqual([
            { id: 'link-5-4', source: 5, target: 4, edgetype: 'Horizontal' },
            { id: 'link-2-1', source: 2, target: 1, edgetype: 'Horizontal' }
        ]);

    });

    test(' test Horizontal SE ',()=>{
        //Expected behaviour is that the result will contain nodes and edges
        //The original edge in this case will be present, along with new edges being added to it
        const rows = 4;
        const cols = 4;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Horizontal Edge';

        const selectedNodes = [5,6];
        const selectedLinks = [{id:'link-6-5',source:6,target:5,edgetype:'Horizontal'}];

        const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(dilatedNodes.sort(function(a, b){return a - b})).toEqual([1,2,4,5,6,7,9,10]);
        expect(dilatedLinks).toEqual([
            { id: 'link-6-5', source: 6, target: 5, edgetype: 'Horizontal' },
            { id: 'link-1-5', source: 1, target: 5, edgetype: 'Vertical' },
            { id: 'link-4-5', source: 4, target: 5, edgetype: 'Horizontal' },
            { id: 'link-5-1', source: 5, target: 1, edgetype: 'Vertical' },
            { id: 'link-5-4', source: 5, target: 4, edgetype: 'Horizontal' },
            { id: 'link-5-6', source: 5, target: 6, edgetype: 'Horizontal' },
            { id: 'link-5-9', source: 5, target: 9, edgetype: 'Vertical' },
            { id: 'link-9-5', source: 9, target: 5, edgetype: 'Vertical' },
            { id: 'link-2-6', source: 2, target: 6, edgetype: 'Vertical' },
            { id: 'link-5-6', source: 5, target: 6, edgetype: 'Horizontal' },
            { id: 'link-6-2', source: 6, target: 2, edgetype: 'Vertical' },
            { id: 'link-6-7', source: 6, target: 7, edgetype: 'Horizontal' },
            { id: 'link-6-10', source: 6, target: 10, edgetype: 'Vertical' },
            { id: 'link-7-6', source: 7, target: 6, edgetype: 'Horizontal' },
            { id: 'link-10-6', source: 10, target: 6, edgetype: 'Vertical' }
        ]);

    });

    test(' test Vertical SE ',()=>{
        //Expected behaviour is that the result will contain nodes and edges
        //The original edge in this case will be present, along with new edges being added to it
        const rows = 4;
        const cols = 4;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Vertical Edge';

        const selectedNodes = [5,9];
        const selectedLinks = [{id:'link-9-5',source:9,target:5,edgetype:'Vertical'}];

        const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(dilatedNodes.sort(function(a, b){return a - b})).toEqual([1,4,5,6,8,9,10,13]);
        expect(dilatedLinks).toEqual([
            { id: 'link-9-5', source: 9, target: 5, edgetype: 'Vertical' },
            { id: 'link-1-5', source: 1, target: 5, edgetype: 'Vertical' },
            { id: 'link-4-5', source: 4, target: 5, edgetype: 'Horizontal' },
            { id: 'link-5-1', source: 5, target: 1, edgetype: 'Vertical' },
            { id: 'link-5-4', source: 5, target: 4, edgetype: 'Horizontal' },
            { id: 'link-5-6', source: 5, target: 6, edgetype: 'Horizontal' },
            { id: 'link-5-9', source: 5, target: 9, edgetype: 'Vertical' },
            { id: 'link-6-5', source: 6, target: 5, edgetype: 'Horizontal' },
            { id: 'link-5-9', source: 5, target: 9, edgetype: 'Vertical' },
            { id: 'link-8-9', source: 8, target: 9, edgetype: 'Horizontal' },
            { id: 'link-9-8', source: 9, target: 8, edgetype: 'Horizontal' },
            { id: 'link-9-10', source: 9, target: 10, edgetype: 'Horizontal' },
            { id: 'link-9-13', source: 9, target: 13, edgetype: 'Vertical' },
            { id: 'link-10-9', source: 10, target: 9, edgetype: 'Horizontal' },
            { id: 'link-13-9', source: 13, target: 9, edgetype: 'Vertical' }
        ]);
    });


    test(' test Empty Subgraph ',()=>{
        //Expected behaviour is that the result will contain no nodes and edges
        const rows = 4;
        const cols = 4;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Vertical Edge';

        const selectedNodes = [];
        const selectedLinks = [];

        const{dilatedNodes,dilatedLinks} = dilation(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(dilatedNodes.sort()).toEqual([]);
        expect(dilatedLinks).toEqual([]);
    });

});

describe('erosion',()=>{
    test(' test Single Node SE ',()=>{
        //Expected behaviour is that the result will only contain nodes
        const rows = 3;
        const cols = 3;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Single Node';

        const selectedNodes = [0,1,2,3];
        const selectedLinks = [{id:'link-0-1',source:0,target:1,edgetype:'Horizontal'}];

        const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(erodedNodes).toEqual([0,1,2,3]);
        expect(erodedLinks).toEqual(null);

    });

    test(' test cross shaped SE ',()=>{
        //Expected behaviour is that the result will only contain nodes
        const rows = 3;
        const cols = 3;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'cross shaped(No Edges)';

        const selectedNodes = [1,3,4,5,7];
        const selectedLinks = [{id:'link-0-1',source:0,target:1,edgetype:'Horizontal'}];

        const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(erodedNodes.sort()).toEqual([4]);
        expect(erodedLinks).toEqual(null);

    });

    test(' test Node + Edge + RNode SE ',()=>{
        //Expected behaviour is that the result will contain nodes and edges
        //The original edge in this case will not be present
        const rows = 3;
        const cols = 3;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Node + Edge + RNode';

        const selectedNodes = [1,2,4,5];
        const selectedLinks = [{ id: 'link-5-4', source: 5, target: 4, edgetype: 'Horizontal' },
        { id: 'link-2-1', source: 2, target: 1, edgetype: 'Horizontal' }];

        const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(erodedNodes.sort()).toEqual([1,4]);
        expect(erodedLinks).toEqual(null);

    });

    test(' test Horizontal SE ',()=>{
        //Expected behaviour is that the result will contain nodes and edges
        //The original edge in this case will be present, along with new edges being added to it
        const rows = 4;
        const cols = 4;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Horizontal Edge';

        const selectedNodes = [5, 6, 1, 2, 10, 9, 4, 7];

        const selectedLinks =[
            { id: 'link-6-5', source: 6, target: 5, edgetype: 'Horizontal' },
            { id: 'link-5-1', source: 5, target: 1, edgetype: 'Vertical' },
            { id: 'link-5-4', source: 5, target: 4, edgetype: 'Horizontal' },
            { id: 'link-9-5', source: 9, target: 5, edgetype: 'Vertical' },
            { id: 'link-6-2', source: 6, target: 2, edgetype: 'Vertical' },
            { id: 'link-6-7', source: 6, target: 7, edgetype: 'Horizontal' },
            { id: 'link-7-6', source: 7, target: 6, edgetype: 'Horizontal' },
            { id: 'link-10-6', source: 10, target: 6, edgetype: 'Vertical' }
        ];

        const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(erodedNodes.sort(function(a, b){return a - b})).toEqual([]);
        expect(erodedLinks).toEqual([]);

    });

    test(' test Vertical SE ',()=>{
        //Expected behaviour is that the result will contain nodes and edges
        //The original edge in this case will be present, along with new edges being added to it
        const rows = 4;
        const cols = 4;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Vertical Edge';

        const selectedNodes = [1,4,5,6,8,9,10,13];

        const selectedLinks = [        
        { id: 'link-9-5', source: 9, target: 5, edgetype: 'Vertical' },
        { id: 'link-5-1', source: 5, target: 1, edgetype: 'Vertical' },
        { id: 'link-5-4', source: 5, target: 4, edgetype: 'Horizontal' },
        { id: 'link-6-5', source: 6, target: 5, edgetype: 'Horizontal' },
        { id: 'link-9-8', source: 9, target: 8, edgetype: 'Horizontal' },
        { id: 'link-10-9', source: 10, target: 9, edgetype: 'Horizontal' },
        { id: 'link-13-9', source: 13, target: 9, edgetype: 'Vertical' }];

        const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(erodedNodes.sort(function(a, b){return a - b})).toEqual([5,9]);
        expect(erodedLinks).toEqual([{id:'link-9-5',source:9,target:5,edgetype:'Vertical'}]);
    });


    test(' test Empty Subgraph ',()=>{
        //Expected behaviour is that the result will contain all nodes and edges
        const rows = 4;
        const cols = 4;
        const matrix = createAdjacencyMatrix(rows, cols);
        const { nodes, links } = createNodesandEdges(matrix, rows, cols);
        const SE = 'Vertical Edge';

        const selectedNodes = [];
        const selectedLinks = [];

        const{erodedNodes,erodedLinks} = erosion(rows,cols,selectedNodes,selectedLinks,nodes,links,SE);

        expect(erodedNodes).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
        expect(erodedLinks).toEqual(links);
    });

});