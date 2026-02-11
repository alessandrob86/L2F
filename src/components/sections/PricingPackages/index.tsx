import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { supabase } from '../../../lib/supabase';
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

export const PricingPackages = () => {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [homePackage, setHomePackage] = useState<PackageOption | null>(null);
    const [flexOptions, setFlexOptions] = useState<PackageOption[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: packages, error: packagesError } = await supabase
                    .from('packages')
                    .select('*');

                if (packagesError) throw packagesError;

                const { data: features, error: featuresError } = await supabase
                    .from('package_features')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (featuresError) throw featuresError;

                const featuresByPackage = features.reduce((acc, feature) => {
                    if (!acc[feature.package_id]) acc[feature.package_id] = [];
                    acc[feature.package_id].push({
                        text: feature.text,
                        included: feature.included
                    });
                    return acc;
                }, {} as Record<string, PricingFeature[]>);

                const processedPackages = packages.map(pkg => ({
                    id: pkg.id,
                    name: pkg.name,
                    price: pkg.price,
                    subtitle: pkg.subtitle,
                    isRecommended: pkg.is_recommended,
                    isTopTier: pkg.is_top_tier,
                    features: featuresByPackage[pkg.id] || []
                }));

                const home = processedPackages.find(p => p.id === 'home');
                const flex = processedPackages.filter(p => p.id !== 'home');

                // Sort flex options explicitly/manually based on known IDs if needed, or trust DB order if sort column existed
                // For now, let's sort 'tech', 'marketing', 'all' based on price
                flex.sort((a, b) => a.price - b.price);

                if (home) setHomePackage(home);
                setFlexOptions(flex);
            } catch (error) {
                console.error('Error fetching pricing data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelect = (id: string) => {
        if (selectedPackage === id) {
            setSelectedPackage(null); // Deselect if clicking expected
        } else {
            setSelectedPackage(id);
        }
    };

    const handleProceed = () => {
        if (!selectedPackage) return;
        // Map selection to placeholder links as requested
        const targetHash = selectedPackage === 'home' ? '#home' : `#${selectedPackage}`;
        navigate(`/servizi${targetHash}`);
    };

    const getCardState = (id: string) => {
        if (!selectedPackage) return 'idle';
        return selectedPackage === id ? 'selected' : 'blurred';
    };

    const cardVariants = {
        idle: { scale: 1, opacity: 1, filter: 'blur(0px)' },
        selected: { scale: 1.05, opacity: 1, filter: 'blur(0px)', zIndex: 10 },
        blurred: { scale: 0.95, opacity: 0.5, filter: 'blur(4px)', zIndex: 0 }
    };


    if (loading) return null; // Or a loading spinner

    return (
        <section className={styles.pricingSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ marginBottom: '1rem' }}
                    >
                        <img src={logoservice} alt="Services Logo" style={{ height: '60px' }} />
                    </motion.div>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Scegli il tuo Piano
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Seleziona un pacchetto per scoprire i dettagli e attivare l'offerta.
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
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className={styles.glowEffect} />
                            <h3 className={styles.packageName}>{homePackage.name}</h3>
                            <div className={styles.price}>
                                {homePackage.price}<span className={styles.currency}>€</span>
                                <span className={styles.vat}>+ iva / anno</span>
                            </div>

                            <ul className={styles.featuresList}>
                                {homePackage.features.map((feat, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <Check size={18} className={styles.checkIcon} />
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
                    >
                        <ArrowRight size={32} />
                    </motion.div>

                    {/* FLEX PACKAGES */}
                    <div className={styles.flexWrapper}>
                        <motion.div
                            className={styles.flexHeader}
                            animate={{ opacity: selectedPackage ? 0 : 1 }}
                        >
                            <Zap className={styles.checkIcon} size={28} />
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
                                >
                                    {option.isRecommended && (
                                        <div className={styles.recommendedBadge}>
                                            CONSIGLIATO
                                        </div>
                                    )}

                                    <h4 className={styles.packageName} style={{ fontSize: '1.2rem' }}>{option.name}</h4>
                                    <div style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '1rem' }}>{option.subtitle}</div>

                                    <div className={styles.price} style={{ fontSize: '2rem' }}>
                                        {option.price}<span className={styles.currency}>€</span>
                                    </div>
                                    <span className={styles.vat} style={{ marginBottom: '1.5rem', display: 'block' }}>+ iva / anno</span>

                                    <ul className={styles.featuresList}>
                                        {option.features.map((feat, i) => (
                                            <li key={i} className={styles.featureItem}>
                                                <Check size={16} className={styles.checkIcon} color={'#e63935'} />
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
                            className={styles.ctaContainer}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <button className={styles.ctaButton} onClick={handleProceed}>
                                Attiva Offerta <ArrowUpRight size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};
