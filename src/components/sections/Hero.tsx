import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';
import { MagneticButton } from '../ui/MagneticButton';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const Hero = () => {
    return (
        <section className={styles.heroSection}>
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
                        <span className={styles.statusText}>Oltre 3.000 officine e ricambisti serviti in Italia</span>
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
                        Ricambi private label, servizi e cashback in un unico sistema.
                        Il vantaggio si misura in numeri, non in promesse.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className={styles.ctaGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.4 }}
                    >
                        <MagneticButton
                            className={styles.primaryCta}
                            onClick={() => document.getElementById('piani')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Scopri i piani <ArrowRight size={18} aria-hidden="true" />
                        </MagneticButton>
                        <MagneticButton
                            className={styles.secondaryCta}
                            onClick={() => document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Come funziona
                        </MagneticButton>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
