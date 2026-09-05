import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, ArrowUpRight } from 'lucide-react';
import styles from './styles.module.css';
import { supabase } from '../../../lib/supabase';
import { accessRequestMailto, planChangeMailto } from '../../../lib/contact';
import { useAuth } from '../../../lib/auth';
import logoservice from '../../../assets/logoservice.png';

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PackageOption {
    id: string;
    name: string;
    price: number;
    subtitle?: string;
    features: PricingFeature[];
    isRecommended?: boolean;
    isTopTier?: boolean;
    /* Il gradino, non il prezzo: Flex Tech e Flex Marketing costano diverso
       ma sono la stessa cosa — Home più UN servizio — e passare dall'uno
       all'altro non è salire né scendere. Con l'ordine dedotto dal prezzo,
       poi, basterebbe un prezzo scritto storto per rovesciare tutto. */
    livello: number;
}

/* Dati di riserva: il sito mostra sempre i prezzi, anche se il database
   non risponde. Supabase, quando disponibile, li sovrascrive — ed è il
   motivo per cui questi numeri vanno tenuti allineati a `packages`: se i
   due non concordano, quello che si legge in pagina è sempre l'altro, e
   chi corregge qui non vede cambiare niente.
   Listino: HOME 590 · Tech 890 · Marketing 1.350 · All Included 1.650. */
const FALLBACK_PACKAGES: PackageOption[] = [
    {
        id: 'home',
        name: 'Pacchetto HOME',
        price: 590,
        livello: 0,
        features: [
            { text: 'Kit benvenuto (Insegna, Abbigliamento, Cancelleria)', included: true },
            { text: '1 corso di formazione annuale', included: true },
            { text: 'Resi a vista', included: true },
            { text: 'Accesso Cashback 3%', included: true },
        ],
    },
    {
        id: 'marketing',
        name: 'Flex Marketing',
        price: 1350,
        livello: 1,
        subtitle: 'Home + Digital',
        isRecommended: true,
        features: [
            { text: 'Tutti i servizi Home', included: true },
            { text: 'Marketing personalizzato', included: true },
            { text: 'Social Media (FB/IG)', included: true },
            { text: 'Campagne sponsorizzate', included: true },
            { text: 'Cashback aumentato al 5%', included: true },
        ],
    },
    {
        id: 'tech',
        name: 'Flex Tech',
        price: 890,
        livello: 1,
        subtitle: 'Home + Banca Dati',
        features: [
            { text: 'Tutti i servizi Home', included: true },
            { text: 'L2F Tech: Banca dati Tecnica', included: true },
            { text: 'Cashback aumentato al 5%', included: true },
        ],
    },
    {
        id: 'all',
        name: 'Flex All Included',
        price: 1650,
        livello: 2,
        subtitle: 'Pacchetto Completo',
        isTopTier: true,
        features: [
            { text: 'Tutti i servizi Home', included: true },
            { text: 'L2F Tech: Banca dati Tecnica', included: true },
            { text: 'Marketing & Social completo', included: true },
            { text: 'Cashback aumentato al 5%', included: true },
        ],
    },
];

const formatPrice = (price: number) => price.toLocaleString('it-IT');

export const PricingPackages = () => {
    const { officina, isActive } = useAuth();
    // 'home' | 'tech' | 'marketing' | 'all' | 'flex' (storico) | null
    const currentPlan = isActive ? (officina?.pacchetto ?? null) : null;
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [packages, setPackages] = useState<PackageOption[]>(FALLBACK_PACKAGES);
    /* La spunta: chiedere un cambio di pacchetto è una cosa che si fa
       apposta, non premendo un pulsante che capita sotto il dito. */
    const [confermato, setConfermato] = useState(false);
    const [invio, setInvio] = useState<'fermo' | 'mando' | 'fatto'>('fermo');
    const [erroreInvio, setErroreInvio] = useState<string | null>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Cambiando pacchetto la conferma ricomincia da capo: una spunta messa
    // per HOME non può valere per All Included.
    useEffect(() => {
        setConfermato(false);
        setInvio('fermo');
        setErroreInvio(null);
    }, [selectedPackage]);

    // Porta la CTA in vista quando si seleziona un pacchetto
    useEffect(() => {
        if (selectedPackage) {
            const id = window.setTimeout(() => {
                ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 150);
            return () => window.clearTimeout(id);
        }
    }, [selectedPackage]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: dbPackages, error: packagesError } = await supabase
                    .from('packages')
                    .select('*');

                if (packagesError) throw packagesError;
                if (!dbPackages || dbPackages.length === 0) return;

                const { data: features, error: featuresError } = await supabase
                    .from('package_features')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (featuresError) throw featuresError;

                const featuresByPackage = (features ?? []).reduce((acc, feature) => {
                    if (!acc[feature.package_id]) acc[feature.package_id] = [];
                    acc[feature.package_id].push({
                        text: feature.text,
                        included: feature.included
                    });
                    return acc;
                }, {} as Record<string, PricingFeature[]>);

                setPackages(dbPackages.map(pkg => ({
                    id: pkg.id,
                    name: pkg.name,
                    price: Number(pkg.price),
                    subtitle: pkg.subtitle,
                    isRecommended: pkg.is_recommended,
                    isTopTier: pkg.is_top_tier,
                    // Il database è nato senza livello: se manca, primo gradino.
                    livello: pkg.livello == null ? 1 : Number(pkg.livello),
                    features: featuresByPackage[pkg.id] || []
                })));
            } catch (error) {
                // Il fallback statico resta in pagina: nessun impatto per l'utente.
                console.error('Pricing: dati Supabase non disponibili, uso il fallback statico.', error);
            }
        };

        fetchData();
    }, []);

    const homePackage = packages.find(p => p.id === 'home') ?? null;
    const flexOptions = packages
        .filter(p => p.id !== 'home')
        .sort((a, b) => a.price - b.price);

    const handleSelect = (id: string) => {
        setSelectedPackage(prev => (prev === id ? null : id));
    };

    const cardKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(id);
        }
    };

    /* Il gradino di adesso. `flex` è il valore storico di chi era «flex»
       quando i pacchetti Flex erano uno solo: vale come primo gradino. */
    const livelloAttuale: number | null = (() => {
        if (!currentPlan) return null;
        if (currentPlan === 'flex') return 1;
        const p = packages.find(x => x.id === currentPlan);
        return p ? p.livello : null;
    })();

    type Genere = 'attivazione' | 'upgrade' | 'downgrade' | 'cambio' | 'attuale';
    const genereDi = (pkg: PackageOption): Genere => {
        if (livelloAttuale === null) return 'attivazione';
        if (pkg.id === currentPlan) return 'attuale';
        if (pkg.livello > livelloAttuale) return 'upgrade';
        if (pkg.livello < livelloAttuale) return 'downgrade';
        return 'cambio';
    };

    /* Grigio = non è una salita. Grigio, non disattivato: ci si può ancora
       cliccare sopra, ed è il modo in cui si arriva al pulsante di
       retrocessione. Un pacchetto che non si può nemmeno guardare non
       spiega perché. */
    const eSpento = (pkg: PackageOption) => {
        const g = genereDi(pkg);
        return g === 'downgrade' || g === 'cambio' || g === 'attuale';
    };

    const VERBO: Record<Genere, string> = {
        attivazione: 'Richiedi attivazione',
        upgrade: 'Richiedi upgrade',
        downgrade: 'Richiedi la retrocessione',
        cambio: 'Richiedi il cambio pacchetto',
        attuale: 'È il tuo pacchetto di adesso',
    };

    const scelto = packages.find(p => p.id === selectedPackage) ?? null;
    const genereScelto: Genere | null = scelto ? genereDi(scelto) : null;

    const handleProceed = async () => {
        if (!scelto || !genereScelto || genereScelto === 'attuale') return;

        /* Chi non ha ancora un accesso non ha un'officina a cui agganciare
           la richiesta: per lui resta la posta, che è l'unico canale che
           abbiamo prima di conoscerlo. */
        if (!isActive) {
            window.location.href = accessRequestMailto(scelto.name);
            return;
        }

        setInvio('mando');
        setErroreInvio(null);
        try {
            const { data, error } = await supabase.functions.invoke('richiesta-piano', {
                body: { pacchetto: scelto.id },
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            setInvio('fatto');
        } catch (e) {
            setInvio('fermo');
            /* Se la funzione non risponde resta la posta: meglio un
               programma di posta che si apre di una richiesta persa. */
            setErroreInvio(
                (e as Error)?.message
                || 'Non siamo riusciti a mandare la richiesta. Riprova, oppure scrivici.'
            );
        }
    };

    /** La via di riserva, se l'invio dal sito non riesce. */
    const perPosta = () => {
        if (!scelto) return;
        window.location.href = livelloAttuale === null
            ? accessRequestMailto(scelto.name)
            : planChangeMailto({
                officina: officina?.ragione_sociale,
                current: packages.find(p => p.id === currentPlan)?.name ?? currentPlan,
                requested: scelto.name,
                kind: genereScelto === 'upgrade' ? 'upgrade'
                    : genereScelto === 'downgrade' ? 'downgrade' : 'cambio',
            });
    };

    const getCardState = (id: string) => {
        const pkg = packages.find(p => p.id === id);
        if (selectedPackage === id) return 'selected';
        if (selectedPackage) return 'dimmed';
        return pkg && eSpento(pkg) ? 'spento' : 'idle';
    };

    const cardVariants = {
        idle: { scale: 1, opacity: 1 },
        selected: { scale: 1.04, opacity: 1, zIndex: 10 },
        dimmed: { scale: 0.97, opacity: 0.55, zIndex: 0 },
        // Non è spento del tutto: si legge ancora, e si può aprire.
        spento: { scale: 1, opacity: 0.45, zIndex: 0 },
    };

    return (
        <section className={styles.pricingSection} id="piani">
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ marginBottom: '1rem' }}
                    >
                        <img src={logoservice} alt="L2F Service" style={{ height: '60px' }} />
                    </motion.div>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Scegli il tuo piano
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Seleziona un pacchetto e richiedi l'attivazione: ti ricontatta
                        direttamente il tuo consulente L2F.
                    </motion.p>
                </div>

                <div className={styles.layout}>
                    {/* HOME PACKAGE */}
                    {homePackage && (
                        <motion.div
                            className={`${styles.card} ${styles.homeCard} ${selectedPackage === 'home' ? styles.cardSelected : styles.cardInteractive}`}
                            variants={cardVariants}
                            animate={getCardState('home')}
                            onClick={() => handleSelect('home')}
                            onKeyDown={(e) => cardKeyDown(e, 'home')}
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedPackage === 'home'}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className={styles.glowEffect} />
                            <h3 className={styles.packageName}>{homePackage.name}</h3>
                            <div className={styles.price}>
                                {formatPrice(homePackage.price)}<span className={styles.currency}>€</span>
                                <span className={styles.vat}>+ IVA/anno</span>
                            </div>

                            <ul className={styles.featuresList}>
                                {homePackage.features.map((feat, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <Check size={18} className={styles.checkIcon} aria-hidden="true" />
                                        <span>{feat.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* ARROW / CONNECTOR (Desktop only visual, fades out on selection) */}
                    <motion.div
                        className={styles.upgradeArrow}
                        animate={{ opacity: selectedPackage ? 0 : 1 }}
                        aria-hidden="true"
                    >
                        <ArrowRight size={32} />
                    </motion.div>

                    {/* FLEX PACKAGES */}
                    <div className={styles.flexWrapper}>
                        <motion.div
                            className={styles.flexHeader}
                            animate={{ opacity: selectedPackage ? 0 : 1 }}
                        >
                            <Zap className={styles.checkIcon} size={28} aria-hidden="true" />
                            <div>
                                <h3 className={styles.flexTitle}>Passa a FLEX</h3>
                                <div className={styles.flexSubtitle}>Potenzia la tua officina</div>
                            </div>
                        </motion.div>

                        <div className={styles.flexOptionsGrid}>
                            {flexOptions.map((option) => (
                                <motion.div
                                    key={option.id}
                                    className={`${styles.flexOptionCard} ${option.isTopTier ? styles.topTierCard : ''} ${selectedPackage === option.id ? styles.cardSelected : styles.cardInteractive}`}
                                    variants={cardVariants}
                                    animate={getCardState(option.id)}
                                    onClick={() => handleSelect(option.id)}
                                    onKeyDown={(e) => cardKeyDown(e, option.id)}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={selectedPackage === option.id}
                                >
                                    {/* Con un pacchetto già attivo «consigliato» non
                                        vuol dire più niente: quello che serve sapere
                                        è se questo è il proprio, una salita o una
                                        discesa. */}
                                    {livelloAttuale === null
                                        ? option.isRecommended && (
                                            <div className={styles.recommendedBadge}>CONSIGLIATO</div>
                                        )
                                        : genereDi(option) === 'attuale' ? (
                                            <div className={styles.recommendedBadge}>IL TUO</div>
                                        ) : genereDi(option) === 'upgrade' ? (
                                            <div className={styles.recommendedBadge}>UPGRADE</div>
                                        ) : null}

                                    <h4 className={styles.packageName} style={{ fontSize: '1.2rem' }}>{option.name}</h4>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{option.subtitle}</div>

                                    <div className={styles.price} style={{ fontSize: '2rem' }}>
                                        {formatPrice(option.price)}<span className={styles.currency}>€</span>
                                    </div>
                                    <span className={styles.vat} style={{ marginBottom: '1.5rem', display: 'block' }}>+ IVA/anno</span>

                                    <ul className={styles.featuresList}>
                                        {option.features.map((feat, i) => (
                                            <li key={i} className={styles.featureItem}>
                                                <Check size={16} className={styles.checkIcon} aria-hidden="true" />
                                                <span style={{ fontSize: '0.9rem' }}>{feat.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedPackage && (
                        <motion.div
                            ref={ctaRef}
                            className={styles.ctaContainer}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            {invio === 'fatto' ? (
                                <div className={styles.esitoRichiesta}>
                                    <Check size={22} aria-hidden="true" />
                                    <div>
                                        <b>Richiesta arrivata.</b>
                                        <span>Ti richiama il tuo consulente L2F. Il pacchetto non è cambiato: si cambia dopo che avete parlato.</span>
                                    </div>
                                </div>
                            ) : genereScelto === 'attuale' ? (
                                <div className={styles.notaPiano}>{VERBO.attuale}</div>
                            ) : (
                                <div className={styles.confermaBlocco}>
                                    {genereScelto === 'downgrade' && (
                                        <p className={styles.notaPiano}>
                                            {scelto?.name} è <b>meno completo</b> di quello che hai adesso.
                                            Si può chiedere lo stesso: ne parlate e decidete insieme.
                                        </p>
                                    )}
                                    <label className={styles.conferma}>
                                        <input type="checkbox" checked={confermato}
                                            onChange={(e) => setConfermato(e.target.checked)} />
                                        <span>
                                            {genereScelto === 'attivazione'
                                                ? `Vuoi richiedere l'attivazione di ${scelto?.name}?`
                                                : `Vuoi richiedere il cambio piano verso ${scelto?.name}?`}
                                        </span>
                                    </label>

                                    {erroreInvio && (
                                        <p className={styles.erroreRichiesta}>
                                            {erroreInvio}{' '}
                                            <button type="button" className={styles.perPosta} onClick={perPosta}>
                                                mandala per email
                                            </button>
                                        </p>
                                    )}

                                    <button className={styles.ctaButton} onClick={handleProceed}
                                        disabled={!confermato || invio === 'mando'}>
                                        {invio === 'mando'
                                            ? 'Mando…'
                                            : VERBO[genereScelto ?? 'attivazione']}
                                        {invio !== 'mando' && <ArrowUpRight size={20} aria-hidden="true" />}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
