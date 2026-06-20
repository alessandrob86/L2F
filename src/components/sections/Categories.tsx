import styles from './Categories.module.css';
import logoparts from '../../assets/logoparts.png';
import { CategoryGallery } from './CategoryGallery';

export const Categories = () => {
    return (
        <section className={styles.categoriesSection}>
            <div className="container">
                <div className={styles.header}>
                    <div style={{ marginBottom: '1rem' }}>
                        <img src={logoparts} alt="L2F Parts" style={{ height: '50px' }} />
                    </div>
                    <h2 className={styles.sectionTitle}>La gamma private label</h2>
                    <p className={styles.sectionSubtitle}>
                        Componentistica selezionata, spesso Made in Italy o Made in Germany:
                        affidabilità tecnica e margine reale per l'officina.
                    </p>
                </div>

                <CategoryGallery />
            </div>
        </section>
    );
};
