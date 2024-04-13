import { getNeighbors,getConnectedLinks,calculatePositionsNC } from "./helperFunctions";
import { createAdjacencyMatrix, createNodesandEdges } from './CreateDS.js';

describe('getNeighbours', () => {
    test('gets all possible neighbours  when selected node has 4 neighbours)', () => {
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
        const expected_neighbours = [];
        const neighbours_invalid_int = getNeighbors(-1,rows, cols);
        expect(neighbours_invalid_int).toEqual(expected_neighbours);

        //whewn the string 
        const neighbours_invalid_str = getNeighbors('aab',rows, cols);
        expect(neighbours_invalid_str).toEqual(expected_neighbours);
      });

      test('handling invalid row and column ID s', () => {
        //One value is less than 0 and one is a string
        const rows = -1;
        const cols = 'aab';
        const expected_neighbours = [];
        const neighbours_invalid_int = getNeighbors(-1,rows, cols);
        expect(neighbours_invalid_int).toEqual(expected_neighbours);

      });
});



describe('getConnectedLinks', () => {
    test('gets all possible edges  when selected node has 4 neighbours)', () => {
      const rows = 3;
      const cols = 3;

      const matrix = createAdjacencyMatrix(rows, cols);
      const { nodes, links } = createNodesandEdges(matrix, rows, cols);

      const actual_links = getConnectedLinks(4,links);
      expect(actual_links.length).toBe(8);
    });

});