import styles from './BackgroundMotif.module.css';

/* Flow field L2F: curve a cascata che scendono verso destra
   (l'inclinazione richiama l'italico del logo). Le curve grigie
   sono i "binari"; le comete di luce li percorrono in loop. */

const VIEW_W = 1440;
const VIEW_H = 900;
const CURVES = 16;

const curvePath = (i: number): string => {
    const y = -120 + i * 64;
    const drift = (i % 3) * 18;
    return [
        `M -160 ${y}`,
        `C 320 ${y + 40 + drift}, 560 ${y + 170 - drift}, 880 ${y + 200}`,
        `S 1320 ${y + 300 + drift}, ${VIEW_W + 200} ${y + 420}`,
    ].join(' ');
};

/* Comete: indice della curva, durata (s), ritardo (s), rossa o grigia */
const COMETS = [
    { curve: 2, duration: 11, delay: 0, accent: true },
    { curve: 4, duration: 16, delay: 4, accent: false },
    { curve: 6, duration: 9, delay: 2, accent: true },
    { curve: 8, duration: 18, delay: 7, accent: false },
    { curve: 10, duration: 12, delay: 5, accent: false },
    { curve: 12, duration: 10, delay: 1.5, accent: true },
    { curve: 14, duration: 15, delay: 8.5, accent: false },
];

export const BackgroundMotif = () => {
    return (
        <div className={styles.backgroundContainer} aria-hidden="true">
            <div className={styles.gridOverlay} />

            <svg
                className={styles.flowField}
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="xMidYMid slice"
                fill="none"
            >
                <defs>
                    <linearGradient id="cometRed" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E0312F" stopOpacity="0" />
                        <stop offset="70%" stopColor="#E0312F" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#FF8784" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="cometGray" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ACACAC" stopOpacity="0" />
                        <stop offset="100%" stopColor="#ACACAC" stopOpacity="0.55" />
                    </linearGradient>
                </defs>

                {/* Binari */}
                {Array.from({ length: CURVES }, (_, i) => (
                    <path
                        key={`rail-${i}`}
                        d={curvePath(i)}
                        stroke="#ACACAC"
                        strokeOpacity={0.05 + (i % 4) * 0.015}
                        strokeWidth={0.7 + (i % 3) * 0.25}
                    />
                ))}

                {/* Comete di luce */}
                {COMETS.map((c, i) => (
                    <path
                        key={`comet-${i}`}
                        className={`${styles.comet} ${c.accent ? styles.cometAccent : ''}`}
                        d={curvePath(c.curve)}
                        pathLength={1000}
                        stroke={c.accent ? 'url(#cometRed)' : 'url(#cometGray)'}
                        strokeWidth={c.accent ? 2.2 : 1.4}
                        strokeLinecap="round"
                        style={{
                            animationDuration: `${c.duration}s`,
                            animationDelay: `${c.delay}s`,
                        }}
                    />
                ))}
            </svg>

            {/* Bagliore rosso di profondità, in basso */}
            <div className={styles.glowBottom} />

            <div className={styles.noiseOverlay} />
            <div className={styles.vignette} />
        </div>
    );
};
