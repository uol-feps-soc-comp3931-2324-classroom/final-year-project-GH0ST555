// This code is responsible for creating the data structure required for this program

//function that creates an adjacency matrix for any dimensional grid.
//this matrix is the underlying data type for this program
export function createAdjacencyMatrix(rows, cols) {

    const matrix = [];

    //improper values check
    if (rows < 0 || cols < 0){
      return matrix;
    }

    const size = rows * cols;
    
    for (let i = 0; i < size; i++) {
      matrix[i] = new Array(size).fill(0);
      const row = Math.floor(i / cols);
      const col = i % cols;
  
      // Right neighbor
      if (col < cols - 1) matrix[i][i + 1] = 1;
      // Left neighbor
      if (col > 0) matrix[i][i - 1] = 1;
      // Bottom neighbor
      if (row < rows - 1) matrix[i][i + cols] = 1;
      // Top neighbor
      if (row > 0) matrix[i][i - cols] = 1;
    }
  
    return matrix;
  }
  
  export function createNodesandEdges(matrix, rows, cols) {
    const size = rows * cols;
    const nodes = matrix.map((_, i) => ({ id: i }));
    const links = [];
  
    matrix.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 1) {
          const sourceRow = Math.floor(i / cols);
          const sourceCol = i % cols;
          const targetRow = Math.floor(j / cols);
          const targetCol = j % cols;
  
          if (sourceRow === targetRow) {
            links.push({
              id: `link-${i}-${j}`,
              source: i,
              target: j,
              edgetype: 'Horizontal'
            });
          } else if (sourceCol === targetCol) {
            links.push({
              id: `link-${i}-${j}`,
              source: i,
              target: j,
              edgetype: 'Vertical'
            });
          }
        }
      });
    });
  
    return { nodes, links };
  }