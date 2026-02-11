---
name: llm-seo-specialist
description: Specialista SEO/SERP/GEO per LLM. Ottimizza ogni contenuto testuale per essere trovato, citato e raccomandato da AI search engines (ChatGPT, Perplexity, Gemini, Claude). Questo è il checkpoint obbligato per TUTTO il contenuto testuale del progetto.
---

# LLM SEO Specialist Skill

> **REGOLA FONDAMENTALE:** Tutto il contenuto testuale destinato al web DEVE passare attraverso questa skill prima della pubblicazione. Non è opzionale.

## Contesto: L'Era della Ricerca AI

Il paradigma di ricerca è cambiato. Gli utenti non cliccano più link, ma ottengono risposte direttamente da:
- **Google AI Overviews**
- **ChatGPT / OpenAI Search**
- **Perplexity AI**
- **Claude**
- **Gemini**

L'obiettivo non è più solo "rankare", ma **essere citato come fonte autorevole nelle risposte AI**.

---

## Le 3 Discipline Integrate

### 1. **SEO (Search Engine Optimization)**
Ottimizzazione classica per crawler e indici tradizionali.

### 2. **GEO (Generative Engine Optimization)**
Ottimizzazione specifica per LLM. Garantisce che il contenuto sia:
- Facilmente estraibile come citazione
- Semanticamente ricco
- Strutturato per risposte dirette

### 3. **SERP/AEO (Answer Engine Optimization)**
Ottimizzazione per featured snippets e risposte zero-click.

---

## Workflow di Ottimizzazione Contenuti

Ogni volta che devo creare/modificare contenuto testuale:

### FASE 1: Analisi Pre-Scrittura
1. **Identifica l'intento dell'utente (Search Intent)**
   - Informazionale (vuole sapere)
   - Transazionale (vuole fare/comprare)
   - Navigazionale (vuole trovare)

2. **Definisci le domande chiave**
   - Quali domande pone l'utente finale?
   - Quali query conversazionali userebbe con un AI assistant?

### FASE 2: Struttura del Contenuto (Critica per LLM)

```
[H1] Titolo principale (contiene keyword primaria)

[Lead Paragraph] Risposta diretta alla domanda in 1-2 frasi quotabili.

[H2] Sezione 1
  [H3] Sotto-sezione

[TL;DR / Key Takeaways] Riassunto bullettato

[FAQ Schema] Domande e risposte esplicite
```

### FASE 3: Checklist GEO Obbligatoria

Ogni contenuto DEVE soddisfare questi criteri:

#### **Clarity & Quotability** ✅
- [ ] Le prime 2 frasi rispondono direttamente alla domanda principale
- [ ] Ogni paragrafo contiene una frase "quotabile" che può stare da sola
- [ ] Nessun gergo non spiegato
- [ ] Linguaggio naturale e conversazionale

#### **Structure & Parseability** ✅
- [ ] Heading gerarchici corretti (H1 → H2 → H3)
- [ ] Liste puntate per elenchi di 3+ elementi
- [ ] Tabelle per dati comparativi
- [ ] TL;DR presente per contenuti > 500 parole

#### **E-E-A-T Signals** ✅
- [ ] Esperienza: Esempi concreti, case study, dati proprietari
- [ ] Expertise: Credenziali dell'autore/brand chiare
- [ ] Autorevolezza: Citazioni di fonti esterne autorevoli
- [ ] Trustworthiness: Dati aggiornati, disclaimer dove necessari

#### **Schema Markup** ✅
- [ ] FAQPage per sezioni Q&A
- [ ] HowTo per procedure step-by-step
- [ ] Article con autore e data
- [ ] Organization per pagine aziendali
- [ ] LocalBusiness per pagine geo-localizzate

#### **Semantic Richness** ✅
- [ ] Entity coverage: Menziona entità correlate (brand, luoghi, concetti)
- [ ] Sinonimi e varianti linguistiche
- [ ] Contesto: Spiega il "perché" oltre al "cosa"

---

## Template: Sezione FAQ Ottimizzata per LLM

Ogni pagina importante dovrebbe includere:

```jsx
<section itemScope itemType="https://schema.org/FAQPage">
  <h2>Domande Frequenti su [Argomento]</h2>
  
  <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
    <h3 itemProp="name">Qual è la differenza tra X e Y?</h3>
    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
      <p itemProp="text">
        La differenza principale è [risposta diretta in 1-2 frasi]. 
        Nello specifico, X si caratterizza per [...], mentre Y offre [...].
      </p>
    </div>
  </div>
  
  <!-- Ripeti per ogni domanda -->
</section>
```

---

## Pattern: Apertura "AI-Friendly"

**❌ EVITARE (vago, non quotabile):**
> "Nel mondo di oggi, molte persone si chiedono come funziona X. In questo articolo esploreremo..."

**✅ PREFERIRE (diretto, citabile):**
> "X funziona attraverso [meccanismo specifico]. Il vantaggio principale è [beneficio concreto], che permette a [target] di [risultato]."

---

## Ottimizzazione per Contesti Specifici

### Landing Page / Homepage
- Hero text: Value proposition in massimo 15 parole
- Above the fold: Cosa fai + Per chi + Beneficio principale
- Social proof immediato (numeri, loghi clienti)

### Pagina Servizi/Prodotti
- Nome servizio come H1
- Prima riga = definizione chiara del servizio
- Lista benefici con ✓ o icone
- Prezzi visibili se possibile (trasparency = trust)
- CTA chiaro

### Pagina About
- Chi siamo in 2 frasi
- Storia/Mission
- Team con credenziali
- Dati aziendali (anno fondazione, sede, numeri)

### Blog/Articoli
- H1 ottimizzato per query
- Data di pubblicazione visibile
- Tempo di lettura stimato
- Autore con bio e foto
- Indice dei contenuti per articoli > 1000 parole

---

## Metriche da Monitorare (Post-Pubblicazione)

1. **AI Citations Tracking**
   - Il brand viene menzionato in risposte AI?
   - Tool: Perplexity Labs, manual queries

2. **Traffic da AI Sources**
   - Referral da chat.openai.com, perplexity.ai, etc.

3. **Featured Snippets Wins**
   - Quante query mostrano il nostro contenuto in posizione zero?

4. **Brand Share of Voice**
   - Quante volte siamo citati vs competitor nelle risposte AI?

---

## Integrazione con Altre Skill

Quando viene attivata la skill `create-ui-component`:
1. Se il componente include testo, passa il testo attraverso questa skill
2. Applica la checklist GEO
3. Suggerisci schema markup appropriato

---

## Quick Reference Card

| Elemento | Best Practice LLM |
|----------|-------------------|
| Titolo (H1) | Keyword primaria + Beneficio |
| Prima frase | Risposta diretta alla query |
| Paragrafi | Max 3-4 righe, una idea per paragrafo |
| Liste | Usare per 3+ items |
| FAQ | Sempre presente, con schema markup |
| CTA | Chiaro, specifico, orientato all'azione |
| Date | Sempre visibili per contenuti informativi |
| Autore | Nome reale con credenziali |

---

## Nota Finale

Questa skill non sostituisce la creatività, ma la **amplifica**. Un contenuto può essere poetico E ottimizzato per LLM. L'obiettivo è garantire che il messaggio arrivi a chi lo cerca, ovunque lo cerchi.
