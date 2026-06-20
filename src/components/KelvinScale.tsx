import styles from './KelvinScale.module.css';
import { kelvinToRgb, kelvinLightType, kelvinScalePct, KELVIN_GRADIENT } from '../lib/kelvin';

/**
 * Scala visiva della temperatura colore (Kelvin) con marcatore al valore reale.
 * `compact` per la vetrina di linea; versione estesa per la scheda prodotto.
 */
export function KelvinScale({
    kelvin,
    label,
    compact = false,
}: {
    kelvin: number;
    label?: string;
    compact?: boolean;
}) {
    const color = kelvinToRgb(kelvin);
    const type = kelvinLightType(kelvin);
    const pct = kelvinScalePct(kelvin);
    const caption = label || type.label;

    if (compact) {
        return (
            <div className={styles.compact}>
                <div className={styles.compactHead}>
                    <span className={styles.kicker}>Tipo di luce</span>
                    <span className={styles.compactVal}>
                        <span className={styles.swatchSm} style={{ background: color }} />
                        {kelvin.toLocaleString('it-IT')}K · {caption}
                    </span>
                </div>
                <div className={styles.bar} style={{ background: KELVIN_GRADIENT }}>
                    <div className={styles.marker} style={{ left: `${pct}%` }}>
                        <span className={styles.dot} style={{ background: color }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.full}>
            <div className={styles.head}>
                <span className={styles.swatch} style={{ background: color, boxShadow: `0 0 24px ${color}` }} />
                <div>
                    <span className={styles.value}>{kelvin.toLocaleString('it-IT')}K</span>
                    <span className={styles.type}>{caption}</span>
                    <p className={styles.ref}>{type.ref}.</p>
                </div>
            </div>
            <div className={styles.bar} style={{ background: KELVIN_GRADIENT }}>
                <div className={styles.marker} style={{ left: `${pct}%` }}>
                    <span className={styles.dot} style={{ background: color }} />
                </div>
            </div>
            <div className={styles.ticks}>
                <span>Caldo · 2000K</span>
                <span>Neutro · 4500K</span>
                <span>Freddo · 6500K+</span>
            </div>
        </div>
    );
}
