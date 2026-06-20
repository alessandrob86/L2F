import { Link } from 'react-router-dom';
import { Boxes, Zap, Handshake, ShieldCheck, ArrowUpRight } from 'lucide-react';
import styles from './ChiSiamo.module.css';
import { CONTACT } from '../lib/contact';

const STATS = [
    { value: '30+', label: 'Anni di esperienza' },
    { value: '65.000', label: 'Prodotti codificati' },
    { value: '4.500 m²', label: 'Di magazzino' },
    { value: '3.000', label: 'Clienti serviti' },
];

const VALORI = [
    { icon: Boxes, title: 'Assortimento', desc: 'Decine di migliaia di referenze dai grandi marchi dell’aftermarket, e una linea private label L2F selezionata.' },
    { icon: Zap, title: 'Velocità', desc: 'Centralino sempre pronto, preventivi chiari e spedizioni in giornata. Risposta in meno di 10 minuti.' },
    { icon: Handshake, title: 'Relazione', desc: 'Non clienti, ma partner. Conosciamo le officine una per una e cresciamo insieme a loro.' },
    { icon: ShieldCheck, title: 'Affidabilità', desc: 'Il ricambio giusto al primo colpo. Un magazzino vero e persone che conoscono il mestiere.' },
];

export const ChiSiamo = () => {
    return (
        <main className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <span className={styles.eyebrow}>Chi siamo</span>
                    <h1 className={styles.title}>Nati in officina,<br />cresciuti con chi ripara</h1>
                    <p className={styles.lead}>
                        <strong>L2F</strong> è il marchio private label e il programma per officine di{' '}
                        <strong>{CONTACT.company}</strong>, distributore italiano di ricambi per l’automotive
                        dal 1992.
                    </p>
                </header>

                <section className={styles.story}>
                    <p>
                        Abbiamo iniziato più di trent’anni fa con un’idea precisa: dare a chi ripara i veicoli
                        il ricambio giusto nel minor tempo possibile. Da quel primo punto vendita a Napoli siamo
                        diventati un punto di riferimento dell’aftermarket, servendo migliaia di professionisti
                        da cinque sedi tra Campania, Emilia-Romagna e Lombardia, con un magazzino di oltre
                        4.500 m² e centinaia di ordini evasi ogni giorno.
                    </p>
                    <p>
                        Da questa esperienza nasce <strong>L2F</strong>: una gamma <strong>private label</strong>{' '}
                        — batterie, filtri, lampade LED, lubrificanti, pastiglie freno e chimica — pensata per dare
                        all’officina qualità tecnica e margine reale, insieme a un programma di servizi (cashback,
                        marketing, banca dati, formazione e reso a vista) per crescere davvero. La crescita non ci
                        ha resi distanti: restiamo l’interlocutore che conosce il tuo nome.
                    </p>
                </section>

                <section className={styles.statsWrap}>
                    <span className={styles.statsKicker}>{CONTACT.company} in numeri</span>
                    <div className={styles.stats}>
                        {STATS.map((s) => (
                            <div key={s.label} className={styles.statCard}>
                                <span className={styles.statValue}>{s.value}</span>
                                <span className={styles.statLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.valoriWrap}>
                    <h2 className={styles.sectionTitle}>Come lavoriamo</h2>
                    <div className={styles.valori}>
                        {VALORI.map((v) => {
                            const Icon = v.icon;
                            return (
                                <div key={v.title} className={styles.valore}>
                                    <span className={styles.valoreIcon}><Icon size={22} aria-hidden="true" /></span>
                                    <h3 className={styles.valoreTitle}>{v.title}</h3>
                                    <p className={styles.valoreDesc}>{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className={styles.closing}>
                    <div className={styles.legal}>
                        <strong>{CONTACT.company}</strong>
                        <span>{CONTACT.address}</span>
                        <span>P.IVA {CONTACT.piva}</span>
                    </div>
                    <div className={styles.closingActions}>
                        <Link to="/catalogo" className={styles.closingPrimary}>
                            Vedi il catalogo <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                        <Link to="/servizi" className={styles.closingSecondary}>Il programma officine</Link>
                    </div>
                </section>
            </div>
        </main>
    );
};
