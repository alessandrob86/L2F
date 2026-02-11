import { motion, useMotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import styles from './Categories.module.css';
import logoparts from '../../assets/logoparts.png';

const categories = [
    { name: 'Freni', count: '12.4k articoli', size: 'large' }, // 2x2
    { name: 'Filtri', count: '8.2k articoli', size: 'normal' },
    { name: 'Sospensioni', count: '5.1k articoli', size: 'normal' },
    { name: 'Batterie', count: '1.2k articoli', size: 'wide' }, // 2x1
    { name: 'Lubrificanti', count: '3.4k articoli', size: 'normal' },
    { name: 'Elettrico', count: '9.8k articoli', size: 'tall' }, // 1x2
    { name: 'Trasmissione', count: '4.5k articoli', size: 'wide' },
    { name: 'Attrezzatura', count: '850 articoli', size: 'normal' }
];

export const Categories = () => {

    return (
        <section className={styles.categoriesSection}>
            <div className="container">
                <div className={styles.header}>
                    <div style={{ marginBottom: '1rem' }}>
                        <img src={logoparts} alt="Parts Logo" style={{ height: '50px' }} />
                    </div>
                    <h2 className={styles.sectionTitle}>Catalogo Completo</h2>
                </div>

                <div className={styles.bentoGrid}>
                    {categories.map((cat, i) => (
                        <BentoCard key={i} category={cat} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const BentoCard = ({ category, index }: { category: any, index: number }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // Map size prop to class
    const sizeClass = styles[category.size] || '';

    return (
        <motion.div
            className={`${styles.bentoCard} ${sizeClass}`}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
        >
            <motion.div
                className={styles.cursorHighlight}
                style={{ left: mouseX, top: mouseY }}
            />

            <div className={styles.cardContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h3 className={styles.categoryName}>{category.name}</h3>
                        <span className={styles.itemCount}>{category.count}</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                    >
                        <ArrowUpRight size={20} color="var(--accent-primary)" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
