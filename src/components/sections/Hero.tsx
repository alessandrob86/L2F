import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';
import { MagneticButton } from '../ui/MagneticButton';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const Hero = () => {
    return (
        <section className={styles.heroSection}>

            {/* Scanline Sweep */}
            <motion.div
                className={styles.scanline}
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: '100%', opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
            />

            <div className="container">
                <div className={styles.heroContent}>
                    {/* Status Bar */}
                    <motion.div
                        className={styles.statusBar}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: easeOutExpo }}
                    >
                        <div className={styles.statusDot} />
                        <span className={styles.statusText}>Sistemi operativi: Disponibilità immediata</span>
                    </motion.div>

                    {/* Headline */}
                    <div className={styles.headlineContainer}>
                        <motion.h1
                            className={styles.headline}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.1 }}
                        >
                            Un ecosistema pensato per <br />
                            <span className={styles.highlight}>l’officina moderna</span>
                        </motion.h1>
                    </div>

                    {/* Subcopy */}
                    <motion.p
                        className={styles.subcopy}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.3 }}
                    >
                        Servizi, ricambi e cashback integrati in un unico sistema che si ripaga da solo.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className={styles.ctaGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.4 }}
                    >
                        <MagneticButton className={styles.primaryCta}>
                            Scopri L2F <ArrowRight size={18} />
                        </MagneticButton>
                        <MagneticButton className={styles.secondaryCta}>
                            Come funziona
                        </MagneticButton>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
