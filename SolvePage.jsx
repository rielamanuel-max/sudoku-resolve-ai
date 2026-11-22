import SudokuGrid from '../components/SudokuGrid.jsx';
export default function SolvePage() {
  return <main className="page-shell container"><div className="page-title"><span className="eyebrow">SUDOKU SOLVER / 01</span><h1>La tua griglia,<br/><em>la tua soluzione.</em></h1><p>Inserisci i numeri iniziali e lascia lavorare il risolutore.</p></div><SudokuGrid /></main>;
}
