---
tags:
  - mondo/l2f
  - progetto
---

# Corsi (L2F Academy)

Catalogo formazione su `/corsi` (area riservata) + gestione nel [[Pannello Admin]]. Parte di [[L2F Academy]].

## Crediti corso
- Ogni officina ha dei **crediti** (`crediti_corsi`, default **1/anno**, l'admin può aumentarli).
- Iscrizione **a credito** (gratis) finché ci sono crediti; poi **acquisto** del corso (prezzo).
- Limite **blindato lato server** (un'iscrizione a credito oltre il plafond viene rifiutata dal DB).

## Corso (campi gestiti dall'admin)
- Titolo, foto, descrizione, **punti chiave**, durata, sede, posti.
- Date: inizio, fine, **scadenza iscrizioni**.
- **Prezzo** (per chi non ha crediti) e **min. partecipanti** (sotto il quale il corso non è "confermato").

## Esperienza cliente
- Card con stato "X/min per confermare" oppure "Confermato".
- Azione: **Iscritto** / **Usa 1 credito** / **Acquista EUR** / "Iscrizioni chiuse".
- **Countdown live**: prima dell'iscrizione conta alla scadenza iscrizioni; dopo l'iscrizione si trasforma e conta all'inizio del corso.
- **Promemoria email** automatici 7 e 1 giorno prima (vedi [[Backend Supabase]]).

L'acquisto è una richiesta (no pagamento online, fatturato offline). Il visitatore non loggato vede un invito a [[Pacchetti HOME e FLEX|diventare officina]].
