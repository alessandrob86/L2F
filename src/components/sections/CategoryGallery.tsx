import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import styles from './CategoryGallery.module.css';
import { getCategories, type Category } from '../../lib/catalog';

const MotionLink = motion.create(Link);

const RENDERS: Record<string, string> = {
    batterie: '/renders/batt-top-performance.webp',
    filtri: '/renders/filtro.webp',
    'lampade-led': '/renders/led.webp',
    lubrificanti: '/renders/lubrificanti.webp',
    'pastiglie-freno': '/renders/pastiglie.webp',
    chimica: '/renders/chimica.webp',
};
/** Info-chiave per la "striscia spec" della card. */
const SPECS: Record<string, string> = {
    batterie: 'AGM · EFB · Standard',
    filtri: 'Olio · Aria · Abitacolo · Gasolio',
    'lampade-led': '7 linee · 6000–6500K · CANBUS',
    lubrificanti: 'Motore e trasmissione · multi-formato',
    'pastiglie-freno': 'Riferimenti Brembo · ant. e post.',
    chimica: 'Antigelo · DOT4 · additivi · lavamani',
};

const SpecCard = ({ c, i }: { c: Category; i: number }) => {
    const reduce = useReducedMotion();
    const render = RENDERS[c.id];
    return (
        <MotionLink
            to={`/catalogo?famiglia=${c.id}`}
            className={styles.specCard}
            aria-label={`${c.nome} — ${c.count} prodotti`}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? false : { opacity: 1, y: 0 }}
            whileTap={reduce ? undefined : { scale: 0.99 }}
            transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
            {render && <img className={styles.specRender} src={render} alt="" loading="lazy" decoding="async" />}

            <div className={styles.specTop}>
                <span className={styles.specCount}><b>{c.count}</b> prodotti</span>
                <span className={styles.specArrow} aria-hidden="true"><ArrowUpRight size={16} /></span>
            </div>

            <div className={styles.specBottom}>
                <h2 className={styles.specName}>{c.nome}</h2>
                <span className={styles.specStrip}>{SPECS[c.id] ?? `${c.count} referenze`}</span>
            </div>
        </MotionLink>
    );
};

/** Griglia macrocategorie "Vetrina Tecnica" — condivisa tra /catalogo e la home.
 *  Passa `categories` se le hai già (catalogo); altrimenti le carica da sola (home). */
export const CategoryGallery = ({ categories: provided }: { categories?: Category[] }) => {
    const [fetched, setFetched] = useState<Category[]>([]);
    useEffect(() => {
        if (provided) return;
        let active = true;
        getCategories()
            .then((c) => active && setFetched(c))
            .catch(() => active && setFetched([]));
        return () => {
            active = false;
        };
    }, [provided]);

    const categories = provided ?? fetched;

    return (
        <div className={styles.specGrid}>
            {categories.map((c, i) => (
                <SpecCard key={c.id} c={c} i={i} />
            ))}
        </div>
    );
};
