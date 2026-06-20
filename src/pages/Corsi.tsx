import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, CalendarDays, Clock, MapPin, Check, Hourglass,
    CheckCircle2, Users, ShoppingCart, Ticket, Maximize2, X, ArrowLeft, ArrowUpRight,
} from 'lucide-react';
import styles from './Corsi.module.css';
import logoacademy from '../assets/logoacademy.png';
import { useAuth } from '../lib/auth';
import { accessRequestMailto } from '../lib/contact';
import {
    getCorsi, getMyIscrizioni, aderisci, formatDataCorso, iscrizioniChiuse,
    type Corso, type MyIscrizione,
} from '../lib/academy';

/* Countdown live: verso la scadenza iscrizioni (warn) o verso l'inizio corso (go) */
const Countdown = ({ target, label, tone }: { target: string; label: string; tone: 'warn' | 'go' }) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) {
        return (
            <div className={`${styles.countdown} ${styles['cd_' + tone]}`}>
                <span className={styles.cdLabel}>{tone === 'go' ? 'Corso in corso o concluso' : 'Iscrizioni chiuse'}</span>
            </div>
        );
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const seg = (n: number, u: string) => <span className={styles.cdSeg}><b>{String(n).padStart(2, '0')}</b><i>{u}</i></span>;
    return (
        <div className={`${styles.countdown} ${styles['cd_' + tone]}`}>
            <span className={styles.cdLabel}>{tone === 'go' ? <Clock size={13} /> : <Hourglass size={13} />} {label}</span>
            <div className={styles.cdSegs}>
                {d > 0 && seg(d, 'g')}
                {seg(h, 'h')}
                {seg(m, 'm')}
                {seg(s, 's')}
            </div>
        </div>
    );
};

export const Corsi = () => {
    const navigate = useNavigate();
    const { session, officina, isActive } = useAuth();
    const [corsi, setCorsi] = useState<Corso[] | null>(null);
    const [mine, setMine] = useState<MyIscrizione[]>([]);
    const [busy, setBusy] = useState<string | null>(null);
    const [zoom, setZoom] = useState<string | null>(null);

    useEffect(() => {
        getCorsi().then(setCorsi).catch(() => setCorsi([]));
        if (isActive) getMyIscrizioni().then(setMine).catch(() => setMine([]));
    }, [isActive]);

    const enrolled = new Set(mine.map((m) => m.corso_id));
    const creditiTotali = officina?.crediti_corsi ?? 0;
    const creditiUsati = mine.filter((m) => m.con_credito).length;
    const creditiRimasti = Math.max(0, creditiTotali - creditiUsati);

    const onAderisci = async (c: Corso) => {
        if (!officina) return;
        const conCredito = creditiRimasti > 0;
        setBusy(c.id);
        try {
            await aderisci(c.id, officina.id, conCredito, c.prezzo);
            setMine((prev) => [...prev, { corso_id: c.id, con_credito: conCredito }]);
        } catch { /* unique o rete */ } finally { setBusy(null); }
    };

    return (
        <main className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <img src={logoacademy} alt="L2F Academy" className={styles.logo} />
                    <div className={styles.headText}>
                        <button className={styles.back} onClick={() => { if (isActive) navigate('/area-clienti'); else navigate(-1); }}>
                            <ArrowLeft size={16} /> {isActive ? 'Area clienti' : 'Indietro'}
                        </button>
                        <span className={styles.eyebrow}>L2F Academy</span>
                        <h1 className={styles.title}>Corsi di formazione</h1>
                        <p className={styles.subtitle}>
                            Formazione tecnica pratica. Usa i <strong>crediti corso</strong> inclusi nel tuo programma,
                            oppure acquista i corsi extra.
                        </p>
                    </div>
                    {isActive && (
                        <div className={styles.credits}>
                            <Ticket size={20} />
                            <div className={styles.creditsN}>{creditiRimasti}</div>
                            <div className={styles.creditsLbl}>credit{creditiRimasti === 1 ? 'o' : 'i'} {creditiRimasti === 1 ? 'rimasto' : 'rimasti'}<br /><span>{creditiUsati}/{creditiTotali} usati</span></div>
                        </div>
                    )}
                </header>

                {!session ? (
                    <div className={styles.joinCta}>
                        <span className={styles.joinIcon}><GraduationCap size={34} /></span>
                        <h2 className={styles.joinTitle}>La formazione è riservata alle officine del network</h2>
                        <p className={styles.joinText}>
                            Entra nel network <strong>L2F</strong> per accedere ai corsi tecnici di L2F Academy,
                            con i crediti formazione inclusi nel tuo programma e la possibilità di prenotare i corsi extra.
                        </p>
                        <div className={styles.joinActions}>
                            <a href={accessRequestMailto()} className={styles.joinPrimary}>Diventa officina L2F <ArrowUpRight size={18} /></a>
                            <Link to="/accedi" className={styles.joinGhost}>Ho già un account</Link>
                        </div>
                    </div>
                ) : !isActive ? (
                    <div className={styles.state}><Hourglass size={32} /><p>Il tuo account è in attesa di attivazione. Appena attivo vedrai i corsi in programma.</p></div>
                ) : !corsi ? (
                    <div className={styles.spinner} />
                ) : corsi.length === 0 ? (
                    <div className={styles.state}><GraduationCap size={32} /><p>Nessun corso in programma al momento.</p></div>
                ) : (
                    <div className={styles.grid}>
                        {corsi.map((c) => {
                            const iscritto = enrolled.has(c.id);
                            const chiuso = iscrizioniChiuse(c);
                            const confermato = c.iscritti_count >= c.min_partecipanti;
                            return (
                                <div key={c.id} className={styles.card}>
                                    <div className={styles.media}>
                                        {c.immagine ? (
                                            <button type="button" className={styles.mediaBtn} onClick={() => setZoom(c.immagine)} aria-label="Ingrandisci foto">
                                                <img src={c.immagine} alt="" loading="lazy" />
                                                <span className={styles.zoom}><Maximize2 size={15} /></span>
                                            </button>
                                        ) : (
                                            <div className={styles.mediaPlaceholder}><GraduationCap size={42} /></div>
                                        )}
                                        <span className={`${styles.statusTag} ${confermato ? styles.tagOk : styles.tagWait}`}>
                                            {confermato ? 'Confermato' : `${c.iscritti_count}/${c.min_partecipanti} per confermare`}
                                        </span>
                                    </div>
                                    <div className={styles.body}>
                                        <h2 className={styles.cTitle}>{c.titolo}</h2>
                                        <div className={styles.meta}>
                                            <span><CalendarDays size={14} /> {formatDataCorso(c.data_corso)}</span>
                                            {c.durata && <span><Clock size={14} /> {c.durata}</span>}
                                            {c.sede && <span><MapPin size={14} /> {c.sede}</span>}
                                            {c.posti != null && <span><Users size={14} /> {c.posti} posti</span>}
                                        </div>
                                        {c.descrizione && <p className={styles.desc}>{c.descrizione}</p>}
                                        {c.punti.length > 0 && (
                                            <ul className={styles.punti}>
                                                {c.punti.map((p, i) => <li key={i}><Check size={14} /> {p}</li>)}
                                            </ul>
                                        )}
                                        {iscritto && c.data_corso ? (
                                            <Countdown target={c.data_corso} label="Il corso inizia tra" tone="go" />
                                        ) : (!iscritto && c.iscrizioni_entro && !chiuso) ? (
                                            <Countdown target={c.iscrizioni_entro} label="Iscrizioni aperte ancora per" tone="warn" />
                                        ) : null}

                                        <div className={styles.actionRow}>
                                            <div className={styles.price}>
                                                {c.prezzo > 0
                                                    ? <><span className={styles.priceVal}>€ {c.prezzo}</span><span className={styles.priceNote}>o 1 credito</span></>
                                                    : <span className={styles.priceFree}>Incluso · 1 credito</span>}
                                            </div>
                                            {!session ? (
                                                <Link to="/accedi" className={styles.ctaGhost}>Accedi per iscriverti</Link>
                                            ) : !isActive ? (
                                                <span className={styles.locked}>Account in attesa</span>
                                            ) : iscritto ? (
                                                <span className={styles.iscritto}><CheckCircle2 size={16} /> Iscritto</span>
                                            ) : chiuso ? (
                                                <span className={styles.locked}>Iscrizioni chiuse</span>
                                            ) : creditiRimasti > 0 ? (
                                                <button className={styles.ctaPrimary} onClick={() => onAderisci(c)} disabled={busy === c.id}>
                                                    {busy === c.id ? 'Invio…' : <><Ticket size={16} /> Usa 1 credito</>}
                                                </button>
                                            ) : (
                                                <button className={styles.ctaBuy} onClick={() => onAderisci(c)} disabled={busy === c.id}>
                                                    {busy === c.id ? 'Invio…' : <><ShoppingCart size={16} /> Acquista € {c.prezzo}</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <AnimatePresence>
                    {zoom && (
                        <motion.div className={styles.lightbox} onClick={() => setZoom(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.img src={zoom} alt="Foto corso" className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} />
                            <button className={styles.lightboxClose} onClick={() => setZoom(null)} aria-label="Chiudi"><X size={22} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};
