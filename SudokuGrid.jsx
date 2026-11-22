import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { findConflicts, isValidMove } from '../algorithms/sudokuValidator.js';
import { solveSudoku } from '../algorithms/sudokuSolver.js';
import { cloneGrid, emptyGrid, exampleGrid } from '../data.js';

const STORAGE_KEY = 'sudoku-resolve-grid-v1';

export default function SudokuGrid() {
  const location = useLocation();
  const [grid, setGrid] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === 9 && saved.every(r => Array.isArray(r) && r.length === 9)) return saved;
    } catch {}
    return emptyGrid();
  });
  const [selected, setSelected] = useState([0, 0]);
  const [message, setMessage] = useState(() => location.state?.scanned
    ? { type: 'success', text: `Gemini ha trascritto ${location.state.count || 'la'} cifre. Controlla la griglia prima di risolvere.` }
    : { type: 'info', text: 'Seleziona una cella e inserisci un numero da 1 a 9.' });
  const [history, setHistory] = useState([]);
  const [hint, setHint] = useState(null);
  const [hintBusy, setHintBusy] = useState(false);
  const [generated, setGenerated] = useState(() => new Set());
  const conflicts = useMemo(() => findConflicts(grid), [grid]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
  }, [grid]);

  function updateCell(value) {
    const [r, c] = selected;
    const next = cloneGrid(grid);
    next[r][c] = value;
    setHistory(h => [...h.slice(-29), cloneGrid(grid)]);
    setGrid(next);
    setGenerated(old => { const copy = new Set(old); copy.delete(`${r}-${c}`); return copy; });
    setHint(null);
    setMessage({ type: 'info', text: value ? `Inserito ${value} nella cella selezionata.` : 'Cella cancellata.' });
  }

  function onKeyDown(event) {
    if (/^[1-9]$/.test(event.key)) { event.preventDefault(); updateCell(event.key); }
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') { event.preventDefault(); updateCell(''); }
    const [r, c] = selected;
    const moves = { ArrowUp: [Math.max(0, r - 1), c], ArrowDown: [Math.min(8, r + 1), c], ArrowLeft: [r, Math.max(0, c - 1)], ArrowRight: [r, Math.min(8, c + 1)] };
    if (moves[event.key]) { event.preventDefault(); setSelected(moves[event.key]); }
  }

  function loadExample() {
    setHistory(h => [...h.slice(-29), cloneGrid(grid)]);
    setGrid(cloneGrid(exampleGrid)); setGenerated(new Set()); setHint(null); setSelected([0, 0]);
    setMessage({ type: 'success', text: 'Sudoku di esempio caricato. Puoi chiedere un suggerimento o risolverlo.' });
  }
  function clearGrid() {
    setHistory(h => [...h.slice(-29), cloneGrid(grid)]);
    setGrid(emptyGrid()); setGenerated(new Set()); setHint(null); setSelected([0, 0]);
    setMessage({ type: 'info', text: 'Griglia svuotata.' });
  }
  function undo() {
    if (!history.length) return;
    setGrid(history[history.length - 1]); setHistory(h => h.slice(0, -1)); setHint(null);
    setMessage({ type: 'info', text: 'Ultima modifica annullata.' });
  }
  function solve() {
    if (grid.every(row => row.every(cell => !cell))) {
      setMessage({ type: 'warning', text: 'Inserisci un Sudoku oppure carica quello di esempio.' }); return;
    }
    if (conflicts.size) {
      setMessage({ type: 'error', text: 'Ci sono numeri in conflitto: correggi le celle evidenziate prima di risolvere.' }); return;
    }
    const result = solveSudoku(grid);
    if (!result) {
      setMessage({ type: 'error', text: 'Questa griglia non ha una soluzione valida. Controlla i numeri inseriti.' }); return;
    }
    const added = new Set();
    grid.forEach((row, r) => row.forEach((cell, c) => { if (!cell) added.add(`${r}-${c}`); }));
    setHistory(h => [...h.slice(-29), cloneGrid(grid)]);
    setGrid(result); setGenerated(added); setHint(null);
    setMessage({ type: 'success', text: 'Sudoku risolto correttamente con Backtracking. Le celle aggiunte sono evidenziate.' });
  }

  async function suggestMove() {
    if (conflicts.size) {
      setMessage({ type: 'error', text: 'Correggi prima i numeri in conflitto per chiedere un suggerimento.' }); return;
    }
    if (grid.every(row => row.every(Boolean))) {
      setMessage({ type: 'success', text: 'La griglia è già completa.' }); return;
    }
    const knownSolution = solveSudoku(grid);
    if (!knownSolution) {
      setMessage({ type: 'error', text: 'Questa griglia non ha una soluzione valida. Controlla i numeri prima di chiedere aiuto.' }); return;
    }
    setHintBusy(true); setHint(null);
    setMessage({ type: 'info', text: 'Gemini sta cercando la prossima mossa logica…' });
    try {
      const response = await fetch('/api/hint', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: grid.map(row => row.map(value => value ? Number(value) : 0)) })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Errore del server (${response.status}).`);
      if (!result.found) {
        setMessage({ type: 'warning', text: result.explanation || 'Non ho trovato una mossa logica elementare certa in questa griglia.' });
        return;
      }
      const { row, col, value } = result;
      if (!Number.isInteger(row) || row < 0 || row > 8 || !Number.isInteger(col) || col < 0 || col > 8 || !Number.isInteger(value) || value < 1 || value > 9 || grid[row][col] || !isValidMove(grid, row, col, String(value)) || String(knownSolution[row][col]) !== String(value)) {
        throw new Error('Il suggerimento ricevuto non supera i controlli della griglia. Riprova.');
      }
      const nextHint = { ...result, row, col, value: String(value) };
      setHint(nextHint); setSelected([row, col]);
      setMessage({ type: 'success', text: `${result.technique || 'Mossa logica'} · R${row + 1} C${col + 1}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Non riesco a contattare il tutor Gemini.' });
    } finally {
      setHintBusy(false);
    }
  }

  function applyHint() {
    if (!hint) return;
    const next = cloneGrid(grid); next[hint.row][hint.col] = hint.value;
    setHistory(h => [...h.slice(-29), cloneGrid(grid)]); setGrid(next); setSelected([hint.row, hint.col]);
    setHint(null); setMessage({ type: 'success', text: `Mossa inserita: ${hint.value} in riga ${hint.row + 1}, colonna ${hint.col + 1}.` });
  }

  function speakHint() {
    if (!hint?.explanation || !('speechSynthesis' in window)) {
      setMessage({ type: 'warning', text: 'La sintesi vocale non è disponibile in questo browser.' }); return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(hint.explanation);
    utterance.lang = 'it-IT'; utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="solver-layout" onKeyDown={onKeyDown} tabIndex={0}>
      <div className="solver-board-wrap">
        <div className="board-topline"><span>GRIGLIA 9 × 9</span><span className={conflicts.size ? 'live-bad' : 'live-good'}>{conflicts.size ? `${conflicts.size} CONFLITTI` : '● CONTROLLO ATTIVO'}</span></div>
        <div className="sudoku-board" role="grid" aria-label="Griglia Sudoku 9 per 9">
          {grid.map((row, r) => row.map((cell, c) => {
            const isSelected = selected[0] === r && selected[1] === c;
            const sameNumber = cell && cell === grid[selected[0]][selected[1]];
            const conflict = conflicts.has(`${r}-${c}`);
            const isHint = hint?.row === r && hint?.col === c;
            const isGenerated = generated.has(`${r}-${c}`);
            return <button key={`${r}-${c}`} type="button" role="gridcell" aria-label={`Riga ${r+1}, colonna ${c+1}, ${cell || 'vuota'}`} className={`sudoku-cell ${r % 3 === 2 && r !== 8 ? 'box-bottom' : ''} ${c % 3 === 2 && c !== 8 ? 'box-right' : ''} ${isSelected ? 'selected' : ''} ${sameNumber && !isSelected ? 'same-number' : ''} ${conflict ? 'conflict' : ''} ${isHint ? 'hint-cell' : ''} ${isGenerated ? 'generated-cell' : ''}`} onClick={() => setSelected([r,c])}>{cell}</button>;
          }))}
        </div>
        <div className={`status-message ${message.type}`} aria-live="polite">{message.text}</div>
        {hint && <div className="hint-explanation">
          <div className="hint-kicker">✦ TUTOR GEMINI · {hint.technique || 'MOSSA LOGICA'}</div>
          <p><b>Riga {hint.row + 1}, colonna {hint.col + 1}: inserisci {hint.value}.</b> {hint.explanation}</p>
          <div className="hint-actions"><button type="button" onClick={applyHint}>Inserisci mossa</button><button type="button" onClick={speakHint}>▶ Ascolta</button><button type="button" onClick={() => setHint(null)}>Chiudi</button></div>
        </div>}
      </div>
      <aside className="solver-tools">
        <div className="tool-card">
          <div className="tool-heading"><span className="eyebrow">INSERIMENTO</span><h3>La tua griglia</h3><p>Clicca una cella, poi scegli un numero.</p></div>
          <div className="number-pad">{[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={() => updateCell(String(n))} type="button">{n}</button>)}</div>
          <button className="wide-button subtle" onClick={() => updateCell('')} type="button">⌫ Cancella cella</button>
          <div className="tool-divider" />
          <button className="wide-button primary" onClick={solve} type="button">Risolvi Sudoku <span>→</span></button>
          <button className="wide-button ai-button" onClick={suggestMove} disabled={hintBusy}>{hintBusy ? 'Gemini sta ragionando…' : '✦ Suggerisci mossa con AI'}</button>
          <div className="action-row"><button onClick={loadExample} type="button">Carica esempio</button><button onClick={undo} disabled={!history.length} type="button">Annulla</button><button onClick={clearGrid} type="button">Reset</button></div>
          <p className="autosave-note">✓ Salvataggio automatico su questo browser</p>
        </div>
        <div className="tip-card"><span className="tip-icon">✦</span><div><b>Un piccolo aiuto</b><p>Usa le frecce per spostarti tra le celle. Il tutor propone una mossa alla volta e ne spiega la logica.</p></div></div>
      </aside>
    </div>
  );
}
