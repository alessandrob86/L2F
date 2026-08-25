---
tags:
  - mondo/l2f
  - mondo/cra
  - tecnico
  - interconnessione
---

# Catalogo e Sync

Registro della **fonte di verità** del catalogo prodotti e di come si propaga ai due siti. Nasce per chiudere il problema storico: il catalogo [[Centro Ricambi Auto|CRA]] era stato copiato a mano dai listini L2F **senza traccia delle scelte**, generando disallineamenti apparenti. Vedi [[Backend Supabase]] per le tabelle, [[Distinte netti]] per i prezzi per zona.

## Fonte di verità: Foglio MASTER

Un **unico** Google Sheet **"Listini L2F — MASTER"** (privato, condiviso col service account del sync). Un tab per listino, schema **fisso** (riga 1 = intestazione), grana **variante/imballo**. Niente foto nel master (restano su storage).

| Tab | Colonne |
|---|---|
| `batterie` | gamma, codice_l2f, codice_ex, box, ah, spunto, polo, dimensioni, listino, netto |
| `lampade` | codice_l2f, ece, tipologia, lumen, listino, netto, **SUD** |
| `lubrificanti` | sezione, nome, codice_l2f, imballo, listino, netto, specifiche |
| `filtri` | sezione, codice_l2f, applicazione, oe, listino, netto, **SUD** |
| `pastiglie` | codice_l2f, applicazione, lato, rif_brembo, listino, netto, **SUD** |

### Colonne prezzo: dinamiche, una per categoria cliente

- `listino` → prezzo di **listino pubblico** L2F (uguale per tutti).
- `netto` → **prezzo universale** (alias storico accettato: `netto_nord`).
- **qualsiasi altra colonna il cui nome coincide con una categoria cliente** → prezzi riservati a quella categoria. Match **case-insensitive**, accetta anche la forma `netto_<nome>`.

Flusso per aggiungere un segmento: crei la categoria **STRONG** nell'admin → aggiungi la colonna **STRONG** nel foglio → il sync **crea da solo** il listino omonimo, lo aggancia alla categoria e ci scrive i prezzi. Stesso vocabolario per i prodotti del foglio e per quelli inseriti a mano (che si prezzano dall'admin sulla stessa categoria).

### Chi vince tra foglio e pannello admin

Il foglio comanda **su ciò che contiene**:
- cella valorizzata → sovrascrive sempre;
- cella **vuota** in una colonna categoria → il prodotto **esce** da quel listino (torna all'universale).

Ciò che il foglio **non** contiene resta intatto: **prodotti assenti dal foglio** (inseriti a mano) e **categorie senza colonna** non vengono mai toccati. Così il lavoro fatto a schermo sui prodotti fuori catalogo-L2F è al sicuro.

Flusso: **modifico il MASTER → Edge Function `sync-catalogo` → Supabase → entrambi i siti**. Sostituisce il vecchio `sync-prezzi-cra` (CSV pubblico, solo prezzi CRA).

## Catalogo unico: L2F è il private label di CRA

**La regola di business.** L2F è il **private label di CRA**. Il sito L2F è la vetrina ufficiale del marchio e mostra **solo** prodotti L2F. Il portale CRA vende sia prodotti L2F (le linee che si sceglie di portarci) sia prodotti a **marchio generico** (Brembo, TRW, LuK…). La gerarchia è **a senso unico**: un marchio generico non comparirà mai su L2F.

**Una sola anagrafica** (`products` + `product_variants`) alimenta entrambe le vetrine — niente articoli duplicati. Due dimensioni per riga:

| Colonna | Significato |
|---|---|
| `marchio` | `'L2F'` per il private label, altrimenti il marchio (Brembo, TRW…) |
| `su_l2f` | visibile sul sito L2F — **vincolo a DB**: vero solo se `marchio='L2F'` |
| `su_cra` | visibile sul CRA Store — libero, è il comando "quali linee portare su CRA" |

Il vincolo `products_su_l2f_solo_private_label` fa rispettare la regola al **database**, non al codice.

**Due tassonomie convivono**: `family_id` → `product_families` (6 famiglie, navigazione del sito L2F) e `reparto_cra` → `cra_categories` (184 reparti a 2 livelli, navigazione del portale CRA, pronti per i marchi generici).

**RLS** (`products_select_vetrina`): il catalogo L2F è pubblico; i prodotti solo-CRA li vedono unicamente le officine abilitate al CRA Store. Il filtro non può stare solo nel client — con la chiave pubblica sarebbero leggibili via API.

**Prezzi**: `cra_netto_utente()` e `l2f_netto_utente()`, gemelle, entrambe `(product_id, variant_id, prezzo_netto)`.

Ritirate il 2026-07-25: `cra_products`, `cra_product_netto`, `listino_prezzi_cra`, `order_items.cra_product_id`, `cra_prezzo_utente()`. Prima erano 104 righe duplicate dei prodotti L2F; gli 8 accessori segnaposto (`ACC-*`, `ATT-*`, `LMP-*`) erano già stati cancellati.

## Grana: prodotto + varianti, su entrambe le vetrine

Un olio = **1 prodotto** (codice base `L2F1319`) + **N varianti-imballo** (`L2F13191`=12×1, `L2F131920`=20 L…). Prima il CRA Store mostrava ogni imballo come prodotto a sé (45 righe); ora mostra il prodotto con il **selettore formato**, come L2F. Un vecchio link `#/store/<codice-variante>` continua a funzionare: risolve al padre e preseleziona l'imballo.

## Riconciliazione codici CRA ↔ L2F (verificata 2026-07-11)

I 112 prodotti `cra_products` sono tutti spiegati — **nessun orfano per errore**:

| Gruppo | Q.tà | Chiave di match |
|---|---|---|
| Match su `products.codice_l2f` | 59 | batterie, lampade (prodotti L2F senza varianti) |
| Match su `product_variants.codice_l2f` | 45 | oli/lubrificanti (varianti L2F appiattite in prodotti CRA) |
| Esclusivi CRA | 8 | `ACC-*`/`ATT-*`/`LMP-*`: compressore, avvitatore, dinamometrica, fusibili, lampada alogena, kit H7 LED, spazzole, carrello |

Chiave del sync per CRA: il codice matcha **prima** `products.codice_l2f`, **poi** `product_variants.codice_l2f`. Gli 8 `ACC-/ATT-/LMP-` sono **esclusivi CRA** per scelta (non hanno sorgente nei listini L2F).

## Regola prezzo (verificata 2026-07-11)

- **L2F**: `prezzo_listino` (pubblico) + `prezzo_netto` (riservato officine attive). Vedi [[E-commerce B2B]].
- **CRA**: `cra_products.prezzo` = **netto NORD** L2F, **1:1, senza ricarico**.
- **Stato attuale dei netti** dove esistono Nord/Sud (lampade): **CRA usa Nord**, **L2F usa Sud** (il netto unico oggi in `product_netto` = valori Sud, più bassi). Es. KLD1S: Nord 68,97 (CRA) · Sud 57,14 (L2F DB). Lo scarto Nord/Sud lampade è ~+20,7% (NON un margine CRA: era un mio errore iniziale, confronto Nord-vs-Sud).
- **Come finiscono nel DB** (vedi [[Categorie cliente e Listini]]): `netto_nord` → **prezzo universale**; `netto_sud` → righe del **listino "Sud"**, che l'admin assegna alle categorie cliente che vuole.
- **Attenzione al rollout**: L2F oggi espone i netti Sud. Quando assegni le categorie, i clienti L2F esistenti vanno messi sulla categoria giusta (o lasciati senza categoria) per non far variare i loro prezzi.
- **Filtri**: attenzione, i codici in `products` (`F####LA`) differiscono da quelli del listino filtri (`FVO*/FCO*`) → riconciliazione filtri L2F ancora da fare (i filtri non sono nel catalogo CRA).

Collega [[Backend Supabase]] · [[Distinte netti]] · [[Catalogo L2F]] · [[Pannello Admin]].
