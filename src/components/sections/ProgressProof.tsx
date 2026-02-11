import { useEffect, useRef } from 'react';
import { motion, useInView, animate, useMotionValue, useTransform } from 'framer-motion';
import styles from './ProgressProof.module.css';

const metrics = [
    { value: 4700, label: 'Mq di Magazzino', suffix: '' },
    { value: 3000, label: 'Clienti Serviti', suffix: '+' },
    { value: 450, label: 'Ordini Giornalieri', suffix: '' },
    { value: 65000, label: 'Articoli Codificati', suffix: '' },
];

export const ProgressProof = () => {
    return (
        <section className={styles.proofSection}>
            <div className="container">
                <div className={styles.grid}>
                    {metrics.map((metric, i) => (
                        <Counter
                            key={i}
                            value={metric.value}
                            label={metric.label}
                            suffix={metric.suffix}
                            delay={i * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const Counter = ({ value, label, suffix, delay }: { value: number, label: string, suffix: string, delay: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => {
        return Math.floor(latest).toLocaleString('it-IT') + suffix;
    });

    useEffect(() => {
        if (isInView) {
            const controls = animate(count, value, {
                duration: 2,
                delay: delay,
                ease: [0.16, 1, 0.3, 1], // easeOutExpo
            });
            return controls.stop;
        }
    }, [isInView, value, delay, count]);

    useEffect(() => {
        return rounded.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = latest;
            }
        });
    }, [rounded]);

    return (
        <motion.div
            className={styles.counterItem}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay }}
        >
            <motion.div
                className={styles.underline}
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: delay + 0.3 }}
            />
            <span ref={ref} className={styles.value}>0{suffix}</span>
            <span className={styles.label}>{label}</span>
        </motion.div>
    );
};
