export const config = { maxDuration: 60, api: { bodyParser: { sizeLimit: '4mb' } } };

import { callGemini, sendJson, validGrid } from '../lib/gemini.js';

const schema = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    row: { type: 'integer', minimum: 0, maximum: 8 },
    col: { type: 'integer', minimum: 0, maximum: 8 },
    value: { type: 'integer', minimum: 1, maximum: 9 },
    technique: { type: 'string' },
    explanation: { type: 'string' }
  },
  required: ['found', 'row', 'col', 'value', 'technique', 'explanation']
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo non consentito.' });
  const grid = req.body?.grid;
  if (!validGrid(grid)) return sendJson(res, 400, { error: 'La matrice deve essere composta da 9 righe e 9 colonne con valori da 0 a 9.' });

  const prompt = `Sei un tutor didattico esperto di Sudoku classico 9x9. La matrice usa 0 per le celle vuote.
Trova UNA SOLA prossima mossa logicamente dimostrabile, preferendo nell'ordine: singolo nudo (naked single), singolo nascosto (hidden single) in riga/colonna/quadrante, poi una tecnica elementare spiegabile.
Non usare tentativi, backtracking o supposizioni. Non inventare una mossa. La riga e la colonna devono essere indici da 0 a 8.
Spiega in italiano in modo chiaro e breve perché quella cifra è obbligata, citando riga, colonna, quadrante o candidati pertinenti. Il valore deve essere una cifra da 1 a 9 e la cella scelta deve essere vuota.
Se la griglia è completa oppure non trovi una mossa logica certa, imposta found=false e spiega il motivo.
Matrice: ${JSON.stringify(grid)}`;

  try {
    const result = await callGemini(prompt, schema);
    if (typeof result.found !== 'boolean' || !Number.isInteger(result.row) || !Number.isInteger(result.col) || !Number.isInteger(result.value)) {
      return sendJson(res, 502, { error: 'Il tutor ha restituito una risposta incompleta.' });
    }
    return sendJson(res, 200, result);
  } catch (error) {
    console.error('Gemini hint error:', error.message);
    const message = error.message === 'API_KEY_MISSING'
      ? 'Manca GEMINI_API_KEY nelle variabili ambiente di Vercel.'
      : error.message;
    return sendJson(res, error.status || 500, { error: message });
  }
}
