# Sudoku Resolve — AI Vision & Tutor

Web application React + Vite per fotografare un Sudoku, riconoscerlo con Google Gemini, correggere la griglia, ricevere suggerimenti logici e risolverlo localmente.

## Funzioni

- Acquisizione da file o fotocamera dello smartphone.
- Riconoscimento multimodale della fotografia tramite Gemini Vision.
- Output OCR in JSON strutturato con matrice 9×9 (0 = cella vuota).
- Griglia HTML interattiva per correggere i numeri riconosciuti.
- Tutor Gemini: una prossima mossa logica con spiegazione in italiano.
- Sintesi vocale della spiegazione tramite Web Speech API del browser.
- Risolutore locale con Backtracking e controllo dei conflitti.
- Evidenziazione delle celle completate dal solver.
- Salvataggio automatico della griglia nel browser.
- Deploy pronto per Vercel con API server-side: la chiave Gemini non viene inviata al client.

## Requisiti

- Node.js 20 o superiore.
- Una chiave Gemini API creata da Google AI Studio.
- Account Vercel per pubblicare frontend e funzioni API nello stesso progetto.

## Configurazione della chiave Gemini

1. Crea una chiave API in Google AI Studio: https://aistudio.google.com/app/apikey
2. Apri il progetto su Vercel → **Settings → Environment Variables**.
3. Aggiungi `GEMINI_API_KEY` con il valore della tua chiave.
4. Aggiungi anche `GEMINI_MODEL` con valore `gemini-3.8-flash` (facoltativo: è già il valore predefinito).
5. Salva e fai un nuovo deploy.

**Non inserire mai la chiave in `src/`, in file `.js` del frontend o in variabili `VITE_*`.** Il browser chiama `/api/recognize` e `/api/hint`; le funzioni Vercel contattano Gemini lato server.

## Avvio locale

```bash
npm install
```

Per avviare anche le funzioni serverless `/api`, usa Vercel CLI:

```bash
npx vercel dev
```

Il comando Vite `npm run dev` avvia soltanto il frontend: le chiamate API Gemini richiedono il runtime serverless e le variabili ambiente.

## Build frontend

```bash
npm run build
```

L'output statico viene creato in `dist/`. Le cartelle `api/` sono funzioni serverless Node.js riconosciute automaticamente da Vercel.

## API interne

### `POST /api/recognize`

Body JSON:

```json
{
  "mimeType": "image/jpeg",
  "imageBase64": "..."
}
```

Risposta:

```json
{
  "grid": [[0,0,0,0,0,0,0,0,0]]
}
```

La matrice reale contiene esattamente 9 righe da 9 interi. `0` indica una cella vuota.

### `POST /api/hint`

Body JSON: `{ "grid": [[...9 righe...]] }`, con valori da 0 a 9.

Risposta strutturata: `found`, `row`, `col`, `value`, `technique`, `explanation`. Gli indici di riga e colonna sono 0–8.

## Architettura

- **Frontend:** React, Vite, React Router.
- **Vision/OCR:** Gemini multimodale, chiamato dal backend Vercel.
- **Output:** JSON strutturato per la matrice 9×9 e per il suggerimento.
- **Tutor:** Gemini propone la mossa; il frontend verifica che la cella sia vuota e che la cifra non generi conflitti.
- **Solver:** algoritmo Backtracking locale, indipendente dall'AI, per una soluzione deterministica.
- **Audio:** Web Speech API del browser.
- **Hosting:** Vercel (frontend statico + funzioni serverless).

## Documentazione tecnica

Nel progetto è incluso `RELAZIONE_TECNICA.md`, una relazione sintetica da completare con nome, classe, data, screenshot e risultati dei test eseguiti.

Riferimenti ufficiali: [Gemini API — comprensione delle immagini](https://ai.google.dev/gemini-api/docs/image-understanding), [Gemini API — output strutturati](https://ai.google.dev/gemini-api/docs/structured-output), [Gemini API — guida introduttiva e modello Flash](https://ai.google.dev/gemini-api/docs/get-started).

## Note importanti

- Gemini può interpretare male cifre poco leggibili: controlla sempre la griglia prima di risolvere.
- La chiave API e le quote dipendono dal progetto Google AI Studio.
- Il modello predefinito è configurabile con `GEMINI_MODEL`.
- Il progetto non contiene una chiave API personale: ciascun deploy deve configurare la propria variabile `GEMINI_API_KEY`.
