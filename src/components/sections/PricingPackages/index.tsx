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
}

/* Dati di riserva: il sito mostra sempre i prezzi, anche se il database
   non risponde. Supabase, quando disponibile, li sovrascrive. */
const FALLBACK_PACKAGES: PackageOption[] = [
    {
        id: 'home',
        name: 'Pacchetto HOME',
        price: 590,
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
        price: 130,
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
        price: 990,
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
    const currentPlan = isActive ? (officina?.pacchetto ?? null) : null; // 'home' | 'flex' | null
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [packages, setPackages] = useState<PackageOption[]>(FALLBACK_PACKAGES);
    const ctaRef = useRef<HTMLDivElement>(null);

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

    // CTA dinamica: in base al piano attuale dell'officina → attivazione / upgrade / downgrade / cambio.
    const tierOf = (id: string) => (id === 'home' ? 0 : 1);
    const ctaForSelected = (): { label: string; disabled: boolean; go: () => void } | null => {
        const pkg = packages.find(p => p.id === selectedPackage);
        if (!pkg) return null;
        if (!currentPlan) {
            return { label: 'Richiedi attivazione', disabled: false, go: () => { window.location.href = accessRequestMailto(pkg.name); } };
        }
        if (currentPlan === 'home' && pkg.id === 'home') {
            return { label: 'Il tuo piano attuale', disabled: true, go: () => { } };
        }
        const sel = tierOf(pkg.id);
        const cur = currentPlan === 'home' ? 0 : 1;
        const kind: 'upgrade' | 'downgrade' | 'cambio' = sel > cur ? 'upgrade' : sel < cur ? 'downgrade' : 'cambio';
        const verb = kind === 'upgrade' ? 'Richiedi upgrade' : kind === 'downgrade' ? 'Richiedi downgrade' : 'Richiedi cambio piano';
        return {
            label: verb,
            disabled: false,
            go: () => {
                window.location.href = planChangeMailto({
                    officina: officina?.ragione_sociale,
                    current: currentPlan === 'home' ? 'Pacchetto HOME' : 'Flex',
                    requested: pkg.name,
                    kind,
                });
            },
        };
    };
    const handleProceed = () => ctaForSelected()?.go();

    const getCardState = (id: string) => {
        if (!selectedPackage) return 'idle';
        return selectedPackage === id ? 'selected' : 'dimmed';
    };

    const cardVariants = {
        idle: { scale: 1, opacity: 1 },
        selected: { scale: 1.04, opacity: 1, zIndex: 10 },
        dimmed: { scale: 0.97, opacity: 0.55, zIndex: 0 }
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
                                    {option.isRecommended && (
                                        <div className={styles.recommendedBadge}>
                                            CONSIGLIATO
                                        </div>
                                    )}

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
                            {(() => {
                                const cta = ctaForSelected();
                                return (
                                    <button className={styles.ctaButton} onClick={handleProceed} disabled={cta?.disabled}>
                                        {cta?.label ?? 'Richiedi attivazione'}
                                        {!cta?.disabled && <ArrowUpRight size={20} aria-hidden="true" />}
                                    </button>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
