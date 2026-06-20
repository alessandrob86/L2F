---
tags:
  - mondo/l2f
  - tecnico
---

# Pannello Admin

Back-office riservato su `/admin` (account con `is_admin`). Gestisce ciò che l'ERP **AS/400** di [[Centro Ricambi Auto|CRA]] non integra direttamente.

## Ordini
- Tutti gli ordini, cambio **stato** (inviato -> in lavorazione -> evaso -> annullato).
- **Export CSV** (codice cliente + codice articolo + q.tà + prezzi) -> import nel gestionale AS/400: è il "ponte" al posto dell'integrazione.

## Officine
- **Attivazione** delle registrazioni + assegnazione **codice cliente**.
- Pacchetto, **cashback %**, **obiettivo cashback**, **crediti corsi**. Ragione sociale in sola lettura (è quella inserita dal cliente).
- Conteggio corsi per officina: frequentati / crediti usati / acquistati.
- **Registro modifiche account** (audit log nascosto): chi/quando/cosa è stato modificato (utile con più admin).

## Corsi
- Crea/modifica corsi (vedi [[Corsi]]): foto, date, scadenza iscrizioni, prezzo, min. partecipanti.
- Iscritti per corso con badge **"A credito"** / **"Acquistato EUR"**.

Collega [[E-commerce B2B]] - [[Backend Supabase]] - [[Corsi]] - [[Area Clienti]].
