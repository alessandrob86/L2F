# Edge function L2F

Funzioni del progetto Supabase `cjvtynutpsatwauocrdf` che appartengono al sito L2F.
Il progetto è condiviso con il CRA: le funzioni del CRA stanno nel repository Cra2.0.

`send-contact`, `send-iscrizione`, `course-reminders` e `send-preview` sono state
scaricate dal server il 26 agosto 2026, dove giravano senza che il sorgente
esistesse in repository. Il codice qui è quello ripreso dal server, non rivisto:
prima di ridistribuirne una, confronta.

## Elenco

| Funzione | A che serve | verify_jwt |
|---|---|---|
| `send-contact` | Modulo contatti del sito. Valida i campi, salva la riga in `messaggi`, invia la segnalazione a `CONTACT_TO` (default `info@l2f.it`) con reply-to del mittente. | `true` |
| `send-iscrizione` | Parte a ogni iscrizione a un corso. Ricava l'officina dal JWT del chiamante, legge il corso da `corsi`, manda a `info@l2f.it` la notifica di adesione. | `true` |
| `course-reminders` | Promemoria dei corsi in arrivo. Vedi sotto. | `false` |
| `send-preview` | Manda un'email di prova col template Academy, per vederne la resa nei client di posta. Dati finti, nessuna lettura di corsi o officine. | `false` |
| `send-order` | Invio degli ordini. Era già in repository. | `true` |

Tutte spediscono con Resend: `RESEND_API_KEY`, mittente da `CONTACT_FROM`.
Se la chiave manca, `send-contact` e `send-iscrizione` rispondono comunque `ok`
segnalando che l'email non è partita.

## Cosa gira da solo

Solo `course-reminders`. Lavoro pg_cron `course-reminders-daily`, schedule
`0 8 * * *`, attivo: ogni mattina fa un `net.http_post` sull'endpoint della
funzione.

Passata giornaliera: prende i corsi attivi con `data_corso` da adesso a otto
giorni, calcola quanto manca e invia a due soglie — sette giorni e un giorno.
Ogni invio riuscito viene annotato in `corso_promemoria` (`iscrizione_id` +
`soglia`), che è quello che impedisce il doppione se la funzione viene rieseguita
nello stesso giorno.

Le altre partono da un'azione: `send-contact` e `send-iscrizione` dal sito,
`send-preview` a mano.

## Cosa risponde senza autenticazione

`course-reminders` e `send-preview` hanno `verify_jwt = false`: l'endpoint accetta
la richiesta di chiunque, senza token. Non sono aperte, ma il controllo è dentro
la funzione, non davanti.

Entrambe pretendono l'intestazione `x-cron-secret` e la confrontano con la riga
`cron_secret` di `app_config`; se manca o non corrisponde, rispondono 401 e non
fanno nulla. Il segreto sta nel database, non nelle variabili d'ambiente, ed è
lo stesso per le due funzioni — cambiarlo va fatto insieme al comando del cron,
che se lo porta dentro.

Conseguenze pratiche: chi conosce il segreto può far partire un giro di
promemoria fuori orario (gli invii già annotati non si ripetono) e può far
spedire l'anteprima a un indirizzo a scelta, visto che `send-preview` accetta
`to` dal corpo della richiesta.

Le altre tre restano dietro `verify_jwt = true`: senza JWT valido il gateway
respinge prima che la funzione parta.
