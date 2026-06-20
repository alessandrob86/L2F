import { useRef } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useReducedMotion,
    type MotionValue,
} from 'framer-motion';
import styles from './LineShowcase.module.css';
import { KelvinScale } from '../KelvinScale';
import type { ProductLine } from '../../lib/catalog';

const SPRING = { stiffness: 140, damping: 18, mass: 0.4 };

/** Strato decorativo con parallax: trasla in base alla posizione del cursore. */
function ParallaxLayer({
    className,
    px,
    py,
    depth,
}: {
    className: string;
    px: MotionValue<number>;
    py: MotionValue<number>;
    depth: number;
}) {
    const x = useTransform(px, (v) => v * depth);
    const y = useTransform(py, (v) => v * depth);
    return <motion.div aria-hidden className={className} style={{ x, y }} />;
}

export function LineShowcase({
    line,
    familyLabel,
}: {
    line: ProductLine;
    familyLabel: string;
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);

    // -1..1 sui due assi, ammorbiditi
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const px = useSpring(mx, SPRING);
    const py = useSpring(my, SPRING);

    // tilt 3D del pannello
    const rotateY = useTransform(px, [-1, 1], [6, -6]);
    const rotateX = useTransform(py, [-1, 1], [-5, 5]);

    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const hl = line.highlights ?? [];
    const hero = hl[0];
    const rest = hl.slice(1);

    // Kelvin (se presente tra gli highlights, unità "K") → scala colore
    const kHl = hl.find((h) => h.u === 'K');
    const kelvin = kHl ? Number(String(kHl.v).replace(/\./g, '')) : null;

    return (
        <motion.div
            key={`${line.family_id}|${line.linea}`}
            ref={ref}
            className={styles.wrap}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                className={styles.panel}
                style={reduce ? undefined : { rotateX, rotateY }}
            >
                {/* FX di sfondo (parallax) */}
                <div className={styles.fx} aria-hidden>
                    <ParallaxLayer className={styles.grid} px={px} py={py} depth={6} />
                    <ParallaxLayer className={styles.glow} px={px} py={py} depth={26} />
                    <div className={`${styles.beam} ${styles.beam1}`} />
                    <div className={`${styles.beam} ${styles.beam2}`} />
                    <ParallaxLayer className={styles.spark} px={px} py={py} depth={-14} />
                </div>

                {/* Contenuto */}
                <div className={styles.content}>
                    <div className={styles.left}>
                        <span className={styles.eyebrow}>
                            {familyLabel}
                            {line.tagline ? <> · {line.tagline}</> : null}
                        </span>
                        <h3 className={styles.title}>{line.linea}</h3>
                        <p className={styles.desc}>{line.descrizione}</p>
                    </div>

                    {hl.length > 0 && (
                        <div className={styles.stats}>
                            {hero && (
                                <motion.div
                                    className={`${styles.stat} ${styles.heroStat}`}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.12 }}
                                >
                                    <span className={styles.statValue}>
                                        {hero.v}
                                        {hero.u && <span className={styles.statUnit}>{hero.u}</span>}
                                    </span>
                                    <span className={styles.statLabel}>{hero.l}</span>
                                </motion.div>
                            )}
                            <div className={styles.statGrid}>
                                {rest.map((h, i) => (
                                    <motion.div
                                        key={h.l}
                                        className={styles.stat}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                                    >
                                        <span className={styles.statValueSm}>
                                            {h.v}
                                            {h.u && <span className={styles.statUnit}>{h.u}</span>}
                                        </span>
                                        <span className={styles.statLabel}>{h.l}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {kelvin != null && (
                        <div className={styles.kelvinStrip}>
                            <KelvinScale kelvin={kelvin} label={kHl?.l} compact />
                        </div>
                    )}

                    {line.diagram && (
                        <div className={styles.diagramBox}>
                            <img className={styles.diagramImg} src={line.diagram} alt={`Schema tecnico ${line.linea}`} />
                            {line.diagram_nota && <p className={styles.diagramNota}>{line.diagram_nota}</p>}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
