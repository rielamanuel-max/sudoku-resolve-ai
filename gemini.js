
const DEFAULT_MODEL = 'gemini-3.8-flash';

export function sendJson(res, status, payload) {
  res.status(status).setHeader(
    'Content-Type',
    'application/json; charset=utf-8'
  );
  res.setHeader('Cache-Control', 'no-store');
  return res.send(JSON.stringify(payload));
}

export function getApiKey() {
  return process.env.GEMINI_API_KEY;
}

export function validGrid(grid) {
  return Array.isArray(grid) &&
    grid.length === 9 &&
    grid.every(row =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every(value =>
        Number.isInteger(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 9
      )
    );
}

// Converte lo schema JSON nel formato Schema di Gemini.
function normalizeSchema(schema) {
  if (Array.isArray(schema)) {
    return schema.map(normalizeSchema);
  }

  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  const result = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type' && typeof value === 'string') {
      result.type = value.toUpperCase();
    } else if (key === 'properties') {
      result.properties = Object.fromEntries(
        Object.entries(value).map(([name, item]) => [
          name,
          normalizeSchema(item)
        ])
      );
    } else if (key === 'items') {
      result.items = normalizeSchema(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function callGemini(input, schema) {
  const apiKey = getApiKey();

  if (!apiKey) {
    const error = new Error('API_KEY_MISSING');
    error.status = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  // Converte il formato interno nel formato generateContent.
  const parts = input.map(item => {
    if (item.type === 'text') {
      return { text: item.text };
    }

    if (item.type === 'image') {
      return {
        inline_data: {
          mime_type: item.mime_type,
          data: item.data
        }
      };
    }

    throw new Error(`Tipo di contenuto non supportato: ${item.type}`);
  });

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      ...(schema ? {
        responseSchema: normalizeSchema(schema)
      } : {})
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(requestBody)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      payload?.error?.message ||
      `Gemini API ha risposto con HTTP ${response.status}`;

    console.error('Gemini API error:', detail);

    const error = new Error(detail);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }

  const outputText = payload?.candidates?.[0]?.content?.parts
    ?.filter(part => typeof part.text === 'string')
    .map(part => part.text)
    .join('\n');

  if (!outputText) {
    const error = new Error(
      'Gemini non ha restituito un risultato leggibile. Riprova.'
    );
    error.status = 502;
    throw error;
  }

  try {
    return JSON.parse(outputText);
  } catch {
    const error = new Error(
      'La risposta di Gemini non è un JSON valido. Riprova.'
    );
    error.status = 502;
    throw error;
  }
}
