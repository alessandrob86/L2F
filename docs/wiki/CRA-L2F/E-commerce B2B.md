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

## Unità di vendita: il carrello ragiona a confezioni (2026-08-01)

I [[Lubrificanti]] hanno il prezzo **al litro**, ma non si vendono a litri sfusi. Finché il carrello prendeva il prezzo di riga così com'era, un fusto da 200 L entrava a **3,60 €** invece di 720 €: un errore d'acquisto di fattore 200, su entrambi i siti.

La regola vive in un posto solo — `unitaVendita()` in `src/lib/catalog.ts` (L2F) e `confezioneLitri()` in `src/lib/craCatalog.js` (CRA):

| Imballo | `unita_prezzo` | Una unità è | Prezzo di riga |
|---|---|---|---|
| `200 L`, `60 L` | litro | **il fusto** | prezzo/L × litri |
| `20 L` | litro | **la latta** | prezzo/L × litri |
| `12×1 L` | litro | **la bottiglia da 1 L** | prezzo/L (il cartone da 12 resta scritto nell'etichetta) |
| `20 Kg`, `220 Kg` | pezzo | il contenitore | invariato, il prezzo è già quello |

Sulla scheda prodotto la cifra grande è **quella che si paga**; il prezzo al litro scende sotto come riferimento («Fusto 200 L · 13,25 €/L»), e sopra lo stepper c'è scritto come si legge la quantità.

Il prezzo dei **cartoni** è per singola bottiglia, non per cartone: scelta esplicita, coerente col foglio MASTER dove la colonna prezzo di quella riga è un prezzo al litro. Se un domani si vorrà vendere il cartone intero, si cambia `fattore` in `unitaVendita()` e basta.

Conseguenza sull'ordine: `order_items.prezzo_unitario` è il prezzo di **una confezione**, e `quantita` è il numero di confezioni. L'Excel per il gestionale (`send-order`) porta lo stesso conto — codice del formato, quantità in fusti, prezzo del fusto.

> ⚠️ La chiave del carrello in `localStorage` è passata a `l2f_cart_v2`: un carrello v1 conterrebbe righe col vecchio significato di prezzo.

## Modello cliente
- L'officina **si autoregistra** (stato in attesa). L'**admin** la attiva e le assegna il **codice cliente** del gestionale.
- Nessuna integrazione diretta con l'ERP **AS/400** di CRA: il ponte è l'**export CSV** degli ordini dal [[Pannello Admin]].

Fase 2: visore 3D prodotti. Architettura condivisa con CRA -> [[Interconnessioni]].
