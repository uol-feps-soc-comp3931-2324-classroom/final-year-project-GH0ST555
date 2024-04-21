import { createAdjacencyMatrix, createNodesandEdges } from './CreateDS.js';

//Testing the data structure code. Handles all types of graph generation and edge cases

describe('createAdjacencyMatrix', () => {
  test('creates correct matrix for 2x2 grid', () => {
    const rows = 2;
    const cols = 2;
    const expectedMatrix = [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [0, 1, 1, 0]
    ];
    const matrix = createAdjacencyMatrix(rows, cols);
    expect(matrix).toEqual(expectedMatrix);
  });

  test('creates correct matrix for 3x1 grid', () => {
    const rows = 3;
    const cols = 1;
    const expectedMatrix = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ];
    const matrix = createAdjacencyMatrix(rows, cols);
    expect(matrix).toEqual(expectedMatrix);
  });

  test('creates correct matrix for an empty grid', () => {
    //expected behaviour is that no matrix is created
    const rows = 0;
    const cols = 0;
    const expectedMatrix = []; 
    const matrix = createAdjacencyMatrix(rows, cols);
    expect(matrix).toEqual(expectedMatrix);
  });


  test('creates correct matrix for a grid that has improper dimensions', () => {
    //expected behaviour is that no matrix is created
    const rows = -1;
    const cols = -4;
    const expectedMatrix = []; 
    const matrix = createAdjacencyMatrix(rows, cols);
    expect(matrix).toEqual(expectedMatrix);
  });
});

describe('createNodesandEdges', () => {
  test('correctly generates nodes and edges for 2x2 grid', () => {
    const rows = 2;
    const cols = 2;
    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);
    
    expect(nodes.length).toBe(4); // Total nodes
    expect(links.length).toBe(8); // Total edges

    // Check if all nodes are present
    nodes.forEach(node => {
      expect(node).toHaveProperty('id');
    });

    // Check if edges are correctly labeled as Horizontal or Vertical
    expect(links).toEqual(expect.arrayContaining([
      expect.objectContaining({ edgetype: 'Horizontal' }),
      expect.objectContaining({ edgetype: 'Vertical' })
    ]));
  });

  
  test('correctly generates nodes and edges for 3x1 grid', () => {
    const rows = 3;
    const cols = 1;
    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);
    
    expect(nodes.length).toBe(3); // Total nodes
    expect(links.length).toBe(4); // Total edges

    // Check if all nodes are present
    nodes.forEach(node => {
      expect(node).toHaveProperty('id');
    });

    // Check if all edges are correctly labeled as Vertical
    expect(links.every(link => link.edgetype === 'Vertical')).toBe(true);
  });


  test('correctly generates nodes and edges for 1x3 grid', () => {
    const rows = 1;
    const cols = 3;
    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);

    
    expect(nodes.length).toBe(3); // Total nodes
    expect(links.length).toBe(4); // Total edges

    // Check if all nodes are present
    nodes.forEach(node => {
      expect(node).toHaveProperty('id');
    });

    // Check if all edges are correctly labeled as Horizontal
    expect(links.every(link => link.edgetype === 'Horizontal')).toBe(true);
  });

  test('correctly handles nodes and edges for an empty grid', () => {
    //expected behaviour is that no nodes or edges are created (arrays are empty)
    const rows = 0;
    const cols = 0;
    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);

    
    expect(nodes.length).toBe(0); // Total nodes
    expect(links.length).toBe(0); // Total edges

  });

  //Fix? -> Warning Message instead of Empty values
  test('correctly handles nodes and edges for an a grid with improper dimensions', () => {

    //expected behaviour is that no nodes or edges are created (arrays are empty)
    const rows = -1;
    const cols = -4;

    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);

    expect(nodes.length).toBe(0); // Total nodes
    expect(links.length).toBe(0); // Total edges

  });

});
