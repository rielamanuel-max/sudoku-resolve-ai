const DEFAULT_MODEL = 'gemini-3.8-flash';

export function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.send(JSON.stringify(payload));
}

export function getApiKey() {
  return process.env.GEMINI_API_KEY;
}

export function validGrid(grid) {
  return Array.isArray(grid) && grid.length === 9 && grid.every(row =>
    Array.isArray(row) && row.length === 9 && row.every(value => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 9)
  );
}

export async function callGemini(input, schema) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error('API_KEY_MISSING');
    error.status = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const response = await fetch('https://generativelanguage.googleapis.com/v1/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      model,
      input,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema
      },
      generation_config: { thinking_level: 'low' }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || `Gemini API ha risposto con HTTP ${response.status}`;
    const error = new Error(detail);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }

  let outputText = payload.output_text;
  if (!outputText && Array.isArray(payload.steps)) {
    const outputStep = [...payload.steps].reverse().find(step => step.type === 'model_output');
    outputText = outputStep?.content?.filter(part => part.type === 'text').map(part => part.text).join('\n');
  }
  if (!outputText) {
    const error = new Error('Gemini non ha restituito un risultato leggibile. Riprova.');
    error.status = 502;
    throw error;
  }

  try {
    return JSON.parse(outputText);
  } catch {
    const error = new Error('La risposta di Gemini non è un JSON valido. Riprova.');
    error.status = 502;
    throw error;
  }
}
