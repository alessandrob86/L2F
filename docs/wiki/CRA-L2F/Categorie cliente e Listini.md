---
tags:
  - mondo/l2f
  - mondo/cra
  - tecnico
---

# Categorie cliente e Listini

Sistema di **politiche commerciali granulari**: prezzi differenziati per segmento di clientela, su **entrambi** i siti. Sostituisce il modello [[Distinte netti]] (Nord/Sud), che ne è diventato un caso particolare. Vedi [[Catalogo e Sync]] e [[Backend Supabase]].

## I tre concetti

1. **Categoria cliente** — segmento definito liberamente dall'admin: zona (`nord`, `sud`, `centro`), valore (`vip`, `speculatore`), rischio (`moroso`), pagamento (`contrassegno`)… Un cliente ha **una sola** categoria (`officine.categoria_cliente`, `null` = nessuna).
2. **Listino** — un **gruppo di prodotti con prezzi dedicati**, assegnabile a una o più categorie. L'appartenenza al listino **è** la presenza della riga prezzo: non esiste un'entità "gruppo" separata.
3. **Prezzo universale** — quello sulla scheda prodotto (`cra_products.prezzo`, `product_netto`/`product_variant_netto`). Vale per chi non ha categoria o per i prodotti non coperti da alcun listino.

## Schema

```
categorie_cliente(id, nome, colore, sort_order, attiva)
officine.categoria_cliente → categorie_cliente(id)

listini(id, nome, descrizione, priorita, attivo, created_at)
listino_categorie(listino_id, categoria_id)     -- vale per un gruppo di clienti
listino_officine (listino_id, officina_id)      -- vale per UN cliente solo

listino_prezzi_prod(listino_id, product_id, prezzo_netto)  -- prodotti (catalogo unico)
listino_prezzi_var (listino_id, variant_id, prezzo_netto)  -- formati
```

`listino_prezzi_cra` non esiste più: è sparita con `cra_products` quando i due cataloghi sono diventati uno solo (vedi [[Catalogo e Sync]]).

**Il listino sovrascrive solo il NETTO.** Il `prezzo_listino` pubblico L2F resta universale (è il prezzo di listino, uguale per tutti); su CRA esiste un prezzo solo, che è già il netto.

## Come si risolve il prezzo

Funzioni SQL `SECURITY DEFINER` legate ad `auth.uid()`:

- **CRA** → `cra_netto_utente()` → `(product_id, variant_id, prezzo_netto)`
- **L2F** → `l2f_netto_utente()` → stessa forma

Le due funzioni sono gemelle: cambia solo il cancello (`cra_abilitata` / `l2f_abilitata`).

**Tre livelli, dal più specifico al più generale** (2026-08-01):

1. **prezzo dedicato al cliente** — contenitore legato a quella officina in `listino_officine`
2. **prezzo della sua categoria** — contenitore legato alla categoria in `listino_categorie`
3. **prezzo base** — `product_netto` / `product_variant_netto`

In SQL è una sola CTE `mie_liste` che raccoglie i contenitori validi per l'utente marcandoli `personale`, e un `row_number()` che ordina `personale desc, priorita desc, created_at desc`. Se il cliente non è attivo/abilitato al sito, le funzioni restituiscono **zero righe**.

**Perché le funzioni e non una query diretta:** le tabelle `listino_prezzi_*` sono **leggibili solo dall'admin** (RLS). Così un cliente non può vedere i prezzi riservati ad altri segmenti. L'app riceve solo il proprio prezzo.

### Prezzo per un cliente solo

Il contenitore personale (`Prezzi dedicati · <ragione sociale>`, priorità 100) **nasce al primo prezzo** che si imposta e non prima: un cliente senza prezzi speciali non lascia contenitori vuoti. Si gestisce dalla **scheda del cliente** in *Officine* → «Prezzi solo per questo cliente», non dalla matrice: una colonna per cliente renderebbe la matrice illeggibile, e un prezzo speciale è un fatto del cliente, non del catalogo.

Togliere la riga riporta il cliente al prezzo della sua categoria. Il controllo di integrità **non** segnala questi contenitori come orfani: non avere categorie è la loro natura.

### Conflitti
Con una categoria per cliente il conflitto è raro ma possibile: **due listini** assegnati **alla stessa categoria** che contengono lo stesso prodotto. Lo risolve `listini.priorita` (vince il più alto). Campo avanzato: nell'uso normale non serve toccarlo.

## Vocabolario dell'interfaccia (dal ridisegno del 2026-07-25)

La parola **listino** è **bandita** dal pannello: era ambigua due volte (nel database è il contenitore prezzi, nel foglio MASTER la colonna `listino` è il prezzo *pubblico*). Sopravvive solo dentro «Impostazioni › Uso avanzato», chiamata **contenitore prezzi**.

| Concetto | Parola nell'interfaccia |
|---|---|
| `categorie_cliente` | **categoria cliente** (unico significato di "categoria") |
| `cra_categories` | **reparto** (macro › sottoreparto) |
| prezzo universale | **prezzo base** |
| riga di `listino_prezzi_*` | **prezzo dedicato** |
| esecuzione del sync | **Aggiorna dal foglio** (mai "sincronizza": il verso è uno solo) |

## Dove si gestisce ([[Pannello Admin]])

Tutto nel back-office **CRA**, a tutta larghezza. Schede: **Prezzi · Prodotti · Officine · Proposte · Impostazioni**.

- **Prezzi** — la **matrice**: una riga per prodotto, una colonna per categoria cliente (più il *prezzo base*). Stessa forma del foglio MASTER. Interruttore *Ricambi CRA / Catalogo L2F*. Le modifiche si accumulano e si salvano insieme con una barra in fondo che **nomina la destinazione** ("12 modifiche · Base 3 · Sud 9").
- **Prodotti** — solo anagrafica (nome, foto, descrizione, reparto, tag, visibilità). Nessun prezzo.
- **Officine** — **un cliente per riga** (ridisegnata il 2026-08-01: la scheda sempre espansa diventava un muro già a dieci clienti). Sulla riga stanno nome, contatti e tre pastiglie di sola lettura — **stato**, **categoria** (col suo colore) e **siti abilitati** — così si legge tutto senza aprire niente. A destra due pulsanti che aprono verso il basso, uno per volta: **Anagrafica** (i campi da modificare) e **Prezzi** (i prezzi dedicati, col numero già impostato sul pulsante). Sopra, filtri per testo, stato e categoria; le officine **in attesa** salgono in cima perché sono le uniche che chiedono una decisione.
- **Impostazioni** — categorie cliente, *Aggiorna dal foglio*, coda **Da creare** (codici del foglio non a catalogo), e *Uso avanzato* con i contenitori prezzi e il **controllo di integrità** (contenitori orfani o doppi).

### Il blocco è per CELLA, non per riga

Cella in sola lettura ⟺ **il prodotto viene dal foglio** *e* **quella colonna è alimentata dal foglio**. Bloccare l'intera riga sarebbe una regressione: la categoria *Nord* non ha colonna nel foglio, quindi va compilata a mano anche sui prodotti che dal foglio arrivano.

Quali colonne comanda il foglio si legge da `app_config.sync_catalogo_ultimo` (scritto dalla Edge Function, leggibile dall'admin via policy RLS). Finché quel dato manca, si dichiara "gestita a mano" e si avvisa: **mai indovinare in senso restrittivo**.

Collega [[Catalogo e Sync]] · [[Backend Supabase]] · [[Pannello Admin]] · [[E-commerce B2B]].
