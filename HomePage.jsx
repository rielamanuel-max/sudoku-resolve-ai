import { Link } from 'react-router-dom';
import { exampleGrid } from '../data.js';

export default function HomePage() {
  return <main>
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow pill-label"><i /> IL TUO SPAZIO PER IL SUDOKU</span>
        <h1>Ogni griglia ha<br/><em>una soluzione.</em></h1>
        <p className="hero-lead">Risolvi, esplora e impara il Sudoku. Un ambiente semplice e intuitivo per allenare la logica, un numero alla volta.</p>
        <div className="hero-actions"><Link className="button primary" to="/solve">Apri il risolutore <span>→</span></Link><Link className="button ghost" to="/learn">Scopri come funziona</Link></div>
        <div className="hero-proof"><span><b>9×9</b> griglia classica</span><span><b>AI</b> Vision</span><span><b>∞</b> tentativi</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-glow" />
        <div className="preview-card"><div className="preview-head"><span>PUZZLE PREVIEW</span><span className="preview-status">● READY</span></div><div className="preview-grid">{exampleGrid.flat().map((v,i)=><div key={i} className={`${v ? 'given' : ''} ${Math.floor(i/9)%3===2 && Math.floor(i/9)!==8 ? 'thick-bottom' : ''} ${i%9%3===2 && i%9!==8 ? 'thick-right' : ''}`}>{v}</div>)}</div><div className="preview-foot"><span>STANDARD SUDOKU</span><span>LEVEL 01</span></div></div>
        <div className="floating-note"><span>✓</span><div><b>Logica attiva</b><small>Pronto a risolvere</small></div></div>
      </div>
    </section>
    <section className="features-section container"><div className="section-intro"><span className="eyebrow">TUTTO IN UN SOLO POSTO</span><h2>La logica, <em>senza complicazioni.</em></h2><p>Gli strumenti essenziali per affrontare ogni schema.</p></div>
      <div className="feature-grid">
        <Link to="/solve" className="feature-card"><span className="feature-icon">⌗</span><h3>Risolvi Sudoku</h3><p>Risolvi con Backtracking oppure chiedi al tutor AI la prossima mossa logica.</p><span className="feature-link">Apri il solver ↗</span></Link>
        <Link to="/scan" className="feature-card"><span className="feature-icon">▧</span><h3>Scansiona una foto</h3><p>Gemini analizza la fotografia e trascrive automaticamente la griglia.</p><span className="feature-link">Apri scansione ↗</span></Link>
        <Link to="/learn" className="feature-card"><span className="feature-icon">✳</span><h3>Impara le strategie</h3><p>Conosci le regole, scopri le tecniche e mettiti alla prova.</p><span className="feature-link">Vai alle lezioni ↗</span></Link>
      </div>
    </section>
    <section className="bottom-cta container"><div><span className="eyebrow">IL PROSSIMO NUMERO È TUO</span><h2>Pronto a iniziare?</h2><p>Apri una griglia e mettiti alla prova.</p></div><Link to="/solve" className="button primary">Inizia ora <span>→</span></Link></section>
  </main>;
}
