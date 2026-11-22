export function isValidMove(grid, row, col, number) {
  if (number === '' || number == null) return true;
  const value = String(number);

  for (let c = 0; c < 9; c++) {
    if (c !== col && String(grid[row]?.[c] ?? '') === value) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && String(grid[r]?.[col] ?? '') === value) return false;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && String(grid[r]?.[c] ?? '') === value) return false;
    }
  }
  return true;
}

export function findConflicts(grid) {
  const conflicts = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = grid[r]?.[c] ?? '';
      if (value !== '' && !isValidMove(grid, r, c, value)) conflicts.add(`${r}-${c}`);
    }
  }
  return conflicts;
}
