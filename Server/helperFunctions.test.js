import { getNeighbors,getConnectedLinks,calculatePositionsNC,getRowCol } from "./helperFunctions";
import { createAdjacencyMatrix, createNodesandEdges } from './CreateDS.js';

describe('getNeighbours', () => {
    test('gets all possible neighbours  when selected node has 4 neighbours', () => {
      const rows = 3;
      const cols = 3;
      const expected_neighbours = [3,5,1,7];
      const neighbours = getNeighbors(4,rows, cols);
      expect(neighbours).toEqual(expected_neighbours);
    });

    test('gets all possible neighbours when selected node is a corner node (2 neighbours)', () => {
        const rows = 3;
        const cols = 3;
        const expected_neighbours = [1,3];
        const neighbours = getNeighbors(0,rows, cols);
        expect(neighbours).toEqual(expected_neighbours);
      });

      test('gets all possible neighbours when selected node has 3 neighbours', () => {
        const rows = 2;
        const cols = 3;
        const expected_neighbours = [3,5,1];
        const neighbours = getNeighbors(4,rows, cols);
        expect(neighbours).toEqual(expected_neighbours);
      });

      test('gets all possible neighbours when selected node has 1 neighbour', () => {
        const rows = 1;
        const cols = 2;
        const expected_neighbours = [1];
        const neighbours = getNeighbors(0,rows, cols);
        expect(neighbours).toEqual(expected_neighbours);
      });

      test('handling invalid neighbour ID s', () => {
        const rows = 1;
        const cols = 2;
        expect(()=> getNeighbors(-1,rows, cols)).toThrow(/nodeId, rows, and cols must be positive integers/);

        //whewn the string is passed
        expect(()=> getNeighbors('aab',rows, cols)).toThrow(/nodeId, rows, and cols must be positive integers/);
      });

      test('handling invalid row and column ID s', () => {
        //One value is less than 0 and one is a string
        const rows = -1;
        const cols = 'aab';
        expect(()=> getNeighbors(-1,rows, cols)).toThrow(/nodeId, rows, and cols must be positive integers/);

      });
});



describe('getConnectedLinks', () => {
    test('gets all possible edges  when selected node has 4 neighbours', () => {
      const rows = 3;
      const cols = 3;

      const matrix = createAdjacencyMatrix(rows, cols);
      const { nodes, links } = createNodesandEdges(matrix, rows, cols);

      //pass the node id to find its neighbouring edges
      const actual_links = getConnectedLinks(4,links);

      expect(actual_links.length).toBe(8);
      actual_links.forEach(link => {
        //Source or target node must be 4 when getting all possible edges connected to node id 4
        expect([link.source, link.target]).toContain(4);
      });
    });

    test('gets all possible edges  when selected node has 3 neighbours', () => {
      const rows = 2;
      const cols = 3;

      const matrix = createAdjacencyMatrix(rows, cols);
      const { nodes, links } = createNodesandEdges(matrix, rows, cols);

      //pass the node id to find its neighbouring edges
      const actual_links = getConnectedLinks(4,links);

      expect(actual_links.length).toBe(6);
      actual_links.forEach(link => {
        //Source or target node must be 4 when getting all possible edges connected to node id 4
        expect([link.source, link.target]).toContain(4);
      });
    });

    test('gets all possible edges  when selected node has 2 neighbours', () => {
      const rows = 3;
      const cols = 3;

      const matrix = createAdjacencyMatrix(rows, cols);
      const { nodes, links } = createNodesandEdges(matrix, rows, cols);

      //pass the node id to find its neighbouring edges
      const actual_links = getConnectedLinks(0,links);

      expect(actual_links.length).toBe(4);
      actual_links.forEach(link => {
        //Source or target node must be 4 when getting all possible edges connected to node id 4
        expect([link.source, link.target]).toContain(0);
      });
    });
    
    test('gets all possible edges  when selected node has 1 neighbour', () => {
      const rows = 1;
      const cols = 2;

      const matrix = createAdjacencyMatrix(rows, cols);
      const { nodes, links } = createNodesandEdges(matrix, rows, cols);

      //pass the node id to find its neighbouring edges
      const actual_links = getConnectedLinks(0,links);

      expect(actual_links.length).toBe(2);
      actual_links.forEach(link => {
        //Source or target node must be 4 when getting all possible edges connected to node id 4
        expect([link.source, link.target]).toContain(0);
      });

    });

    test('handling invalid neighbour ID s', () => {
      const rows = 1;
      const cols = 2;

      const matrix = createAdjacencyMatrix(rows, cols);
      const { nodes, links } = createNodesandEdges(matrix, rows, cols);

      //when a number below 0 is passed as node id an error message should be thrown
      expect(()=> getConnectedLinks(-1,links)).toThrow(/nodeId must be a positive integer/);

      //when the string is passed as node id an error message should be thrown
      expect(()=> getConnectedLinks('aab',links)).toThrow(/nodeId must be a positive integer/);
    });

});


describe('calculatePositionsNC', () => {
  test('Test if relative position code is accurate', () => {
    const rows = 2;
    const cols = 2;

    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);
    const arrnodes = [0,1,2,3]

    const {rpNodes,rpLinks} = calculatePositionsNC(0, arrnodes, links, rows, cols);


    expect(rpNodes).toEqual([
      { nodeId: 0, relativePosition: { x: 0, y: 0 } },
      { nodeId: 1, relativePosition: { x: 1, y: 0 } },
      { nodeId: 2, relativePosition: { x: 0, y: 1 } },
      { nodeId: 3, relativePosition: { x: 1, y: 1 } }
    ]);

    expect(rpLinks).toEqual([
      {
        linkId: 'link-0-1',
        sourceRelativePosition: { x: 0, y: 0 },
        targetRelativePosition: { x: 1, y: 0 },
        edgetype: 'Horizontal'
      },
      {
        linkId: 'link-0-2',
        sourceRelativePosition: { x: 0, y: 0 },
        targetRelativePosition: { x: 0, y: 1 },
        edgetype: 'Vertical'
      },
      {
        linkId: 'link-1-0',
        sourceRelativePosition: { x: 1, y: 0 },
        targetRelativePosition: { x: 0, y: 0 },
        edgetype: 'Horizontal'
      },
      {
        linkId: 'link-1-3',
        sourceRelativePosition: { x: 1, y: 0 },
        targetRelativePosition: { x: 1, y: 1 },
        edgetype: 'Vertical'
      },
      {
        linkId: 'link-2-0',
        sourceRelativePosition: { x: 0, y: 1 },
        targetRelativePosition: { x: 0, y: 0 },
        edgetype: 'Vertical'
      },
      {
        linkId: 'link-2-3',
        sourceRelativePosition: { x: 0, y: 1 },
        targetRelativePosition: { x: 1, y: 1 },
        edgetype: 'Horizontal'
      },
      {
        linkId: 'link-3-1',
        sourceRelativePosition: { x: 1, y: 1 },
        targetRelativePosition: { x: 1, y: 0 },
        edgetype: 'Vertical'
      },
      {
        linkId: 'link-3-2',
        sourceRelativePosition: { x: 1, y: 1 },
        targetRelativePosition: { x: 0, y: 1 },
        edgetype: 'Horizontal'
      }
    ]);
  });

  test('Test for improper values', () => {
    const rows = 2;
    const cols = 2;

    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);

    //when a number below 0 is passed as node id an error message should be thrown
    expect(()=> calculatePositionsNC(-1, nodes, links, rows, cols)).toThrow(/origin node, rows, and cols must be positive integers/);

    //when the string is passed as node id an error message should be thrown
    expect(()=> calculatePositionsNC('aab', nodes, links, rows, cols)).toThrow(/origin node, rows, and cols must be positive integers/);
  });
});
