---
name: create-ui-component
description: Crea nuovi componenti React/TypeScript seguendo lo stile del progetto.
---

# Create UI Component Skill

## Stack
- React 19 + TypeScript
- CSS Modules (per lo styling)
- Lucide React (per icone)

## Struttura File
Ogni componente deve avere la sua cartella:
/components/NomeComponente/
  ├── index.tsx      # Logica e Markup
  └── styles.module.css # Stile isolato

## Checklist Creazione
1. **Tipi:** Definisci sempre `interface Props` esplicita.
2. **Animazione:** Integra `framer-motion` di default (usa la skill `research-animation` per definire lo stile).
3. **Responsive:** Mobile-first.
4. **Dati:** Se il componente deve mostrare dati, prepara le props per ricevere dati reali.

## Esempio Scheletro
```tsx
import { motion } from 'framer-motion';
import styles from './styles.module.css';

interface Props {
  title: string;
}

export const ComponentName = ({ title }: Props) => {
  return (
    <motion.div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
    </motion.div>
  );
};