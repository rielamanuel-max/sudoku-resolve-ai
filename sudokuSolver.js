import { isValidMove } from './sudokuValidator.js';

export function solveSudoku(input) {
  if (!Array.isArray(input) || input.length !== 9 ||
      !input.every(row => Array.isArray(row) && row.length === 9)) return null;

  const board = input.map(row => row.map(cell => String(cell ?? '')));
  for (const row of board) {
    for (const cell of row) {
      if (cell !== '' && !/^[1-9]$/.test(cell)) return null;
    }
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== '' && !isValidMove(board, r, c, board[r][c])) return null;
    }
  }

  function backtrack() {
    let best = null;
    let bestCandidates = null;

    // Sceglie la cella vuota con meno candidati (MRV): più efficiente del semplice ordine.
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== '') continue;
        const candidates = [];
        for (let n = 1; n <= 9; n++) {
          const value = String(n);
          if (isValidMove(board, r, c, value)) candidates.push(value);
        }
        if (candidates.length === 0) return false;
        if (bestCandidates === null || candidates.length < bestCandidates.length) {
          best = [r, c];
          bestCandidates = candidates;
          if (candidates.length === 1) break;
        }
      }
      if (bestCandidates?.length === 1) break;
    }

    if (best === null) return true;
    const [r, c] = best;
    for (const value of bestCandidates) {
      board[r][c] = value;
      if (backtrack()) return true;
      board[r][c] = '';
    }
    return false;
  }

  return backtrack() ? board : null;
}
