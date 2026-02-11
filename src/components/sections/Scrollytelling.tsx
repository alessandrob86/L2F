import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, TrendingUp, Coins, RotateCcw, Layers, Rocket, Check, X, AlertCircle } from 'lucide-react';
import styles from './Scrollytelling.module.css';

// --- Mockup Components ---

const CashbackMockup = () => (
    <div style={{ width: '100%', maxWidth: '320px', background: '#12141A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ color: '#9CA3AF', fontSize: '14px' }}>Cashback Maturato</div>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>5% FLEX</div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>€ 500,00</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '24px' }}>su € 10.000 di acquisti</div>

        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: '#10B981', borderRadius: '4px' }}
            />
        </div>
    </div>
);

const ResiMockup = () => (
    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#10B981', borderRadius: '50%', padding: '4px' }}><Check size={16} color="#fff" /></div>
            <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>Reso Ammesso</div>
                <div style={{ fontSize: '12px', color: '#10B981' }}>Difetto in garanzia</div>
            </div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
            <div style={{ background: '#EF4444', borderRadius: '50%', padding: '4px' }}><X size={16} color="#fff" /></div>
            <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>Non Ammesso</div>
                <div style={{ fontSize: '12px', color: '#EF4444' }}>Errore ordinazione</div>
            </div>
        </div>
        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', textAlign: 'center' }}>
            <AlertCircle size={10} style={{ display: 'inline', marginRight: '4px' }} />
            Esclusi: frizioni, iniettori, OEM.
        </div>
    </div>
);

const HomeFlexMockup = () => (
    <div style={{ width: '100%', maxWidth: '300px', background: '#12141A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>HOME</div>
                <div style={{ fontSize: '12px' }}>3%</div>
            </div>
            <div style={{ background: '#3B82F6', padding: '12px', borderRadius: '10px', textAlign: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>FLEX</div>
                <div style={{ fontSize: '12px' }}>5%</div>
            </div>
        </div>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ position: 'absolute', top: '-12px', right: '20%', background: '#F59E0B', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}
        >
            UPGRADE
        </motion.div>
    </div>
);

const BoosterMockup = () => (
    <div style={{ width: '100%', maxWidth: '340px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <Database size={24} color="#3B82F6" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>TechData</div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Banca Dati</div>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <TrendingUp size={24} color="#EC4899" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Marketing</div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Supporto</div>
        </div>
        <div style={{ gridColumn: 'span 2', background: 'linear-gradient(90deg, #3B82F6 0%, #EC4899 100%)', padding: '12px', borderRadius: '8px', textAlign: 'center', marginTop: '4px', opacity: 0.9 }}>
            <div style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>⚡ Combo Consigliata</div>
        </div>
    </div>
);

const steps = [
    {
        id: 1,
        title: 'Cashback che ripaga',
        description: 'Con L2F, gli acquisti generano cashback: 3% con HOME e 5% con FLEX. È un vantaggio concreto legato all’utilizzo, non una promo a tempo.',
        microNote: 'Il cashback è un bonus legato agli acquisti.',
        icon: <Coins size={32} />,
        color: '#10B981',
        mockup: <CashbackMockup />
    },
    {
        id: 2,
        title: 'Reso a Vista',
        description: 'Per le officine L2F in regola, il Reso a Vista consente la presa in carico immediata in filiale degli articoli difettosi, evitando pratiche inutili.',
        microNote: 'Non vale per errori di ordinazione. Esclusi alcuni codici.',
        icon: <RotateCcw size={32} />,
        color: '#EF4444',
        mockup: <ResiMockup />
    },
    {
        id: 3,
        title: 'Crescita Modulare',
        description: 'Si parte da HOME (base) e si passa a FLEX quando aggiungi un servizio. Niente pacchetti confusi: o HOME o FLEX, punto.',
        microNote: 'HOME è la porta d’ingresso; FLEX è la crescita.',
        icon: <Layers size={32} />,
        color: '#3B82F6',
        mockup: <HomeFlexMockup />
    },
    {
        id: 4,
        title: 'Booster Tech & Mkt',
        description: 'Con FLEX puoi aggiungere i booster: TechData (banca dati) e Marketing (supporto personalizzato).',
        microNote: 'La combo più forte per massimizzare il valore.',
        icon: <Rocket size={32} />,
        color: '#7C3AED',
        mockup: <BoosterMockup />
    },
];

export const Scrollytelling = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className={styles.scrollySection} ref={containerRef}>
            <div className="container">
                <div className={styles.stickyContainer}>

                    {/* Narrative Side (Left) */}
                    <div className={styles.narrativeSide}>
                        {/* Progress Line */}
                        <div className={styles.progressContainer}>
                            <motion.div
                                className={styles.progressBar}
                                animate={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            />
                        </div>

                        {steps.map((step, index) => (
                            <Step
                                key={step.id}
                                step={step}
                                index={index}
                                onInView={() => setActiveStep(index)}
                                isActive={activeStep === index}
                            />
                        ))}
                    </div>

                    {/* Visual Side (Right) - Sticky */}
                    <div className={styles.visualSide}>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeStep}
                                className={styles.visualPanel}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div style={{
                                    width: '100%', height: '100%',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '16px',
                                    padding: '32px',
                                    background: `radial-gradient(circle at 50% 0%, ${steps[activeStep].color}15 0%, transparent 60%)`
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        color: steps[activeStep].color, marginBottom: '8px'
                                    }}>
                                        {steps[activeStep].icon}
                                        <span style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {steps[activeStep].title} Mode
                                        </span>
                                    </div>

                                    {/* Rich Mockup Content */}
                                    {steps[activeStep].mockup}

                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

const Step = ({ step, index, onInView, isActive }: { step: any, index: number, onInView: () => void, isActive: boolean }) => {
    return (
        <motion.div
            className={`${styles.stepTrigger} ${isActive ? styles.active : ''}`}
            onViewportEnter={onInView}
            viewport={{ amount: 0.5, margin: "-10% 0px -40% 0px" }}
        >
            <span className={styles.stepCount}>0{index + 1}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            {step.microNote && (
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '8px' }}>
                    {step.microNote}
                </p>
            )}
        </motion.div>
    );
};
