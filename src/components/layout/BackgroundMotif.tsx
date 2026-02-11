import styles from './BackgroundMotif.module.css';

export const BackgroundMotif = () => {
    return (
        <div className={styles.backgroundContainer}>
            <div className={styles.gridOverlay} />
            <div className={styles.noiseOverlay} />
            <div className={styles.vignette} />
        </div>
    );
};
