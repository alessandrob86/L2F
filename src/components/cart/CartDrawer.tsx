import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingCart, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import styles from './CartDrawer.module.css';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { submitOrder } from '../../lib/orders';
import { formatEuro, PLACEHOLDER_IMG } from '../../lib/catalog';

type Phase = 'cart' | 'sending' | 'done' | 'error';

export const CartDrawer = () => {
    const { items, count, totaleListino, totaleNetto, setQty, remove, clear, isOpen, close } = useCart();
    const { officina, isActive } = useAuth();
    const [phase, setPhase] = useState<Phase>('cart');
    const [note, setNote] = useState('');
    const [orderNum, setOrderNum] = useState<string | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const cashback = officina?.cashback_rate ?? 0;
    const risparmio = totaleListino - totaleNetto;

    const onSubmit = async () => {
        if (!officina || !isActive || items.length === 0) return;
        setPhase('sending');
        setErrMsg(null);
        try {
            const res = await submitOrder({
                officinaId: officina.id,
                items,
                note,
                totaleListino,
                totaleNetto,
            });
            setOrderNum(res.numero);
            setPhase('done');
            clear();
        } catch (e) {
            setErrMsg(e instanceof Error ? e.message : 'Errore durante l’invio.');
            setPhase('error');
        }
    };

    const handleClose = () => {
        close();
        // reset stato a chiusura completata
        if (phase === 'done' || phase === 'error') {
            setTimeout(() => { setPhase('cart'); setOrderNum(null); setNote(''); }, 250);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        onClick={handleClose}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    />
                    <motion.aside
                        className={styles.drawer}
                        role="dialog"
                        aria-label="Carrello"
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
                    >
                        <header className={styles.head}>
                            <h2 className={styles.title}>
                                <ShoppingCart size={20} /> Il tuo ordine
                                {count > 0 && <span className={styles.badge}>{count}</span>}
                            </h2>
                            <button className={styles.closeBtn} onClick={handleClose} aria-label="Chiudi">
                                <X size={22} />
                            </button>
                        </header>

                        {phase === 'done' ? (
                            <div className={styles.center}>
                                <CheckCircle2 size={48} className={styles.okIcon} />
                                <h3>Ordine inviato!</h3>
                                <p>Numero ordine <strong>{orderNum}</strong>. Lo trovi in <Link to="/area-clienti" onClick={handleClose}>I miei ordini</Link>. Ti contatteremo per la conferma.</p>
                                <button className={styles.primaryBtn} onClick={handleClose}>Continua</button>
                            </div>
                        ) : items.length === 0 ? (
                            <div className={styles.center}>
                                <ShoppingCart size={44} className={styles.emptyIcon} />
                                <h3>Carrello vuoto</h3>
                                <p>Aggiungi prodotti dal catalogo per comporre il tuo ordine.</p>
                                <Link to="/catalogo" className={styles.primaryBtn} onClick={handleClose}>Vai al catalogo</Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.list}>
                                    {items.map((it) => {
                                        const unit = it.prezzo_netto ?? it.prezzo_listino ?? 0;
                                        return (
                                            <div key={it.key} className={styles.row}>
                                                <div className={styles.rowTop}>
                                                    <img className={styles.cartThumb} src={it.immagine || PLACEHOLDER_IMG} alt="" loading="lazy" />
                                                    <div className={styles.rowMain}>
                                                        <span className={styles.rowName}>{it.nome}</span>
                                                        <span className={styles.rowMeta}>
                                                            {it.codice_l2f}{it.imballo ? ` · ${it.imballo}` : ''}
                                                        </span>
                                                        <span className={styles.rowUnit}>{formatEuro(unit)} cad.</span>
                                                    </div>
                                                </div>
                                                <div className={styles.rowCtrl}>
                                                    <div className={styles.stepper}>
                                                        <button onClick={() => setQty(it.key, it.quantita - 1)} aria-label="Diminuisci"><Minus size={14} /></button>
                                                        <span>{it.quantita}</span>
                                                        <button onClick={() => setQty(it.key, it.quantita + 1)} aria-label="Aumenta"><Plus size={14} /></button>
                                                    </div>
                                                    <span className={styles.rowTotal}>{formatEuro(unit * it.quantita)}</span>
                                                    <button className={styles.removeBtn} onClick={() => remove(it.key)} aria-label="Rimuovi"><Trash2 size={15} /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={styles.footer}>
                                    {isActive ? (
                                        <>
                                            <textarea
                                                className={styles.note}
                                                placeholder="Note per l’ordine (facoltative)…"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                rows={2}
                                            />
                                            <div className={styles.totals}>
                                                <div className={styles.totLine}><span>Listino</span><span className={styles.strike}>{formatEuro(totaleListino)}</span></div>
                                                <div className={styles.totLine}><span>Totale netto</span><span className={styles.totNet}>{formatEuro(totaleNetto)}</span></div>
                                                {risparmio > 0.005 && <div className={styles.totSave}>Risparmi {formatEuro(risparmio)}</div>}
                                                {cashback > 0 && <div className={styles.totSave}>+ cashback {cashback}% ≈ {formatEuro(totaleNetto * cashback / 100)}</div>}
                                                <div className={styles.iva}>IVA esclusa</div>
                                            </div>
                                            {phase === 'error' && (
                                                <div className={styles.err}><AlertCircle size={15} /> {errMsg}</div>
                                            )}
                                            <button className={styles.submit} onClick={onSubmit} disabled={phase === 'sending'}>
                                                {phase === 'sending' ? 'Invio in corso…' : 'Invia ordine'}
                                            </button>
                                            <p className={styles.disc}>L’invio genera una richiesta d’ordine; un agente L2F confermerà disponibilità e consegna.</p>
                                        </>
                                    ) : (
                                        <div className={styles.gated}>
                                            <Lock size={16} />
                                            <p>
                                                Solo le <strong>officine attive</strong> possono inviare ordini e vedere i prezzi netti.
                                                <br />
                                                <Link to="/accedi" onClick={handleClose}>Accedi o registra la tua officina →</Link>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};
