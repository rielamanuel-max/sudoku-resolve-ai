import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GRID_KEY = 'sudoku-resolve-grid-v1';

function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
      resolve({ mimeType: 'image/jpeg', imageBase64: dataUrl.split(',')[1] });
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Non riesco ad aprire questa immagine. Prova con un JPG o PNG.')); };
    image.src = url;
  });
}

export default function ScanPage() {
  const [preview, setPreview] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('Seleziona un file immagine valido.'); return; }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setName(file.name || 'Fotografia Sudoku');
    setStatus('');
    setProgress(0);
  }

  async function scan() {
    if (!preview || busy) return;
    setBusy(true);
    setProgress(8);
    setStatus('Preparazione della fotografia…');
    try {
      const response = await fetch(preview);
      const file = await response.blob();
      const prepared = await prepareImage(new File([file], name || 'sudoku.jpg', { type: file.type || 'image/jpeg' }));
      if (prepared.imageBase64.length > 3_800_000) throw new Error('La fotografia è ancora troppo pesante. Prova a ritagliarla intorno al Sudoku.');
      setProgress(22);
      setStatus('Gemini sta analizzando la fotografia…');
      const apiResponse = await fetch('/api/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prepared)
      });
      const result = await apiResponse.json().catch(() => ({}));
      if (!apiResponse.ok) throw new Error(result.error || `Errore del server (${apiResponse.status}).`);
      if (!Array.isArray(result.grid) || result.grid.length !== 9 || !result.grid.every(row => Array.isArray(row) && row.length === 9)) {
        throw new Error('La risposta di Gemini non contiene una griglia 9×9 valida.');
      }
      const grid = result.grid.map(row => row.map(value => value === 0 ? '' : String(value)));
      const count = grid.flat().filter(Boolean).length;
      if (count < 8) throw new Error('Gemini non ha individuato abbastanza numeri. Prova con una foto più nitida, frontale e ben illuminata.');
      localStorage.setItem(GRID_KEY, JSON.stringify(grid));
      setProgress(100);
      setStatus(`Gemini ha riconosciuto ${count} cifre. Apri la griglia per controllarle e correggerle.`);
      navigate('/solve', { state: { scanned: true, count } });
    } catch (error) {
      setStatus(error.message || 'Errore durante il riconoscimento. Riprova.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="page-shell container">
    <div className="page-title"><span className="eyebrow">GEMINI VISION / 02</span><h1>Porta il tuo Sudoku<br/><em>nel digitale.</em></h1><p>Carica una foto: Gemini riconosce la griglia e trascrive i numeri automaticamente.</p></div>
    <section className="scan-layout">
      <div className="scan-panel">
        <div className="scan-panel-head"><div><span className="eyebrow">01 — CARICA IMMAGINE</span><h2>La tua fotografia</h2></div><span className="scan-symbol">▧</span></div>
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => handleFile(e.target.files?.[0])}/>
        {preview ? <div className="image-preview"><img src={preview} alt="Anteprima del Sudoku caricato"/><button className="remove-image" disabled={busy} onClick={() => { URL.revokeObjectURL(preview); setPreview(''); setName(''); setStatus(''); setProgress(0); if (inputRef.current) inputRef.current.value = ''; }} type="button">Rimuovi immagine</button></div> :
          <button className="upload-zone" type="button" onClick={() => inputRef.current?.click()}><span className="upload-icon">↑</span><b>Scatta o seleziona una fotografia</b><small>JPG, PNG o WEBP · dal tuo dispositivo</small><span className="upload-action">Scegli file</span></button>}
        {name && <p className="file-name">{name}</p>}
        {preview && <button className="wide-button primary scan-button" type="button" onClick={scan} disabled={busy}>{busy ? 'Gemini sta analizzando…' : '✦ Analizza con Gemini'}</button>}
        {busy && <div className="scan-progress"><span style={{ width: `${progress}%` }}/></div>}
        {status && <p className="scan-status" role="status">{status}</p>}
      </div>
      <div className="scan-instructions"><span className="eyebrow">02 — RICONOSCIMENTO AI</span><h2>Dalla foto alla soluzione</h2><p>Gemini Vision analizza direttamente l'immagine e restituisce una matrice Sudoku in formato JSON.</p><ol><li>Fotografa una sola griglia, dall'alto e senza ombre.</li><li>Assicurati che tutte le 81 caselle siano visibili.</li><li>Premi “Analizza con Gemini”.</li><li>Controlla e correggi i numeri riconosciuti nella griglia interattiva.</li><li>Chiedi un suggerimento oppure risolvi il Sudoku.</li></ol><p className="scan-note">La chiave API rimane sul server e non viene esposta nel browser. È necessaria una connessione Internet.</p></div>
    </section>
  </main>;
}
