import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className="container">

                {/* Pre-footer CTA */}
                <div className={styles.ctaBox}>
                    <div>
                        <div className={styles.ctaText}>Pronto a scalare il tuo business?</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Unisciti a oltre 3.000 officine e ricambisti.</div>
                    </div>
                    <button className={styles.ctaButton}>Richiedi Accesso</button>
                </div>

                <div style={{ height: '60px' }} />

                <div className={styles.grid}>
                    <div className={styles.brandColumn}>
                        <Link to="/" className={styles.logo}>L2F</Link>
                        <p className={styles.description}>
                            La piattaforma B2B leader per autoricambi premium. Tecnologia avanzata e logistica di precisione al servizio dell'automotive.
                        </p>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Piattaforma</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/catalogo" className={styles.link}>Catalogo</Link></li>
                            <li><Link to="/servizi" className={styles.link}>Servizi</Link></li>
                            <li><Link to="/integrazioni" className={styles.link}>API & Integrazioni</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Azienda</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/chi-siamo" className={styles.link}>Chi Siamo</Link></li>
                            <li><Link to="/contatti" className={styles.link}>Contatti</Link></li>
                            <li><Link to="/carriere" className={styles.link}>Lavora con noi</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Supporto</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/faq" className={styles.link}>Centro Assistenza</Link></li>
                            <li><Link to="/condizioni" className={styles.link}>Condizioni di Vendita</Link></li>
                            <li><Link to="/privacy" className={styles.link}>Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div>&copy; {new Date().getFullYear()} L2F S.r.l. Tutti i diritti riservati. P.IVA 12345678901</div>
                    <div className={styles.legalLinks}>
                        <Link to="/privacy" className={styles.link}>Privacy</Link>
                        <Link to="/cookies" className={styles.link}>Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
