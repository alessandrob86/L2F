import { useRef, useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate,
    useMotionValueEvent,
    useReducedMotion,
} from 'framer-motion';
import {
    Percent, Database, Megaphone, PackageCheck, GraduationCap, Gift,
    ArrowUpRight, Search, ChevronDown,
    Car, ScanLine, Cpu, List, BookOpen, User, LogOut,
    CircuitBoard, Wrench, AlertTriangle, MapPin, Cog, HelpCircle,
    Compass, Palette, Share2, Check, CalendarDays,
} from 'lucide-react';
import styles from './Servizi.module.css';
import logoservice from '../assets/logoservice.png';
import logoacademy from '../assets/logoacademy.png';
import { PricingPackages } from '../components/sections/PricingPackages';
import { accessRequestMailto } from '../lib/contact';
import { useAuth } from '../lib/auth';

/* CTA che si adatta: ospite → "Richiedi accesso"; officina attiva → "Vai al catalogo"; in attesa → area clienti. */
const AccessCta = () => {
    const { session, isActive } = useAuth();
    if (session) {
        return (
            <Link to={isActive ? '/catalogo' : '/area-clienti'} className={styles.ctaPrimary}>
                {isActive ? 'Vai al catalogo' : 'Vai all’area clienti'} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
        );
    }
    return (
        <a href={accessRequestMailto()} className={styles.ctaPrimary}>
            Richiedi accesso <ArrowUpRight size={18} aria-hidden="true" />
        </a>
    );
};

const PILLARS = [
    { icon: Percent, title: 'Cashback', desc: 'Recuperi dal 3% al 5% sui tuoi acquisti, in base al pacchetto. Margine reale che torna in officina.' },
    { icon: Database, title: 'L2F Tech', desc: 'Banca dati tecnica per identificare il ricambio giusto: schede e dati di montaggio sempre a portata.' },
    { icon: Megaphone, title: 'Marketing & Social', desc: 'Materiali personalizzati, gestione Facebook/Instagram e campagne sponsorizzate a tuo nome.' },
    { icon: PackageCheck, title: 'Reso a Vista', desc: 'Gli articoli difettosi rientrano subito in filiale, senza pratiche né attese.', to: '/condizioni' },
    { icon: GraduationCap, title: 'L2F Academy', desc: 'Formazione tecnica pratica e ad alto impatto: un corso tecnico ogni anno per restare al passo con nuove tecnologie, prodotti e procedure.' },
    { icon: Gift, title: 'Kit benvenuto', desc: 'Insegna, abbigliamento e cancelleria a marchio: l’officina entra subito nel mondo L2F.' },
];

/* ---------- HERO scrollytelling: sequenza frame su canvas guidata dallo scroll + contenuti in sovrimpressione ---------- */
const HERO_FRAMES = 120;
const heroFrameSrc = (i: number) => `/hero-seq/${String(i + 1).padStart(4, '0')}.webp`;

const ServiziHero = () => {
    const reduce = useReducedMotion();
    const trackRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrame = useRef(-1);
    const [posterVisible, setPosterVisible] = useState(true);

    const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });

    /* disegna il frame in modalità "cover" sul canvas */
    const draw = (idx: number) => {
        const canvas = canvasRef.current;
        const img = imagesRef.current[idx];
        if (!canvas || !img || !img.complete || !img.naturalWidth) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const cw = canvas.width, ch = canvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        currentFrame.current = idx;
    };

    const sizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        draw(currentFrame.current >= 0 ? currentFrame.current : 0);
    };

    /* preload di tutti i frame */
    useEffect(() => {
        if (reduce) return;
        let mounted = true;
        const onFirst = () => { if (mounted) { sizeCanvas(); draw(0); setPosterVisible(false); } };
        const imgs: HTMLImageElement[] = [];
        for (let i = 0; i < HERO_FRAMES; i++) {
            const im = new Image();
            if (i === 0) im.onload = onFirst;   // onload prima di src (gestisce cache)
            im.src = heroFrameSrc(i);
            imgs.push(im);
        }
        imagesRef.current = imgs;
        if (imgs[0].complete) onFirst();        // già in cache → scatta subito
        return () => { mounted = false; };
    }, [reduce]);

    /* dimensiona il canvas + ridisegna al resize */
    useEffect(() => {
        if (reduce) return;
        sizeCanvas();
        window.addEventListener('resize', sizeCanvas);
        return () => window.removeEventListener('resize', sizeCanvas);
    }, [reduce]);

    /* scroll -> frame */
    useMotionValueEvent(scrollYProgress, 'change', (p) => {
        if (reduce) return;
        const idx = Math.min(HERO_FRAMES - 1, Math.max(0, Math.round(p * (HERO_FRAMES - 1))));
        if (idx !== currentFrame.current) draw(idx);
    });

    /* contenuti in sovrimpressione (3 "beat") che entrano/escono con lo scroll */
    const aOp = useTransform(scrollYProgress, [0.0, 0.05, 0.24, 0.32], [1, 1, 1, 0]);
    const aY = useTransform(scrollYProgress, [0.0, 0.32], [0, -36]);
    const bOp = useTransform(scrollYProgress, [0.34, 0.42, 0.58, 0.66], [0, 1, 1, 0]);
    const bY = useTransform(scrollYProgress, [0.34, 0.66], [40, -36]);
    const cOp = useTransform(scrollYProgress, [0.68, 0.78, 1], [0, 1, 1]);
    const cY = useTransform(scrollYProgress, [0.68, 0.82], [40, 0]);
    const cueOp = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

    /* la sfumatura del fondo entra SOLO nell'ultimo tratto di scroll (non durante lo scrub):
       maskStop 100% = canvas pieno; verso fine scende a 50% = il fondo dissolve nel sito */
    const maskStop = useTransform(scrollYProgress, [0.8, 0.97], ['100%', '50%']);
    const heroMask = useMotionTemplate`linear-gradient(to bottom, #000 ${maskStop}, transparent 100%)`;

    /* fallback reduced-motion: hero statica con poster + contenuti impilati */
    if (reduce) {
        return (
            <section className={styles.hero}>
                <div className={styles.heroPhotoWrap}>
                    <img className={styles.heroPhoto} src="/servizi-hero.webp" alt="Officina L2F" />
                </div>
                <div className={styles.heroOverlays} aria-hidden="true">
                    <div className={styles.heroEmber} /><div className={styles.heroScrim} /><div className={styles.heroVignette} />
                </div>
                <div className={styles.heroContent}>
                    <span className={styles.heroEyebrow}>Il programma per la tua officina</span>
                    <h1 className={styles.heroTitle}>Il programma che fa <span className={styles.heroAccent}>crescere l’officina</span></h1>
                    <p className={styles.heroSub}>Prodotti a marchio tuo, banca dati tecnica, marketing e cashback. Più margine, più visibilità, meno pensieri.</p>
                    <div className={styles.heroCtas}>
                        <AccessCta />
                        <a href="#piani" className={styles.ctaGhost}>Vedi i pacchetti</a>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.heroTrack} ref={trackRef}>
            <div className={styles.heroSticky}>
                <img className={styles.heroPoster} src="/servizi-hero.webp" alt="" aria-hidden="true"
                    style={{ opacity: posterVisible ? 1 : 0 }} />
                <motion.canvas ref={canvasRef} className={styles.heroCanvas}
                    style={{ WebkitMaskImage: heroMask, maskImage: heroMask }} />

                <div className={styles.heroOverlays} aria-hidden="true">
                    <div className={styles.heroEmber} />
                    <div className={styles.heroScrim} />
                    <div className={styles.heroVignette} />
                </div>

                {/* Beat 1 — hook */}
                <motion.div className={styles.heroBeat} style={{ opacity: aOp, y: aY }}>
                    <span className={styles.heroEyebrow}>Il programma per la tua officina</span>
                    <h1 className={styles.heroTitle}>Il programma che fa <span className={styles.heroAccent}>crescere l’officina</span></h1>
                    <p className={styles.heroSub}>Prodotti a marchio tuo, banca dati tecnica, marketing e cashback.</p>
                </motion.div>

                {/* Beat 2 — valore */}
                <motion.div className={styles.heroBeat} style={{ opacity: bOp, y: bY }}>
                    <span className={styles.heroEyebrow}>Tutto incluso</span>
                    <p className={styles.heroBeatTitle}>Banca dati · Marketing · <span className={styles.heroAccent}>Cashback</span></p>
                    <p className={styles.heroSub}>Più margine, più visibilità, meno pensieri. La forza del gruppo dietro la tua officina.</p>
                </motion.div>

                {/* Beat 3 — call to action */}
                <motion.div className={styles.heroBeat} style={{ opacity: cOp, y: cY }}>
                    <span className={styles.heroEyebrow}>Entra nel programma</span>
                    <p className={styles.heroBeatTitle}>Diventa <span className={styles.heroAccent}>L2F Service Partner</span></p>
                    <div className={styles.heroCtas}>
                        <AccessCta />
                        <a href="#piani" className={styles.ctaGhost}>Vedi i pacchetti</a>
                    </div>
                </motion.div>

                <motion.div className={styles.scrollCue} style={{ opacity: cueOp }} aria-hidden="true">
                    <ChevronDown size={22} />
                </motion.div>
            </div>
        </section>
    );
};

/* ---------- Banca Dati L2F Tech: ricostruzione fedele dell'app, animata allo scroll ---------- */
const NAV_TOP = [
    { icon: Car, label: 'Ricerca per Marchio', active: true },
    { icon: ScanLine, label: 'Ricerca per Targa/Telaio' },
    { icon: Cpu, label: 'Ricerca per Codice Motore' },
    { icon: List, label: 'Ultimi Veicoli Cercati' },
];
const NAV_BOT = [
    { icon: BookOpen, label: 'Manuali Semantica', accent: true },
    { icon: User, label: 'Il Mio Profilo' },
    { icon: LogOut, label: 'Esci', accent: true },
];
const VEHICLE = [
    ['Modello', 'Qashqai'],
    ['Motorizzazione', '1.3 DIG-T MHEV 16v'],
    ['Potenza', '116 Kw · 158 Cv'],
    ['Codice Motore', 'HR13DDT'],
    ['Anno', 'Dal 2021'],
];
const CATS = [
    { icon: CircuitBoard, label: 'Elettronica', items: ['Schemi Elettrici', 'Fusibili e Relè'] },
    { icon: Wrench, label: 'Manutenzione', items: ['Azzeramento Service', 'Tagliandi', 'Distribuzione', 'Coppie di Serraggio', 'Dati Meccanici'] },
    { icon: AlertTriangle, label: 'Guasti', items: ['Codici guasto OBDII', 'Bollettini tecnici'] },
    { icon: MapPin, label: 'Localizzazione', items: ['Filtro Abitacolo', 'Presa Diagnosi OBDII'] },
    { icon: Cog, label: 'Cambio automatico', items: ['Olio cambio', 'Dati tecnici'] },
    { icon: HelpCircle, label: 'Info tecniche', items: ['Richiesta informazioni'], gray: true },
];

const HubScreen = () => (
    <div className={styles.scrHub}>
        <aside className={styles.appSide}>
            <img src={logoservice} alt="L2F Service" className={styles.appLogo} />
            <div className={styles.appOrg}>CENTRO RICAMBI AUTO SRL</div>
            <nav className={styles.appNav}>
                {NAV_TOP.map((n) => {
                    const I = n.icon;
                    return (
                        <span key={n.label} className={`${styles.appNavItem} ${n.active ? styles.appNavActive : ''}`}>
                            <I size={16} aria-hidden="true" /> {n.label}
                        </span>
                    );
                })}
                <span className={styles.appNavSep} />
                {NAV_BOT.map((n) => {
                    const I = n.icon;
                    return (
                        <span key={n.label} className={`${styles.appNavItem} ${n.accent ? styles.appNavAccent : ''}`}>
                            <I size={16} aria-hidden="true" /> {n.label}
                        </span>
                    );
                })}
            </nav>
        </aside>
        <div className={styles.appMain}>
            <div className={styles.appVehicle}>
                <div className={styles.appCar}><Car size={46} aria-hidden="true" /></div>
                <table className={styles.appSpecs}>
                    <tbody>
                        {VEHICLE.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
                    </tbody>
                </table>
            </div>
            <button type="button" className={styles.appChange} tabIndex={-1}>
                <Search size={14} aria-hidden="true" /> CAMBIA MOTORIZZAZIONE
            </button>
            <div className={styles.appSearch}>
                <Search size={15} aria-hidden="true" />
                <span>Cerca un'informazione tecnica…</span>
            </div>
            <div className={styles.appGrid}>
                {CATS.map((c) => {
                    const I = c.icon;
                    return (
                        <div key={c.label} className={styles.appCol}>
                            <span className={`${styles.appCat} ${c.gray ? styles.appCatGray : ''}`}>
                                <I size={20} aria-hidden="true" />
                            </span>
                            <span className={styles.appCatLabel}>{c.label}</span>
                            <span className={`${styles.appConnect} ${c.gray ? styles.appConnectGray : ''}`}>Connect Center</span>
                            <ul className={styles.appItems}>
                                {c.items.map((it) => <li key={it}>{it}</li>)}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

const DATI = [
    { sec: 'Dati motore', rows: [['Cilindrata', '1332 cm³'], ['Cilindri', '4'], ['Rapporto compressione', '10,5 : 1']] },
    { sec: 'Accensione', rows: [['Candele (NGK)', 'SILZKFR8D7G'], ['Capacità batteria', '70 Ah']] },
    { sec: 'Lubrificanti motore', rows: [['Olio motore — viscosità', '5W/30'], ['Specifica costruttore', 'ACEA C3 · Renault RN 17'], ['Olio + filtro — quantità', '5,4 litri']] },
    { sec: 'Fluidi ausiliari', rows: [['Liquido radiatore', 'Nissan LongLife L255N'], ['Fluido freni', 'DOT 4']] },
];
const DatiScreen = () => (
    <div className={styles.scrDoc}>
        <div className={styles.scrHead}>
            <span className={styles.scrHeadTitle}>Dati Meccanici e Lubrificanti</span>
            <em>Lista per Motori HR13DDT</em>
            <span className={styles.scrPrint}>STAMPA</span>
        </div>
        <div className={styles.scrBody}>
            <table className={styles.scrTable}>
                <tbody>
                    {DATI.map((g) => (
                        <Fragment key={g.sec}>
                            <tr className={styles.scrSec}><td colSpan={2}>{g.sec}</td></tr>
                            {g.rows.map(([k, v]) => <tr key={k}><td>{k}</td><td className={styles.scrVal}>{v}</td></tr>)}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const GUASTI = [
    ['P079A', 'Sistemi della trasmissione', 'Elemento attrito cambio/frizione 1: slittamento', '—'],
    ['P0790', 'Sistemi della trasmissione', 'Commutatore programma cambio / marcia', 'Errore generico'],
    ['P0795', 'Sistemi della trasmissione', 'Elettrovalvola controllo pressione 3', 'Errore generico'],
    ['P0796', 'Sistemi della trasmissione', 'Elettrovalvola controllo pressione 3', 'Comando mancante'],
    ['P0798', 'Sistemi della trasmissione', 'Elettrovalvola controllo pressione 3', 'Errore comando elettrico'],
];
const GuastiScreen = () => (
    <div className={styles.scrDoc}>
        <div className={styles.scrSearchRow}>
            <span className={styles.scrSearchLbl}>Ricerca per codice errore</span>
            <span className={styles.scrInput}><Search size={13} aria-hidden="true" /> p079</span>
            <span className={styles.scrBtn}>RICERCA</span>
        </div>
        <div className={styles.scrHead}><span className={styles.scrHeadTitle}>Codici Guasto</span></div>
        <div className={styles.scrBody}>
            <table className={`${styles.scrTable} ${styles.scrTableGuasti}`}>
                <thead><tr><th>Codice</th><th>Impianto</th><th>Dettaglio</th><th>Note</th></tr></thead>
                <tbody>
                    {GUASTI.map((r) => (
                        <tr key={r[0]}>
                            <td className={styles.scrCode}>{r[0]}</td>
                            <td>{r[1]}</td>
                            <td>{r[2]}</td>
                            <td className={styles.scrNote}>{r[3]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CambioScreen = () => (
    <img className={styles.scrShot} src="/bancadati/cambio.webp" alt="Banca dati — Cambio automatico Aisin Warner ATN8/AMN8" loading="lazy" decoding="async" />
);
const CinghieScreen = () => (
    <img className={styles.scrShot} src="/bancadati/cinghie.webp" alt="Banca dati — Cinghie ausiliarie, disposizione e riferimenti" loading="lazy" decoding="async" />
);

const SCREENS = [
    { key: 'hub', label: 'Veicolo e categorie', el: <HubScreen /> },
    { key: 'dati', label: 'Dati meccanici e lubrificanti', el: <DatiScreen /> },
    { key: 'guasti', label: 'Codici guasto OBDII', el: <GuastiScreen /> },
    { key: 'cambio', label: 'Cambio automatico', el: <CambioScreen /> },
    { key: 'cinghie', label: 'Cinghie ausiliarie', el: <CinghieScreen /> },
];

const BancaDati = () => {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
    const rotateX = useTransform(scrollYProgress, [0, 1], [12, 0]);
    const [active, setActive] = useState(0);
    const N = SCREENS.length;

    useEffect(() => {
        if (reduce) return;
        const id = window.setInterval(() => setActive((a) => (a + 1) % N), 4800);
        return () => window.clearInterval(id);
    }, [reduce, N]);

    return (
        <section className={styles.dbSection}>
            <div className="container">
                <div className={styles.dbHead}>
                    <span className={styles.eyebrow}>L2F Tech</span>
                    <h2 className={styles.dbTitle}>La banca dati tecnica, in officina</h2>
                    <p className={styles.dbLead}>
                        Scegli il veicolo (marchio, targa o codice motore) e accedi a tutto:
                        schemi elettrici, tagliandi, coppie di serraggio, codici guasto OBDII,
                        dati meccanici e lubrificanti. La diagnosi giusta, al primo colpo.
                    </p>
                </div>

                <div className={styles.deckStage} ref={ref}>
                    <motion.div className={styles.deck} style={reduce ? undefined : { rotateX }}>
                        {SCREENS.map((s, i) => {
                            const order = (i - active + N) % N;
                            return (
                                <motion.div
                                    key={s.key}
                                    className={styles.deckCard}
                                    style={{ zIndex: N - order }}
                                    animate={{
                                        x: order * 46,
                                        y: 0,
                                        rotate: order * 2.4,
                                        scale: 1 - order * 0.05,
                                        opacity: order > 2 ? 0 : 1 - order * 0.2,
                                    }}
                                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {s.el}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                <div className={styles.deckCaption}>
                    <motion.span
                        key={active}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {SCREENS[active].label}
                    </motion.span>
                </div>
                <div className={styles.deckDots} role="tablist" aria-label="Schermate banca dati">
                    {SCREENS.map((s, i) => (
                        <button
                            key={s.key}
                            type="button"
                            className={`${styles.deckDot} ${i === active ? styles.deckDotActive : ''}`}
                            onClick={() => setActive(i)}
                            aria-label={s.label}
                            aria-selected={i === active}
                            role="tab"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ---------- Pilastri (reveal + parallax leggero) ---------- */
const Pillars = () => {
    const reduce = useReducedMotion();
    return (
        <section className="container">
            <h2 className={styles.sectionTitle}>Tutto quello che ti diamo</h2>
            <div className={styles.pillars}>
                {PILLARS.map((p, i) => {
                    const Icon = p.icon;
                    const inner = (
                        <>
                            <span className={styles.pillarIcon}><Icon size={22} aria-hidden="true" /></span>
                            <h3 className={styles.pillarTitle}>
                                {p.title}
                                {p.to && <ArrowUpRight size={16} className={styles.pillarArrow} aria-hidden="true" />}
                            </h3>
                            <p className={styles.pillarDesc}>{p.desc}</p>
                        </>
                    );
                    const motionProps = {
                        initial: reduce ? false : { opacity: 0, y: 28 },
                        whileInView: reduce ? undefined : { opacity: 1, y: 0 },
                        viewport: { once: true, margin: '-12%' },
                        transition: { duration: 0.55, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] as const },
                    };
                    return p.to ? (
                        <motion.div key={p.title} {...motionProps}>
                            <Link to={p.to} className={`${styles.pillar} ${styles.pillarLink}`}>{inner}</Link>
                        </motion.div>
                    ) : (
                        <motion.div key={p.title} className={styles.pillar} {...motionProps}>{inner}</motion.div>
                    );
                })}
            </div>
        </section>
    );
};

/* ---------- L2F Marketing: capacità, lavori social, case study reali ---------- */
const MKT_CAPS = [
    { icon: Compass, title: "Consulenza d'impresa", desc: 'Un professionista L2F ti affianca con analisi, strategia e scelte di comunicazione, da remoto o in sede.' },
    { icon: Palette, title: 'Brand & materiali', desc: 'Nome, logo, insegna, biglietti da visita, carta intestata, flyer e cartellonistica: l’identità completa.' },
    { icon: Share2, title: 'Sito, social & advertising', desc: 'Sito dedicato, gestione social e campagne sponsorizzate mirate, con risultati misurabili.' },
];
const MKT_SOCIAL = ['social-1', 'social-2', 'social-3', 'social-4', 'social-5', 'social-6'];
const MKT_CASES = [
    { name: 'Officina partner · A', budget: '€72', cop: '14.800', imp: '38.600', az: '472', clic: '233' },
    { name: 'Officina partner · B', budget: '€60', cop: '11.300', imp: '27.900', az: '318', clic: '154' },
    { name: 'Officina partner · C', budget: '€48', cop: '9.600', imp: '22.400', az: '287', clic: '121' },
];

/* ---------- L2F Academy: vetrina formazione (pubblica) ---------- */
const ACADEMY_POINTS = [
    { icon: Wrench, title: 'Pratica, in officina', desc: 'Formazione tecnica essenziale e concreta, pensata per il lavoro di tutti i giorni.' },
    { icon: GraduationCap, title: '1 corso tecnico all’anno', desc: 'Incluso nel programma: un appuntamento annuale ad alto impatto per te e il tuo team.' },
    { icon: Cpu, title: 'Sempre aggiornato', desc: 'Diagnosi, elettronica, sistemi ibrido/EV e climatizzazione: non resti mai indietro.' },
];

const AcademySection = () => {
    return (
        <section className={styles.mktSection}>
            <div className="container">
                <div className={styles.acadHead}>
                    <img src={logoacademy} alt="L2F Academy" className={styles.acadLogo} />
                    <div>
                        <span className={styles.eyebrow}>L2F Academy</span>
                        <h2 className={styles.dbTitle}>Formazione tecnica che fa la differenza</h2>
                        <p className={styles.dbLead}>
                            La scuola tecnica L2F: corsi pratici e ad alto impatto per trasformare
                            le competenze dell'officina in margine e fiducia dei clienti.
                        </p>
                    </div>
                </div>

                <div className={styles.acadStrip}>
                    {ACADEMY_POINTS.map((c, idx) => {
                        const I = c.icon;
                        return (
                            <div key={c.title} className={styles.acadPoint}>
                                <span className={styles.acadPointNum}>{String(idx + 1).padStart(2, '0')}</span>
                                <span className={styles.acadPointIcon}><I size={20} aria-hidden="true" /></span>
                                <h3 className={styles.acadPointTitle}>{c.title}</h3>
                                <p className={styles.acadPointDesc}>{c.desc}</p>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.acadNote}>
                    <CalendarDays size={18} aria-hidden="true" />
                    <span>Le date dei corsi in programma e l'iscrizione sono nella tua area riservata.</span>
                    <Link to="/corsi" className={styles.acadNoteLink}>
                        Vai ai corsi <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

const MarketingShowcase = () => {
    const reduce = useReducedMotion();
    return (
        <section className={styles.mktSection}>
            <div className="container">
                <div className={styles.dbHead}>
                    <span className={styles.eyebrow}>L2F Marketing</span>
                    <h2 className={styles.dbTitle}>Marketing su misura per l'officina</h2>
                    <p className={styles.dbLead}>
                        Una divisione di comunicazione dedicata: dal nome e dal logo all'insegna,
                        fino a sito, social e campagne sponsorizzate. Per farti conoscere e diventare
                        un punto di riferimento per gli automobilisti.
                    </p>
                </div>

                <div className={styles.pillars}>
                    {MKT_CAPS.map((c) => {
                        const I = c.icon;
                        return (
                            <div key={c.title} className={styles.pillar}>
                                <span className={styles.pillarIcon}><I size={22} aria-hidden="true" /></span>
                                <h3 className={styles.pillarTitle}>{c.title}</h3>
                                <p className={styles.pillarDesc}>{c.desc}</p>
                            </div>
                        );
                    })}
                </div>

                <span className={styles.mktLabel}>Alcuni lavori social per le officine partner</span>
                <div className={styles.mktGallery}>
                    {MKT_SOCIAL.map((s, i) => (
                        <motion.div
                            key={s}
                            className={styles.mktPost}
                            initial={reduce ? false : { opacity: 0, y: 18 }}
                            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-8%' }}
                            transition={{ duration: 0.45, delay: (i % 6) * 0.06 }}
                        >
                            <img src={`/marketing/${s}.webp`} alt="Lavoro social L2F Marketing" loading="lazy" decoding="async" />
                        </motion.div>
                    ))}
                </div>

                <span className={styles.mktLabel}>Campagne reali · budget basso, grande resa · officine riservate</span>
                <div className={styles.mktCases}>
                    {MKT_CASES.map((c) => (
                        <div key={c.name} className={styles.caseCard}>
                            <div className={styles.caseTop}>
                                <span className={styles.caseName}>{c.name}</span>
                                <span className={styles.caseBudget}>{c.budget} · ~€3/g</span>
                            </div>
                            <div className={styles.caseMetrics}>
                                <div className={styles.caseMetric}><span className={styles.caseVal}>{c.cop}</span><span className={styles.caseLbl}>Copertura</span></div>
                                <div className={styles.caseMetric}><span className={styles.caseVal}>{c.imp}</span><span className={styles.caseLbl}>Impression</span></div>
                                <div className={styles.caseMetric}><span className={styles.caseVal}>{c.az}</span><span className={styles.caseLbl}>Azioni</span></div>
                                <div className={styles.caseMetric}><span className={styles.caseVal}>{c.clic}</span><span className={styles.caseLbl}>Clic</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ---------- Barra a scorrimento: la forza del gruppo ---------- */
const STRENGTHS = ['Dal 1992', '5 sedi in Italia', '65.000 prodotti', '4.500 m² di magazzino', '3.000 clienti', 'Consegna in giornata', 'Reso a vista', 'Cashback fino al 5%'];

const PartnerMarquee = () => {
    const list = [...STRENGTHS, ...STRENGTHS];
    return (
        <section className={styles.marqueeSection}>
            <div className="container">
                <span className={styles.marqueeKicker}>La forza del gruppo dietro la tua officina</span>
            </div>
            <div className={styles.marquee}>
                <div className={styles.marqueeTrack}>
                    {list.map((n, i) => (
                        <span className={styles.marqueeItem} key={i}>
                            <span className={styles.marqueeDot} aria-hidden="true" />{n}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ---------- Kit benvenuto: insegna in officina, abbigliamento, poster ---------- */
const KIT_PIECES = [
    { src: 'abbigliamento', label: 'Abbigliamento officina' },
    { src: 'quadro-pastiglie', label: 'Poster Pastiglie' },
    { src: 'quadro-batterie', label: 'Poster Batterie' },
    { src: 'quadro-oli', label: 'Poster Lubrificanti' },
];

const KitBenvenuto = () => {
    const reduce = useReducedMotion();
    const reveal = (delay = 0) => ({
        initial: reduce ? false : { opacity: 0, y: 20 },
        whileInView: reduce ? undefined : { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-8%' },
        transition: { duration: 0.5, delay },
    });
    return (
        <section className={styles.kitSection}>
            <div className="container">
                <div className={styles.dbHead}>
                    <span className={styles.eyebrow}>Kit benvenuto</span>
                    <h2 className={styles.dbTitle}>L'officina si veste L2F</h2>
                    <p className={styles.dbLead}>
                        Con il pacchetto HOME ricevi il kit immagine completo: insegna espositiva,
                        poster, abbigliamento brandizzato e cancelleria. La tua officina entra nel
                        mondo L2F dal primo giorno.
                    </p>
                </div>

                <div className={styles.kitFeature}>
                    <motion.figure className={styles.kitBig} {...reveal()}>
                        <img src="/kit/insegna.webp" alt="Insegna espositiva L2F Service Partner" loading="lazy" decoding="async" />
                        <figcaption className={styles.kitCap}>Insegna espositiva «L2F Service Partner» per l'esterno</figcaption>
                    </motion.figure>

                    <div className={styles.kitSide}>
                        <motion.div className={styles.kitAbb} {...reveal(0.1)}>
                            <img src="/kit/abbigliamento.webp" alt="Abbigliamento L2F per officina" loading="lazy" decoding="async" />
                            <span className={styles.kitAbbLabel}>Abbigliamento brandizzato · uomo e donna</span>
                        </motion.div>
                        <motion.ul className={styles.kitList} {...reveal(0.18)}>
                            <li><Check size={16} aria-hidden="true" /> Insegna espositiva per l'esterno</li>
                            <li><Check size={16} aria-hidden="true" /> 3 poster da appendere in officina</li>
                            <li><Check size={16} aria-hidden="true" /> Abbigliamento uomo e donna</li>
                            <li><Check size={16} aria-hidden="true" /> Biglietti da visita e cancelleria</li>
                        </motion.ul>
                    </div>
                </div>

                <span className={styles.mktLabel}>I 3 poster del kit</span>
                <div className={styles.kitPosters}>
                    {KIT_PIECES.filter((p) => p.src !== 'abbigliamento').map((p, i) => (
                        <motion.div key={p.src} className={styles.kitCard} {...reveal(i * 0.08)}>
                            <img src={`/kit/${p.src}.webp`} alt={p.label} loading="lazy" decoding="async" />
                            <span className={styles.kitLabel}>{p.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const Servizi = () => {
    return (
        <main className={styles.page}>
            <ServiziHero />
            <Pillars />
            <PartnerMarquee />
            <BancaDati />
            <AcademySection />
            <MarketingShowcase />
            <KitBenvenuto />
            <PricingPackages />
            <div className="container">
                <div className={styles.footerCta}>
                    <div>
                        <h2 className={styles.ctaTitle}>Pronto a entrare nel network?</h2>
                        <p className={styles.ctaText}>Richiedi l’attivazione: ti ricontatta il tuo consulente L2F.</p>
                    </div>
                    <div className={styles.ctaActions}>
                        <AccessCta />
                        <Link to="/contatti" className={styles.ctaSecondary}>Contattaci</Link>
                    </div>
                </div>
            </div>
        </main>
    );
};
