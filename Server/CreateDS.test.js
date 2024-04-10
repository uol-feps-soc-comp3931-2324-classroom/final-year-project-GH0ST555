import { createAdjacencyMatrix, createNodesandEdges } from './CreateDS.js';

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
});

describe('createNodesandEdges', () => {
  test('correctly generates nodes and edges for 2x2 grid', () => {
    const rows = 2;
    const cols = 2;
    const matrix = createAdjacencyMatrix(rows, cols);
    const { nodes, links } = createNodesandEdges(matrix, rows, cols);
    
    expect(nodes.length).toBe(4); // Total nodes
    expect(links.length).toBe(4); // Total edges

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
});
