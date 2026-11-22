# Relazione tecnica — Sudoku Resolve: AI Vision & Tutor

**Materia:** Informatica / Laboratorio di Tecnologie Web  
**Studente/i:** [Inserire nome/i]  
**Classe:** [Inserire classe]  
**Data:** [Inserire data]

## 1. Obiettivo

Sudoku Resolve è una Web Application responsive che permette di acquisire la fotografia di un Sudoku cartaceo, trasformarla in una matrice digitale 9×9 e assistere l'utente nella risoluzione. L'applicazione separa il riconoscimento visivo, affidato a Gemini, dalla risoluzione matematica, eseguita localmente con Backtracking.

## 2. Architettura e tecnologie

- **Frontend:** React, Vite e React Router per le pagine e la navigazione.
- **Acquisizione:** input HTML per caricare un'immagine o usare la fotocamera del dispositivo.
- **Visione artificiale:** Google Gemini multimodale riceve l'immagine e restituisce una matrice 9×9 in JSON strutturato. Il valore `0` rappresenta una casella vuota.
- **Backend:** funzioni serverless Node.js su Vercel. Le funzioni `/api/recognize` e `/api/hint` chiamano Gemini mantenendo la chiave API sul server.
- **Verifica:** la griglia viene mostrata come elementi HTML interattivi e può essere corretta prima della risoluzione.
- **Solver:** algoritmo Backtracking con controllo dei conflitti tra righe, colonne e quadranti 3×3.
- **Tutor:** Gemini propone una mossa logica e una spiegazione in italiano; il frontend controlla che la mossa sia compatibile con la griglia.
- **Audio:** Web Speech API per leggere ad alta voce la spiegazione del tutor.

## 3. Flusso di funzionamento

1. L'utente carica o scatta una fotografia del Sudoku.
2. Il frontend ridimensiona e comprime l'immagine, quindi la invia all'endpoint server `/api/recognize`.
3. Il backend inoltra immagine e istruzioni a Gemini. Il modello restituisce un JSON con una matrice 9×9.
4. La matrice viene visualizzata nella griglia interattiva. L'utente può correggere eventuali errori di lettura.
5. Il pulsante **Suggerisci mossa con AI** invia la matrice al tutor Gemini, che restituisce una mossa e la relativa motivazione.
6. Il pulsante **Risolvi Sudoku** avvia il Backtracking nel browser e mette in evidenza le celle completate dall'algoritmo.

## 4. Sicurezza e gestione degli errori

La chiave `GEMINI_API_KEY` viene configurata nelle variabili ambiente del progetto Vercel e non viene inserita nel codice frontend né nel repository. Il file `.env.example` contiene soltanto un segnaposto. Le risposte del modello vengono controllate per formato, dimensioni della matrice e compatibilità delle mosse. L'utente deve comunque verificare i numeri riconosciuti dalla fotografia, perché una cifra poco leggibile può essere interpretata in modo errato.

## 5. Verifica e screenshot

**Screenshot 1 — Acquisizione e anteprima:** [Inserire screenshot della pagina Scansione]  
**Screenshot 2 — Griglia riconosciuta e modificabile:** [Inserire screenshot della pagina Risolutore]  
**Screenshot 3 — Suggerimento del tutor / soluzione:** [Inserire screenshot]

**Test da eseguire prima della consegna:**
- Riconoscimento di una foto nitida e frontale.
- Correzione manuale di una cifra riconosciuta in modo errato.
- Verifica del messaggio in presenza di numeri in conflitto.
- Richiesta di una mossa al tutor e lettura vocale della spiegazione.
- Risoluzione di un Sudoku valido e controllo delle celle completate.

**Nota:** completare questa sezione con screenshot e risultati dei test effettuati sulla propria installazione pubblicata.
