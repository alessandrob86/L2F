---
tags:
  - mondo/l2f
  - tecnico
  - interconnessione
---

# Backend Supabase

Database B2B **condiviso** L2F / [[Centro Ricambi Auto|CRA]]. Progetto "L2f" (account DottorB1607).

## Tabelle (public)
- **officine** (account B2B): stato (in_attesa/attiva/sospesa), pacchetto, cashback_rate, **obiettivo_cashback**, **crediti_corsi**, **codice_cliente**, **is_admin**.
- **products** (+ product_netto gated) - product_variants (+ netto) - product_families.
- **orders** / **order_items** (numero auto ORD-YYYY-NNNNN).
- **corsi** / **iscrizioni_corsi** (con_credito / prezzo_pagato) / **corso_promemoria** -> [[Corsi]].
- **messaggi** (form [[Contatti]]) - **audit_officine** (registro modifiche, vedi [[Pannello Admin]]) - **app_config** (segreto cron, site_url).

## Sicurezza
- RLS: netti/ordini solo a officina **attiva**; ognuna vede solo i propri dati; l'**admin** vede/gestisce tutto (funzione `is_admin()`).
- Trigger: auto-crea officina alla registrazione; contatore iscritti corsi; **guard crediti** (rifiuta iscrizione a credito oltre il plafond); audit log officine.

## Edge Functions (Resend, dominio l2f.it)
- send-contact, send-order, send-iscrizione, **course-reminders** (cron via pg_cron, promemoria 7gg/1gg prima del corso), send-preview. Email con **template brandizzato L2F** (logo + rosso).
- **Storage**: bucket pubblico `corsi` (foto corsi + loghi per le email).

Collega [[E-commerce B2B]] - [[Area Clienti]] - [[Corsi]] - [[Pannello Admin]] - [[Interconnessioni]].
