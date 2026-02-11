import { motion } from 'framer-motion';
import { RefreshCw, Shield, TrendingUp } from 'lucide-react';
import styles from './ValueBlocks.module.css';

const values = [
    {
        icon: <RefreshCw size={24} />,
        title: 'Il servizio che si ripaga da solo',
        text: 'Grazie al cashback sugli acquisti L2F Parts, il costo dei servizi viene recuperato nel tempo. Niente promesse, solo numeri reali.',
    },
    {
        icon: <Shield size={24} />,
        title: 'Meno rischi, più controllo',
        text: 'Resi a vista, ricambi selezionati e supporto tecnico riducono errori, tempi morti e immobilizzi di magazzino.',
    },
    {
        icon: <TrendingUp size={24} />,
        title: 'Più clienti, più margine',
        text: "Marketing locale, formazione mirata e strumenti pratici per far crescere l'officina senza burocrazia.",
    },
];

export const ValueBlocks = () => {
    return (
        <section className={styles.valueSection}>
            <div className="container">

                <div className={styles.intro}>
                    <span className={styles.label}>Perché L2F funziona</span>
                    <h2 className={styles.heading}>Un sistema che genera valore reale.</h2>
                    <p className={styles.description}>
                        Non un semplice fornitore. Un partner operativo che riduce i costi e aumenta i margini della tua officina.
                    </p>
                </div>

                <div className={styles.grid}>
                    {/* Vertical Dividers */}
                    <motion.div
                        className={`${styles.divider} ${styles.divider1}`}
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className={`${styles.divider} ${styles.divider2}`}
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
                    />

                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            className={styles.card}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                        >
                            <div className={styles.iconWrapper}>{v.icon}</div>
                            <h3 className={styles.cardTitle}>{v.title}</h3>
                            <p className={styles.cardText}>{v.text}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};
