---
name: research-animation
description: Skill per esplorare, prototipare e perfezionare animazioni UI di alto livello (Framer Motion). Include la capacità di adattare componenti da librerie esterne (21st.dev, Magic UI, Aceternity).
---

# Research Animation Skill

Non applicare animazioni standard. Il tuo compito è **esplorare** la soluzione più elegante.

## Workflow Creativo
Quando l'utente chiede di animare una sezione (es. Hero, Card, Menu):

1. **Analisi del Contesto:** Chiediti quale emozione deve suscitare (es. "Potenza", "Fluidità", "Mistero").
2. **Ricerca Ispirazione (External Sources):**
   - Cerca pattern o componenti su **21st.dev** (Componenti community), **Magic UI** (Effetti moderni), o **Aceternity UI** (Effetti dark/glowing).
   - Se l'utente fornisce un link a questi siti, analizza il codice sorgente del componente.
3. **Proposta Multipla:** Non fornire una sola soluzione. Proponi 2 varianti:
   - *Variante A:* Conservativa/Minimal (Clean).
   - *Variante B:* Sperimentale (Pattern complessi ispirati alle risorse esterne).

## Regola di Porting (CRITICA)
La maggior parte delle risorse esterne (es. Magic UI, Aceternity) usa **Tailwind CSS**. Il nostro progetto usa **CSS Modules**.
**Quando adatti un componente esterno:**
1. **Mantieni:** La logica React e le proprietà di `framer-motion` (`initial`, `animate`, `variants`, `useScroll`).
2. **Traduci:** Rimuovi le classi Tailwind (es. `className="flex p-4 bg-black/50 backdrop-blur"`) e convertile in classi CSS nel file `.module.css`.
3. **Pulisci:** Rimuovi dipendenze non necessarie (es. `clsx`, `tailwind-merge`) se non servono per la logica, ma mantieni la logica condizionale se serve.

## Tecniche da Esplorare
- **Layout Animations:** Per le Bento Grid che si riorganizzano.
- **Scroll-linked animations:** Parallax sottili sugli sfondi scuri (Stile Aceternity).
- **Text Reveal:** Effetti di comparsa caratteri o "Masking" (Stile Magic UI).
- **Magnetic & Glow Effects:** Bottoni che seguono il mouse o bordi luminosi.

## Obiettivo Finale
Trovare l'animazione definitiva che unisca l'effetto "Wow" delle librerie open source con la pulizia del nostro codice custom.