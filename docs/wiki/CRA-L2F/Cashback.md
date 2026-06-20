---
tags:
  - mondo/l2f
  - progetto
---

# Cashback

Vantaggio concreto legato agli **acquisti** L2F Parts (non una promo a tempo).

- **3%** con [[Pacchetti HOME e FLEX|HOME]]
- **5%** con [[Pacchetti HOME e FLEX|FLEX]]
- La percentuale (`cashback_rate`) è impostata per officina dall'admin nel [[Pannello Admin]].

## Barra cashback in [[Area Clienti]]
- Barra animata che si riempie verso un **obiettivo concordato** col cliente (`obiettivo_cashback`, default 1000 EUR, impostato dall'admin).
- Calcolo: somma dei netti ordinati x cashback_rate.
- Superato l'obiettivo: modalità **"Elite"** (effetto animato rosso/oro).

Esempio: 5% su 10.000 EUR di acquisti = 500 EUR maturati.
Parte di [[E-commerce B2B]] - [[Backend Supabase]].
