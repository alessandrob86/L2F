import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import styles from './BackToTop.module.css';

/* Freccetta flottante in basso a sinistra: compare scrollando e riporta in cima. */
export const BackToTop = () => {
    const reduce = useReducedMotion();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toTop = () =>
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    className={styles.btn}
                    onClick={toTop}
                    aria-label="Torna su"
                    title="Torna su"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24, scale: 0.8 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24, scale: 0.8 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={reduce ? undefined : { y: -3 }}
                    whileTap={{ scale: 0.92 }}
                >
                    <ArrowUp size={22} aria-hidden="true" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};
