import { useState } from 'react';
const lessons = [
  {n:'01',title:'La struttura della griglia',text:'Il Sudoku classico è formato da 81 celle, organizzate in 9 righe, 9 colonne e 9 quadranti da 3×3.',details:['Ogni riga deve contenere i numeri da 1 a 9 senza ripetizioni.','Ogni colonna deve contenere i numeri da 1 a 9 senza ripetizioni.','Anche ogni quadrante 3×3 deve contenere tutti i numeri da 1 a 9.']},
  {n:'02',title:'Singolo possibile',text:'Una cella può contenere soltanto un numero che non è già presente nella sua riga, colonna o nel suo quadrante.',details:['Controlla quali numeri mancano nella riga.','Escludi quelli già presenti nella colonna.','Escludi quelli presenti nel quadrante.','Se resta una sola possibilità, hai trovato il numero.']},
  {n:'03',title:'Singolo nascosto',text:'Un numero può avere una sola posizione possibile all’interno di una riga, colonna o quadrante, anche se la cella ammette altri candidati.',details:['Scegli un numero che manca in una regione.','Controlla tutte le celle vuote della regione.','Se soltanto una cella può ospitarlo, inseriscilo lì.']},
  {n:'04',title:'Procedere con metodo',text:'Risolvi prima le zone più complete e aggiorna le possibilità dopo ogni numero inserito.',details:['Evita di indovinare quando stai imparando.','Dopo ogni inserimento ricontrolla righe, colonne e quadranti.','Se ti blocchi, passa a un’altra zona della griglia.']}
];
export default function LearnPage() {
  const [open, setOpen] = useState('01');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const correct = answer === '3';
  return <main className="page-shell container"><div className="page-title"><span className="eyebrow">SUDOKU ACADEMY / 03</span><h1>Impara la logica.<br/><em>Una regola alla volta.</em></h1><p>Le basi per capire il Sudoku e affrontare le griglie con metodo.</p></div>
    <div className="learn-layout"><section className="lesson-list"><div className="subsection-heading"><span className="eyebrow">PERCORSO GUIDATO</span><h2>Lezioni fondamentali</h2></div>{lessons.map(item=><article className={`lesson-item ${open===item.n?'expanded':''}`} key={item.n}><button type="button" className="lesson-toggle" onClick={()=>setOpen(open===item.n?'':item.n)}><span className="lesson-n">{item.n}</span><span className="lesson-name">{item.title}<small>{item.text}</small></span><span className="lesson-plus">{open===item.n?'−':'+'}</span></button>{open===item.n&&<div className="lesson-details"><ul>{item.details.map(d=><li key={d}>{d}</li>)}</ul></div>}</article>)}</section>
    <aside className="quiz-card"><span className="eyebrow">METTITI ALLA PROVA</span><h2>Mini quiz</h2><p>In un Sudoku classico, quanti numeri diversi possono comparire in ogni riga?</p><div className="quiz-options">{['6','8','9','10'].map(n=><button type="button" className={answer===n?'chosen':''} onClick={()=>{setAnswer(n);setChecked(false);}} key={n}>{n}</button>)}</div><button type="button" className="button primary quiz-submit" disabled={!answer} onClick={()=>setChecked(true)}>Verifica risposta</button>{checked&&<p className={`quiz-feedback ${correct?'correct':'incorrect'}`}>{correct?'Esatto! Ogni riga contiene i numeri da 1 a 9.':'Non proprio. Ricorda: la griglia classica usa i numeri da 1 a 9.'}</p>}</aside></div>
  </main>;
}
