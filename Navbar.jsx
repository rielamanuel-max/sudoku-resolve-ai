import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="Sudoku Resolve home">
        <span className="brand-mark">S</span>
        <span>Sudoku <b>Resolve</b></span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/solve">Risolutore</NavLink>
        <NavLink to="/scan">Scansione</NavLink>
        <NavLink to="/learn">Impara</NavLink>
      </nav>
      <Link to="/solve" className="nav-cta">Inizia ora <span>↗</span></Link>
    </header>
  );
}
