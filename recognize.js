export const config = { maxDuration: 60, api: { bodyParser: { sizeLimit: '4mb' } } };

import { callGemini, sendJson } from '../lib/gemini.js';

const schema = {
  type: 'object',
  properties: {
    grid: {
      type: 'array',
      description: 'Matrice Sudoku di 9 righe e 9 colonne. Usa 0 per ogni casella vuota.',
      minItems: 9,
      maxItems: 9,
      items: {
        type: 'array',
        minItems: 9,
        maxItems: 9,
        items: { type: 'integer', minimum: 0, maximum: 9 }
      }
    }
  },
  required: ['grid']
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo non consentito.' });
  const { imageBase64, mimeType } = req.body || {};
  if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
    return sendJson(res, 400, { error: 'Immagine mancante o non valida.' });
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(mimeType)) return sendJson(res, 400, { error: 'Formato immagine non supportato. Usa JPG, PNG o WEBP.' });
  if (imageBase64.length > 3_800_000) return sendJson(res, 413, { error: 'Immagine troppo grande. Prova con una foto più leggera.' });

  const prompt = `Sei un sistema di visione artificiale specializzato esclusivamente nella lettura di Sudoku classici 9x9.
Analizza attentamente l'immagine allegata. Individua la griglia principale e trascrivi i numeri stampati o scritti a mano nelle rispettive celle.
Restituisci una matrice esatta di 9 righe per 9 colonne. Usa gli interi da 1 a 9 per le cifre chiaramente visibili e 0 per le celle vuote o per le cifre che non puoi leggere con sicurezza.
Leggi da sinistra a destra e dall'alto verso il basso. Non inventare numeri, non completare il Sudoku e non correggere la griglia secondo le regole: trascrivi soltanto ciò che è visibile.
Se l'immagine non contiene una griglia Sudoku leggibile, restituisci comunque una matrice 9x9 di zeri.`;

  try {
    const result = await callGemini([
      { type: 'text', text: prompt },
      { type: 'image', data: imageBase64, mime_type: mimeType }
    ], schema);

    const grid = result?.grid;
    const valid = Array.isArray(grid) && grid.length === 9 && grid.every(row =>
      Array.isArray(row) && row.length === 9 && row.every(n => Number.isInteger(n) && n >= 0 && n <= 9)
    );
    if (!valid) return sendJson(res, 502, { error: 'Gemini ha restituito una griglia con un formato non valido.' });
    return sendJson(res, 200, { grid, model: process.env.GEMINI_MODEL || 'gemini-3.8-flash' });
  } catch (error) {
    console.error('Gemini recognize error:', error.message);
    const message = error.message === 'API_KEY_MISSING'
      ? 'Manca GEMINI_API_KEY nelle variabili ambiente di Vercel.'
      : error.message;
    return sendJson(res, error.status || 500, { error: message });
  }
}
