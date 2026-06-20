import styles from './KelvinRangeSlider.module.css';
import { kelvinToRgb } from '../lib/kelvin';

/** Gradiente continuo che campiona il colore reale lungo tutto il range. */
function kelvinGradient(min: number, max: number): string {
    const n = 14;
    const stops: string[] = [];
    for (let i = 0; i <= n; i++) {
        const k = min + ((max - min) * i) / n;
        stops.push(`${kelvinToRgb(k)} ${((i / n) * 100).toFixed(1)}%`);
    }
    return `linear-gradient(90deg, ${stops.join(', ')})`;
}

/**
 * Slider a due maniglie per la temperatura colore (Kelvin).
 * Range continuo; le maniglie assumono il colore reale del loro valore.
 */
export function KelvinRangeSlider({
    min,
    max,
    low,
    high,
    onChange,
}: {
    min: number;
    max: number;
    low: number;
    high: number;
    onChange: (low: number, high: number) => void;
}) {
    const pct = (v: number) => ((v - min) / (max - min)) * 100;
    const grad = kelvinGradient(min, max);

    return (
        <div className={styles.wrap}>
            <div className={styles.track} style={{ background: grad }} />
            {/* zone non selezionate attenuate */}
            <div className={styles.dim} style={{ left: 0, width: `${pct(low)}%` }} />
            <div className={styles.dim} style={{ left: `${pct(high)}%`, right: 0 }} />

            <input
                type="range"
                className={styles.input}
                min={min}
                max={max}
                step={1}
                value={low}
                style={{ ['--thumb' as string]: kelvinToRgb(low), zIndex: low > (min + max) / 2 ? 5 : 3 }}
                onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
                aria-label="Temperatura colore minima"
            />
            <input
                type="range"
                className={styles.input}
                min={min}
                max={max}
                step={1}
                value={high}
                style={{ ['--thumb' as string]: kelvinToRgb(high), zIndex: 4 }}
                onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
                aria-label="Temperatura colore massima"
            />
        </div>
    );
}
