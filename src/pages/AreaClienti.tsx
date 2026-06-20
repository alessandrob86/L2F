import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
    Package, Clock, CheckCircle2, LogOut, ChevronDown, ShoppingCart, AlertCircle, Percent,
    Sparkles, TrendingUp, ArrowRight, Database,
} from 'lucide-react';
import styles from './AreaClienti.module.css';
import logoacademy from '../assets/logoacademy.png';
import { useAuth } from '../lib/auth';
import { getMyOrders, statoLabel, type OrderSummary } from '../lib/orders';
import { getMyIscrizioni, type MyIscrizione } from '../lib/academy';
import { formatEuro, PLACEHOLDER_IMG } from '../lib/catalog';

/* ---------- Pannello L2F Academy: crediti + sintesi, rimanda al catalogo /corsi ---------- */
const AcademyPanel = ({ crediti }: { crediti: number }) => {
    const [mine, setMine] = useState<MyIscrizione[]>([]);
    useEffect(() => { getMyIscrizioni().then(setMine).catch(() => setMine([])); }, []);
    const usati = mine.filter((m) => m.con_credito).length;
    const rimasti = Math.max(0, crediti - usati);
    const frequentati = mine.length;
    return (
        <section className={styles.academy}>
            <div className={styles.academyHead}>
                <img src={logoacademy} alt="L2F Academy" className={styles.academyLogo} />
                <div>
                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}>L2F Academy</h2>
                    <p className={styles.academySub}>Formazione tecnica: usa i tuoi crediti corso o acquista i corsi extra.</p>
                </div>
            </div>
            <div className={styles.acadStats}>
                <div className={styles.acadStat}>
                    <span className={styles.acadStatN}>{rimasti}</span>
                    <span className={styles.acadStatLbl}>credit{rimasti === 1 ? 'o' : 'i'} rimast{rimasti === 1 ? 'o' : 'i'}</span>
                </div>
                <div className={styles.acadStat}>
                    <span className={styles.acadStatN}>{frequentati}</span>
                    <span className={styles.acadStatLbl}>cors{frequentati === 1 ? 'o' : 'i'} a cui sei iscritto</span>
                </div>
                <Link to="/corsi" className={styles.acadCta}>Sfoglia i corsi <ArrowRight size={18} /></Link>
            </div>
        </section>
    );
};

/* ---------- Cashback: barra animata che si riempie, con modalità "Elite" oltre il traguardo (per-officina) ---------- */
const CashbackBar = ({ cashback, rate, base, goal }: { cashback: number; rate: number; base: number; goal: number }) => {
    const reduce = useReducedMotion();
    const target = goal > 0 ? goal : 1000;
    const pct = Math.min(cashback / target, 1);
    const elite = cashback >= target;
    const manca = Math.max(target - cashback, 0);
    return (
        <section className={`${styles.cashback} ${elite ? styles.cashbackElite : ''}`}>
            <div className={styles.cbHead}>
                <div>
                    <span className={styles.cbLabel}><TrendingUp size={13} /> Cashback accumulato</span>
                    <div className={styles.cbValue}>{formatEuro(cashback)}</div>
                    <span className={styles.cbBase}>su ordini per {formatEuro(base)} · rientro {rate}%</span>
                </div>
                {elite && <span className={styles.cbBadge}><Sparkles size={15} /> Traguardo Elite</span>}
            </div>
            <div className={styles.cbTrack}>
                <motion.div
                    className={styles.cbFill}
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
            <div className={styles.cbScale}>
                <span>€ 0</span>
                <span className={elite ? styles.cbGoalDone : ''}>
                    {elite ? `★ Traguardo ${formatEuro(target)} raggiunto` : `Ti mancano ${formatEuro(manca)} al traguardo ${formatEuro(target)}`}
                </span>
            </div>
        </section>
    );
};

/* ---------- Bottone Banca Dati (solo officine con add-on L2F Tech attivo) ---------- */
const BancaDatiButton = () => (
    <a href="http://tech.l2f.it/" target="_blank" rel="noopener noreferrer" className={styles.bancaDati}>
        <span className={styles.bdIcon}><Database size={26} /></span>
        <span className={styles.bdText}>
            <span className={styles.bdTitle}>Banca Dati Tecnica L2F</span>
            <span className={styles.bdSub}>Schede tecniche, tempari e procedure di riparazione · accesso riservato</span>
        </span>
        <span className={styles.bdArrow} aria-hidden="true"><ArrowRight size={18} /></span>
    </a>
);

export const AreaClienti = () => {
    const { session, officina, loading, isActive, signOut } = useAuth();
    const [orders, setOrders] = useState<OrderSummary[] | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [err, setErr] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        if (!session) return;
        setLoadingOrders(true);
        setErr(false);
        getMyOrders()
            .then(setOrders)
            .catch(() => setErr(true))
            .finally(() => setLoadingOrders(false));
    }, [session]);

    if (loading) {
        return <main className={styles.page}><div className="container"><div className={styles.spinner} /></div></main>;
    }

    if (!session || !officina) {
        return (
            <main className={styles.page}>
                <div className="container">
                    <div className={styles.gate}>
                        <Package size={44} />
                        <h1>Area Clienti</h1>
                        <p>Accedi con l’account della tua officina per vedere i tuoi ordini.</p>
                        <Link to="/accedi" className={styles.primaryBtn}>Accedi</Link>
                    </div>
                </div>
            </main>
        );
    }

    const baseNetto = (orders ?? []).filter((o) => o.stato !== 'annullato').reduce((s, o) => s + Number(o.totale_netto), 0);
    const cashback = baseNetto * (officina.cashback_rate ?? 0) / 100;

    return (
        <main className={styles.page}>
            <div className="container">
                <motion.header
                    className={styles.head}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                >
                    <div>
                        <span className={styles.eyebrow}>Area Clienti</span>
                        <h1 className={styles.name}>{officina.ragione_sociale}</h1>
                        <div className={styles.metaRow}>
                            <span className={`${styles.stato} ${isActive ? styles.statoOk : styles.statoWait}`}>
                                {isActive ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                {isActive ? 'Attiva' : 'In attesa di attivazione'}
                            </span>
                            {officina.pacchetto && <span className={styles.metaChip}>Pacchetto {officina.pacchetto}</span>}
                            {officina.cashback_rate > 0 && <span className={styles.metaChip}><Percent size={12} /> Cashback {officina.cashback_rate}%</span>}
                        </div>
                    </div>
                    <button className={styles.logout} onClick={signOut}><LogOut size={16} /> Esci</button>
                </motion.header>

                {!isActive ? (
                    <div className={styles.notice}>
                        <Clock size={20} />
                        <p>Il tuo account è in fase di verifica. Appena attivo vedrai i <strong>prezzi netti</strong> e potrai inviare ordini.</p>
                    </div>
                ) : (
                  <>
                    <CashbackBar cashback={cashback} rate={officina.cashback_rate ?? 0} base={baseNetto} goal={officina.obiettivo_cashback ?? 1000} />
                    {officina.banca_dati_attiva && <BancaDatiButton />}
                    <AcademyPanel crediti={officina.crediti_corsi ?? 0} />
                    <section className={styles.ordersSection}>
                        <h2 className={styles.sectionTitle}>I miei ordini</h2>

                        {loadingOrders ? (
                            <div className={styles.spinner} />
                        ) : err ? (
                            <div className={styles.state}><AlertCircle size={28} /><p>Non riusciamo a caricare gli ordini.</p></div>
                        ) : !orders || orders.length === 0 ? (
                            <div className={styles.state}>
                                <ShoppingCart size={32} />
                                <p>Non hai ancora inviato ordini.</p>
                                <Link to="/catalogo" className={styles.primaryBtn}>Vai al catalogo</Link>
                            </div>
                        ) : (
                            <div className={styles.orderList}>
                                {orders.map((o) => {
                                    const isOpen = openId === o.id;
                                    const nItems = o.order_items.reduce((s, it) => s + it.quantita, 0);
                                    return (
                                        <div key={o.id} className={styles.order}>
                                            <button className={styles.orderHead} onClick={() => setOpenId(isOpen ? null : o.id)} aria-expanded={isOpen}>
                                                <div className={styles.orderId}>
                                                    <span className={styles.orderNum}>{o.numero}</span>
                                                    <span className={styles.orderDate}>
                                                        {new Date(o.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        {' · '}{nItems} {nItems === 1 ? 'articolo' : 'articoli'}
                                                    </span>
                                                </div>
                                                <span className={`${styles.orderStato} ${styles['st_' + o.stato] ?? ''}`}>{statoLabel(o.stato)}</span>
                                                <div className={styles.orderTotWrap}>
                                                    <span className={styles.orderTotLabel}>Totale netto</span>
                                                    <span className={styles.orderTot}>{formatEuro(o.totale_netto)}</span>
                                                </div>
                                                <ChevronDown size={18} className={`${styles.chev} ${isOpen ? styles.chevOpen : ''}`} />
                                            </button>
                                            {isOpen && (
                                                <div className={styles.orderBody}>
                                                    <div className={styles.itemsHead}>
                                                        <span>{nItems} {nItems === 1 ? 'articolo' : 'articoli'}</span>
                                                    </div>
                                                    {o.order_items.map((it) => (
                                                        <div key={it.id} className={styles.item}>
                                                            <img className={styles.itemThumb} src={it.immagine || PLACEHOLDER_IMG} alt="" loading="lazy" />
                                                            <div className={styles.itemInfo}>
                                                                <span className={styles.itemName}>{it.nome}{it.imballo ? ` · ${it.imballo}` : ''}</span>
                                                                <span className={styles.itemCode}>{it.codice_l2f}</span>
                                                            </div>
                                                            <span className={styles.itemQty}>×{it.quantita}</span>
                                                            <span className={styles.itemPrice}>{formatEuro(it.prezzo_unitario * it.quantita)}</span>
                                                        </div>
                                                    ))}
                                                    {o.note && <p className={styles.orderNote}>Note: {o.note}</p>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                  </>
                )}
            </div>
        </main>
    );
};
