---
tags:
  - mondo/l2f
  - progetto
---

# E-commerce B2B

Catalogo ordinabile per officine: login -> prezzi netti -> carrello -> invio ordine (**no pagamento online**; l'ordine arriva a info@l2f.it e va gestito nel [[Pannello Admin]]).

## Stato (attivo)
- [[Catalogo L2F]] navigabile (categorie -> famiglia -> filtri), con **quick-cart** in hover e **vista a righe/griglia**.
- [[Area Clienti]]: login, sblocco netti, carrello, **storico ordini**, [[Cashback]], [[Corsi]].
- [[Backend Supabase]] + RLS; schede prodotto.

## Modello cliente
- L'officina **si autoregistra** (stato in attesa). L'**admin** la attiva e le assegna il **codice cliente** del gestionale.
- Nessuna integrazione diretta con l'ERP **AS/400** di CRA: il ponte è l'**export CSV** degli ordini dal [[Pannello Admin]].

Fase 2: visore 3D prodotti. Architettura condivisa con CRA -> [[Interconnessioni]].
