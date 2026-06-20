import { useState } from 'react';
import { Mail, Phone, MapPin, Youtube, Send, Check, AlertCircle } from 'lucide-react';
import styles from './Contatti.module.css';
import { CONTACT } from '../lib/contact';
import { supabase } from '../lib/supabase';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Contatti = () => {
    const [form, setForm] = useState({ nome: '', email: '', telefono: '', officina: '', messaggio: '' });
    const [status, setStatus] = useState<Status>('idle');
    const [errMsg, setErrMsg] = useState('');

    const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'sending') return;
        if (!form.nome.trim() || !form.messaggio.trim() || !EMAIL_RE.test(form.email.trim())) {
            setStatus('error');
            setErrMsg('Controlla nome, email e messaggio.');
            return;
        }
        setStatus('sending');
        setErrMsg('');
        try {
            const { data, error } = await supabase.functions.invoke('send-contact', { body: form });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setErrMsg(err instanceof Error ? err.message : 'Invio non riuscito.');
        }
    };

    return (
        <main className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <span className={styles.eyebrow}>Contatti</span>
                    <h1 className={styles.title}>Parliamone</h1>
                    <p className={styles.lead}>
                        Vuoi entrare nel network L2F, ricevere il listino o hai una domanda
                        sui prodotti? Scrivici: ti ricontatta il tuo consulente.
                    </p>
                </header>

                <div className={styles.grid}>
                    <aside className={styles.info}>
                        <a className={styles.infoItem} href={`mailto:${CONTACT.email}`}>
                            <Mail size={20} className={styles.infoIcon} aria-hidden="true" />
                            <span>
                                <span className={styles.infoLabel}>Email</span>
                                <span className={styles.infoValue}>{CONTACT.email}</span>
                            </span>
                        </a>
                        <a className={styles.infoItem} href={CONTACT.phoneHref}>
                            <Phone size={20} className={styles.infoIcon} aria-hidden="true" />
                            <span>
                                <span className={styles.infoLabel}>Telefono</span>
                                <span className={styles.infoValue}>{CONTACT.phone}</span>
                            </span>
                        </a>
                        <div className={styles.infoItem}>
                            <MapPin size={20} className={styles.infoIcon} aria-hidden="true" />
                            <span>
                                <span className={styles.infoLabel}>Sede</span>
                                <span className={styles.infoValue}>{CONTACT.company}</span>
                                <span className={styles.infoSub}>{CONTACT.address}</span>
                                <span className={styles.infoSub}>P.IVA {CONTACT.piva}</span>
                            </span>
                        </div>
                        <a className={styles.infoItem} href={CONTACT.youtube} target="_blank" rel="noopener noreferrer">
                            <Youtube size={20} className={styles.infoIcon} aria-hidden="true" />
                            <span>
                                <span className={styles.infoLabel}>YouTube</span>
                                <span className={styles.infoValue}>@l2fautomotive42</span>
                            </span>
                        </a>
                    </aside>

                    {status === 'success' ? (
                        <div className={styles.success}>
                            <span className={styles.successIcon}><Check size={28} /></span>
                            <h2 className={styles.successTitle}>Messaggio inviato</h2>
                            <p className={styles.successText}>
                                Grazie {form.nome.split(' ')[0]}, abbiamo ricevuto la tua richiesta.
                                Ti ricontattiamo al più presto.
                            </p>
                        </div>
                    ) : (
                        <form className={styles.form} onSubmit={onSubmit} noValidate>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label htmlFor="nome">Nome e cognome *</label>
                                    <input id="nome" type="text" value={form.nome} onChange={update('nome')} required autoComplete="name" />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="officina">Officina / azienda</label>
                                    <input id="officina" type="text" value={form.officina} onChange={update('officina')} autoComplete="organization" />
                                </div>
                            </div>
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label htmlFor="email">Email *</label>
                                    <input id="email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="telefono">Telefono</label>
                                    <input id="telefono" type="tel" value={form.telefono} onChange={update('telefono')} autoComplete="tel" />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="messaggio">Messaggio *</label>
                                <textarea id="messaggio" rows={5} value={form.messaggio} onChange={update('messaggio')} required />
                            </div>

                            {status === 'error' && (
                                <div className={styles.error} role="alert">
                                    <AlertCircle size={16} aria-hidden="true" />
                                    <span>{errMsg} Puoi anche scrivere a <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</span>
                                </div>
                            )}

                            <button type="submit" className={styles.submit} disabled={status === 'sending'}>
                                {status === 'sending' ? 'Invio in corso…' : 'Invia messaggio'}
                                {status !== 'sending' && <Send size={18} aria-hidden="true" />}
                            </button>
                            <p className={styles.privacy}>
                                Inviando accetti di essere ricontattato da {CONTACT.company} in merito alla tua richiesta.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};
