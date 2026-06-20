import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LogIn, UserPlus, Lock, Mail, Building2, Phone, MapPin, FileText,
    Clock, CheckCircle2, LogOut, ArrowRight, AlertCircle,
} from 'lucide-react';
import styles from './Accedi.module.css';
import logoparts from '../assets/logoparts.png';
import { useAuth } from '../lib/auth';

type Mode = 'login' | 'register';

export const Accedi = () => {
    const { session, officina, loading, isActive, signIn, signUp, signOut } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [confirmSent, setConfirmSent] = useState(false);

    // campi
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ragioneSociale, setRagioneSociale] = useState('');
    const [piva, setPiva] = useState('');
    const [telefono, setTelefono] = useState('');
    const [citta, setCitta] = useState('');

    const onLogin = async (e: FormEvent) => {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        const { error } = await signIn(email.trim(), password);
        setBusy(false);
        if (error) setErr(traduciErrore(error));
    };

    const onRegister = async (e: FormEvent) => {
        e.preventDefault();
        setErr(null);
        if (password.length < 8) {
            setErr('La password deve avere almeno 8 caratteri.');
            return;
        }
        setBusy(true);
        const { error, needsConfirm } = await signUp({
            email: email.trim(),
            password,
            ragione_sociale: ragioneSociale.trim(),
            piva: piva.trim(),
            telefono: telefono.trim(),
            citta: citta.trim(),
        });
        setBusy(false);
        if (error) {
            setErr(traduciErrore(error));
            return;
        }
        if (needsConfirm) setConfirmSent(true);
        // se c'è sessione, lo stato passa automaticamente a "in attesa di approvazione"
    };

    /* ---- stati schermata ---- */
    let body: React.ReactNode;

    if (loading) {
        body = <div className={styles.loadingDot} aria-label="Caricamento" />;
    } else if (confirmSent && !session) {
        body = (
            <div className={styles.statusBox}>
                <Mail size={40} className={styles.statusIcon} />
                <h2>Conferma la tua email</h2>
                <p>
                    Ti abbiamo inviato un link di conferma a <strong>{email}</strong>.
                    Confermala, poi attendi l’attivazione dell’account da parte di L2F.
                </p>
                <button className={styles.ghostBtn} onClick={() => { setConfirmSent(false); setMode('login'); }}>
                    Torna al login
                </button>
            </div>
        );
    } else if (session && officina) {
        // loggato
        if (isActive) {
            body = (
                <div className={styles.statusBox}>
                    <CheckCircle2 size={40} className={styles.statusIconOk} />
                    <h2>Bentornato, {officina.ragione_sociale}</h2>
                    <p>Il tuo account è <strong>attivo</strong>: prezzi netti e ordini sbloccati.</p>
                    <div className={styles.accountMeta}>
                        {officina.pacchetto && <span>Pacchetto: <strong>{officina.pacchetto}</strong></span>}
                        {officina.cashback_rate > 0 && <span>Cashback: <strong>{officina.cashback_rate}%</strong></span>}
                    </div>
                    <div className={styles.actions}>
                        <Link to="/catalogo" className={styles.primaryBtn}>
                            Vai al catalogo <ArrowRight size={18} />
                        </Link>
                        <Link to="/area-clienti" className={styles.ghostBtn}>I miei ordini</Link>
                    </div>
                    <button className={styles.linkBtn} onClick={signOut}><LogOut size={15} /> Esci</button>
                </div>
            );
        } else {
            body = (
                <div className={styles.statusBox}>
                    <Clock size={40} className={styles.statusIconWait} />
                    <h2>Account in attesa di attivazione</h2>
                    <p>
                        Grazie <strong>{officina.ragione_sociale}</strong>. La tua richiesta è stata registrata:
                        un nostro agente verificherà i dati e attiverà l’accesso ai prezzi netti.
                        Ti avviseremo via email.
                    </p>
                    <button className={styles.linkBtn} onClick={signOut}><LogOut size={15} /> Esci</button>
                </div>
            );
        }
    } else {
        // non loggato: login / registrazione
        body = (
            <>
                <div className={styles.tabs} role="tablist">
                    <button
                        role="tab"
                        aria-selected={mode === 'login'}
                        className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                        onClick={() => { setMode('login'); setErr(null); }}
                    >
                        <LogIn size={16} /> Accedi
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === 'register'}
                        className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                        onClick={() => { setMode('register'); setErr(null); }}
                    >
                        <UserPlus size={16} /> Registra officina
                    </button>
                </div>

                {err && (
                    <div className={styles.error} role="alert">
                        <AlertCircle size={16} /> {err}
                    </div>
                )}

                {mode === 'login' ? (
                    <form className={styles.form} onSubmit={onLogin}>
                        <Field icon={<Mail size={16} />} label="Email">
                            <input type="email" autoComplete="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)} placeholder="officina@email.it" />
                        </Field>
                        <Field icon={<Lock size={16} />} label="Password">
                            <input type="password" autoComplete="current-password" required value={password}
                                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </Field>
                        <button type="submit" className={styles.submit} disabled={busy}>
                            {busy ? 'Accesso…' : <>Accedi <LogIn size={18} /></>}
                        </button>
                    </form>
                ) : (
                    <form className={styles.form} onSubmit={onRegister}>
                        <Field icon={<Building2 size={16} />} label="Ragione sociale *">
                            <input type="text" required value={ragioneSociale}
                                onChange={(e) => setRagioneSociale(e.target.value)} placeholder="Officina Rossi S.r.l." />
                        </Field>
                        <Field icon={<Mail size={16} />} label="Email *">
                            <input type="email" autoComplete="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)} placeholder="officina@email.it" />
                        </Field>
                        <Field icon={<Lock size={16} />} label="Password * (min 8 caratteri)">
                            <input type="password" autoComplete="new-password" required minLength={8} value={password}
                                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </Field>
                        <div className={styles.row2}>
                            <Field icon={<FileText size={16} />} label="Partita IVA">
                                <input type="text" value={piva}
                                    onChange={(e) => setPiva(e.target.value)} placeholder="IT01234567890" />
                            </Field>
                            <Field icon={<Phone size={16} />} label="Telefono">
                                <input type="tel" value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)} placeholder="081 …" />
                            </Field>
                        </div>
                        <Field icon={<MapPin size={16} />} label="Città">
                            <input type="text" value={citta}
                                onChange={(e) => setCitta(e.target.value)} placeholder="Napoli" />
                        </Field>
                        <button type="submit" className={styles.submit} disabled={busy}>
                            {busy ? 'Invio…' : <>Registra officina <UserPlus size={18} /></>}
                        </button>
                        <p className={styles.hint}>
                            La registrazione è soggetta ad approvazione: dopo la verifica dei dati attiveremo
                            l’accesso ai <strong>prezzi netti riservati</strong> e agli ordini.
                        </p>
                    </form>
                )}
            </>
        );
    }

    return (
        <main className={styles.page}>
            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <header className={styles.head}>
                    <img src={logoparts} alt="L2F Parts" className={styles.logo} />
                    <h1 className={styles.title}>Area Officine</h1>
                    <p className={styles.sub}>Accesso riservato al network L2F.</p>
                </header>
                {body}
            </motion.div>
        </main>
    );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <label className={styles.field}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.inputWrap}>
            <span className={styles.fieldIcon}>{icon}</span>
            {children}
        </span>
    </label>
);

/** Traduce i messaggi più comuni di Supabase Auth in italiano. */
function traduciErrore(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('invalid login')) return 'Email o password non corretti.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'Questa email è già registrata. Prova ad accedere.';
    if (m.includes('email not confirmed')) return 'Devi prima confermare la tua email.';
    if (m.includes('password')) return 'Password non valida (minimo 8 caratteri).';
    if (m.includes('rate limit')) return 'Troppi tentativi. Riprova tra qualche minuto.';
    return msg;
}
