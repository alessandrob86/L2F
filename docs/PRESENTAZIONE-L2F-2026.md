---
titolo: "L2F — Recap Nuova Piattaforma"
scopo: "Base per slide di presentazione del nuovo stadio del progetto L2F"
data: 2026-07-02
---

# L2F — Il Nuovo Stadio del Progetto

> Documento di lavoro con tutti i fatti tecnici verificati nel codice sorgente del sito (React + Vite + Supabase), pronto per essere trasformato in slide. Ogni funzionalità è marcata con lo stato reale: **✅ Attivo** (già live e funzionante) oppure **🔜 Roadmap** (non ancora implementato).

---

## 0. Executive Summary

Il nuovo sito L2F non è un semplice restyling: è una **piattaforma B2B completa** per le officine partner, che integra in un solo ecosistema:

- Catalogo prodotti tecnico con filtri avanzati e prezzi netti riservati
- E-commerce con carrello, invio ordini automatico e integrazione gestionale
- Sistema di pacchetti/abbonamento (HOME / FLEX) con cashback
- L2F Academy: corsi con prenotazione, crediti e gestione iscritti
- Area Clienti riservata + Pannello Admin per la gestione operativa
- Politica "Reso a Vista" digitalizzata
- Un'esperienza visiva "da grande brand" (scroll cinematografico stile Apple)

**Performance tecniche misurate**: 94/100 Prestazione, 95/100 Accessibilità, 100/100 Best Practices, 92/100 SEO, tempo di caricamento 0,8 secondi (Google Lighthouse).

---

## 1. Il Nuovo Sito — Stack e Fondamenta

**Slide: "Una base tecnica moderna, non solo un restyling grafico"**

- Frontend: **React 19 + Vite** (stesso framework usato da aziende come Meta, Netflix, Shopify)
- Backend: **Supabase** (Postgres + autenticazione + storage immagini + funzioni serverless), con **Row Level Security** attiva su tutte le tabelle — ogni officina vede solo i propri dati
- Hosting: **Vercel**, deploy automatico ad ogni aggiornamento
- Email transazionali: **Resend**, con template brandizzati coerenti (header rosso L2F, logo, tipografia)
- Codice sorgente versionato su **GitHub**, tracciabilità completa delle modifiche

---

## 2. Catalogo Prodotti — Architettura Tecnica

**Slide: "Un catalogo pensato per ricambisti, non per un e-commerce generico"**

Ogni prodotto ha: codice L2F, famiglia, applicazione veicolo, riferimento OE, prezzo di listino pubblico, **prezzo netto riservato** (visibile solo alle officine attive), immagini multiple, garanzia, scheda tecnica e scheda di sicurezza scaricabili.

### Varianti / formati prodotto ✅
Un singolo prodotto può avere più **varianti** (es. diversi formati di imballo per un lubrificante), ciascuna con codice, imballo e prezzo (listino e netto) indipendenti.

### Famiglie prodotto e attributi tecnici dedicati ✅

| Famiglia | Attributi tecnici gestiti |
|---|---|
| **Batterie** | Linea (Astra, Eclipse, Syncro, Titan, Top Performance), tecnologia (AGM/EFB), Ah, Ampere di spunto, polo, dimensioni |
| **Lampade LED** | Attacco, lumen, temperatura colore (Kelvin), potenza, voltaggio, chip, raffreddamento, CANBUS |
| **Filtri** | Tipologia (olio / aria / abitacolo / gasolio) |
| **Pastiglie freno** | Lato, riferimento Brembo |
| **Lubrificanti** | Gradazione (es. 5W/30), specifiche/omologazioni (es. ACEA C3, VW 504.00, MB 229.51) |
| **Chimica** | Tipologia prodotto |

### Ricerca e filtri avanzati ✅
- Ricerca full-text su codice, nome, riferimento OE, applicazione, dimensioni e amperaggio
- **Filtri a faccette** specifici per ogni famiglia (chip cliccabili, es. Linea/Ah per batterie, Attacco/CANBUS per LED, Gradazione per lubrificanti)
- Vista a griglia o a righe, "quick add" al carrello direttamente dalla card prodotto

### Sistema Kelvin per le lampade LED ✅ — un dettaglio distintivo
Modulo dedicato che converte i gradi Kelvin in colore reale visualizzato (algoritmo del corpo nero), con:
- **Scala visiva** nella scheda prodotto: barra con gradiente reale caldo→freddo e marker sul valore esatto della lampada, con etichetta descrittiva ("Luce calda", "Bianco freddo intenso", ecc.)
- **Slider a doppia maniglia** nel catalogo (range 3.300K–10.000K) per filtrare le lampade per temperatura colore desiderata, con le maniglie colorate dinamicamente

### Scheda prodotto batterie — abbinamento render + etichetta reale ✅
Per le batterie, la scheda mostra affiancati un **render 3D della linea** e la **foto reale dell'etichetta del prodotto** (vedi sezione 3).

---

## 3. Etichette Batterie

**Slide: "5 linee batterie, ogni referenza tracciata e documentata"**

### Le 5 linee a catalogo
| Linea | Referenze/etichette |
|---|---|
| Astra | 5 |
| Eclipse | 8 |
| Syncro | 6 |
| Titan | 2 |
| Top Performance | 11 |
| **Totale** | **32 referenze** |

### Stato attuale ✅ / 🔜
- **✅ Attivo**: le etichette definitive (85 immagini ottimizzate in formato WebP) sono già integrate nel sito e mostrate in scheda prodotto per ogni referenza batteria.
- **✅ Archivio sorgente**: i file esecutivi ad alta risoluzione (PDF di stampa "ESECUTIVO_GENERALE") di tutte le 32 referenze sono organizzati in locale, una cartella per linea — pronti per la stampa o per la produzione grafica.
- **🔜 Roadmap**: oggi il collegamento tra le etichette "master" (PDF) e il sito è manuale (esportazione → ottimizzazione → caricamento). Un possibile sviluppo futuro è un **redirect/download diretto** della scheda PDF ad alta risoluzione dalla pagina prodotto (oggi la scheda prodotto linka genericamente a "scheda tecnica" / "scheda di sicurezza", non ancora ai PDF etichetta specifici).

---

## 4. Servizi Officina — Pacchetti HOME e FLEX ✅

**Slide: "Un modello di abbonamento chiaro, con margine di crescita per l'officina"**

| Pacchetto | Prezzo | Cosa include |
|---|---|---|
| **HOME** | 590 € + IVA / anno | Kit benvenuto (insegna, abbigliamento, cancelleria a marchio), 1 corso di formazione annuale, Reso a Vista, **Cashback 3%** |
| **FLEX · Marketing** | + 130 € + IVA / anno | Tutto HOME + marketing personalizzato, gestione social (Facebook/Instagram), campagne sponsorizzate a nome dell'officina, **Cashback 5%** |
| **FLEX · Tech** | + 990 € + IVA / anno | Tutto HOME + accesso a **L2F Tech** (banca dati tecnica), **Cashback 5%** |
| **FLEX · All Included** | + 1.650 € + IVA / anno | Tutto HOME + L2F Tech + Marketing & Social completo, **Cashback 5%** |

*(I tre livelli FLEX sono in realtà due add-on attivabili anche singolarmente — Marketing e Tech — che insieme compongono l'"All Included".)*

### I 6 pilastri del servizio, come presentati sul sito
1. **Cashback** dal 3% al 5% sugli acquisti, in base al pacchetto
2. **L2F Tech** — banca dati tecnica per identificare il ricambio giusto
3. **Marketing & Social** — materiali personalizzati e gestione campagne
4. **Reso a Vista** — restituzione immediata in filiale del materiale difettoso
5. **L2F Academy** — un corso tecnico incluso ogni anno
6. **Kit Benvenuto** — insegna, abbigliamento, cancelleria a marchio

### Cashback — come funziona davvero ✅
Non è una percentuale fissa "di sistema": ogni officina ha una propria % di cashback e un proprio obiettivo annuo (€) impostati dall'admin. L'Area Clienti mostra una **barra di avanzamento animata** verso l'obiettivo, calcolata sul totale netto degli ordini effettivi, con un badge **"Elite"** quando l'obiettivo viene superato.

### Attivazione / cambio pacchetto
Oggi la richiesta di attivazione, upgrade o downgrade parte come **richiesta via email precompilata** verso L2F: non è (ancora) un flusso di acquisto/pagamento self-service online (vedi Roadmap).

---

## 5. L2F Academy — Corsi e Prenotazioni ✅ Sistema Attivo

**Slide: "Non un elenco corsi statico: un vero sistema di prenotazione"**

Contrariamente a un semplice calendario informativo, il sistema Corsi è **già interamente funzionante**:

- Ogni officina attiva vede i corsi disponibili con **countdown live** alla chiusura iscrizioni o all'inizio corso
- **Iscrizione con un click**: se l'officina ha crediti corso residui, l'iscrizione è gratuita ("Usa 1 credito"); altrimenti il corso è acquistabile al prezzo indicato
- Badge automatico **"Confermato"** quando il numero minimo di iscritti è raggiunto, altrimenti contatore "X/Y per confermare"
- **Email di conferma automatica** all'iscrizione (edge function dedicata)
- **Lato amministrativo**: gestione completa dei corsi (creazione, modifica, pubblicazione/nascondi, upload immagine), lista iscritti per corso con dettaglio pagamento, statistiche per officina (corsi frequentati, crediti usati, acquisti)

---

## 6. E-commerce B2B — Carrello e Gestione Ordini ✅

**Slide: "Dall'ordine dell'officina al gestionale, senza passaggi manuali"**

### Flusso cliente
1. L'officina accede, sblocca i **prezzi netti** riservati
2. Compone il carrello (persistente anche chiudendo il browser)
3. Conferma l'ordine

### Cosa succede automaticamente, in tempo reale — novità appena rilasciata ✅
- L'officina riceve una **email di conferma ordine** con riepilogo completo
- Il magazzino riceve una **notifica ordine via email**, con **allegato un file Excel già pronto per l'import nel gestionale** (colonne Marca / Articolo / Quantità / Prezzo netto, nome file con cliente e data), eliminando la trascrizione manuale dell'ordine
- Nessun pagamento online: il modello resta "ordina → L2F conferma ed evade" (vedi Roadmap per l'eventuale step successivo)

### Storico e tracciabilità ✅
- L'officina consulta lo **storico completo dei propri ordini** (stato, totali, dettaglio righe) dall'Area Clienti
- L'admin gestisce **tutti gli ordini di tutte le officine**, cambia stato (inviato → in lavorazione → evaso), ed esporta in **CSV** per il gestionale interno

---

## 7. Area Clienti e Pannello Admin ✅

**Slide: "Due esperienze dedicate: l'officina e chi gestisce L2F"**

### Area Clienti (officine)
- Stato account (in attesa / attiva) e pacchetto sottoscritto ben visibili
- Barra cashback con obiettivo e badge Elite
- Accesso diretto a **L2F Tech** (banca dati tecnica), se incluso nel pacchetto
- Pannello Academy personale (crediti, corsi frequentati)
- Storico ordini dettagliato

### Pannello Admin (L2F)
- **Ordini**: vista globale, cambio stato, export CSV per il gestionale
- **Officine**: attivazione account, assegnazione codice cliente, gestione pacchetto e add-on (Marketing / Tech), impostazione cashback % e obiettivo, crediti corsi — con **registro modifiche (audit log)** che traccia chi ha cambiato cosa e quando
- **Corsi**: gestione completa del calendario formativo e degli iscritti

---

## 8. Politica "Reso a Vista" — Digitalizzata ✅

**Slide: "Un vantaggio competitivo reale, ora spiegato chiaramente anche online"**

- Riservato alle officine partner L2F (pacchetto HOME o FLEX) in regola
- Restituzione **immediata in filiale** del materiale difettoso, **senza pratiche di autorizzazione preventiva**
- Copre i **vizi/difetti**, non gli errori di ordinazione
- Escluse dal reso immediato: frizioni e kit volano+frizione, iniettori e pompe di iniezione, ricambi originali (OEM) — per questi resta il reso standard con i tempi ordinari del fornitore
- Riferimento normativo B2B esplicito (artt. 1490-1495 Codice Civile)

---

## 9. Tecnologia — L'Esperienza "Hero" ✅

**Slide: "Uno scroll cinematografico, la stessa tecnica usata da Apple"**

La sezione più scenografica del sito (pagina Servizi) usa una tecnica avanzata di **scroll-driven animation**:

- **Sequenza di 120 immagini** che vengono disegnate su un elemento `<canvas>` in base alla posizione dello scroll dell'utente — man mano che si scrolla, il "video" avanza fotogramma per fotogramma, sincronizzato al pixel
- Tecnologia: **Framer Motion** (libreria di animazione leader nell'ecosistema React), con hook di scroll-tracking (`useScroll`) che calcola in tempo reale il progresso e sceglie il frame corretto da disegnare
- Sezione **"sticky"**: l'immagine resta fissa sullo schermo mentre il contenuto scorre sotto, con **3 blocchi di testo** che appaiono e scompaiono in sincronia con lo scroll
- **Dissolvenza finale**: una maschera CSS animata sfuma il canvas nel resto della pagina, senza tagli netti
- **Accessibilità**: chi ha impostato "riduci animazioni" sul proprio dispositivo vede automaticamente una versione statica, senza effetti — nessuno resta escluso

La Home usa inoltre uno **scrollytelling a due colonne** (testo che scorre a sinistra, mockup animati che cambiano a destra) per raccontare in 4 step il funzionamento del programma: Cashback → Reso a Vista → Crescita modulare (HOME→FLEX) → Booster Tech & Marketing.

---

## 10. Qualità e Performance — Numeri alla mano

**Slide: "Non solo bello: veloce e solido"**

Misurazione ufficiale Google Lighthouse (versione desktop):

| Metrica | Punteggio |
|---|---|
| Prestazione | **94 / 100** |
| Accessibilità | **95 / 100** |
| Best Practices | **100 / 100** |
| SEO | **92 / 100** |
| Tempo di caricamento (Speed Index) | **0,8 secondi** |

Il sito è stato inoltre **ottimizzato per il caricamento a pagine** (code-splitting): ogni sezione del sito si scarica solo quando serve, riducendo il peso iniziale del 67% (da 731 KB a 240 KB).

---

## 11. Roadmap — I Prossimi Passi 🔜

**Slide: "Cosa manca per completare il quadro"**

1. **Migrazione dominio**: `l2f.it` deve ancora essere puntato sulla nuova piattaforma (oggi il dominio pubblico serve ancora il vecchio sito; il nuovo sito è online e testato, pronto al collegamento).
2. **Pagamento online integrato**: oggi ordini e cambi pacchetto passano da richiesta/email; l'evoluzione naturale è un checkout con pagamento diretto (carta/bonifico).
3. **Visore 3D prodotti**: prevista come "Fase 2" per valorizzare ulteriormente le referenze private label (batterie in primis).
4. **Font brand MADE TOMMY**: da acquisire in licenza definitiva prima del go-live pubblico.
5. **Ponte diretto con l'ERP AS/400 di CRA**: oggi il collegamento è tramite export CSV manuale dal Pannello Admin; un'integrazione diretta eliminerebbe l'ultimo passaggio manuale.
6. **Ottimizzazione immagini**: margine di miglioramento residuo individuato da Lighthouse (~1,1 MB recuperabili con formati immagine più moderni), soprattutto per le performance su mobile.
7. **Etichette batterie**: collegamento diretto dalla scheda prodotto al PDF etichetta ad alta risoluzione (oggi disponibile solo come archivio locale).

---

*Documento generato a partire dal codice sorgente reale del progetto (`C:\Progetti lavoro\l2f`) il 2026-07-02, incrociato con la wiki interna di progetto (`docs/wiki/CRA-L2F`).*
