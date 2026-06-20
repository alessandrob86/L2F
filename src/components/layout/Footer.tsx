import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { CONTACT, accessRequestMailto } from '../../lib/contact';
import { useAuth } from '../../lib/auth';

export const Footer = () => {
    const { session, isActive } = useAuth();
    return (
        <footer className={styles.footer}>
            <div className="container">

                {/* Pre-footer CTA */}
                <div className={styles.ctaBox}>
                    <div>
                        <div className={styles.ctaText}>
                            {session ? 'La tua officina, sempre rifornita.' : 'Pronto a far crescere la tua officina?'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {session ? 'Sfoglia il catalogo e componi il tuo ordine.' : 'Unisciti a oltre 3.000 officine e ricambisti in tutta Italia.'}
                        </div>
                    </div>
                    {session ? (
                        <Link to={isActive ? '/catalogo' : '/area-clienti'} className={styles.ctaButton}>
                            {isActive ? 'Vai al catalogo' : 'Vai all’area clienti'}
                        </Link>
                    ) : (
                        <a href={accessRequestMailto()} className={styles.ctaButton}>Richiedi Accesso</a>
                    )}
                </div>

                <div style={{ height: '60px' }} />

                <div className={styles.grid}>
                    <div className={styles.brandColumn}>
                        <Link to="/" className={styles.logo}>L2F</Link>
                        <p className={styles.description}>
                            Il partner B2B delle officine: ricambi private label, servizi
                            e cashback in un unico sistema. Una divisione di {CONTACT.company}.
                        </p>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Esplora</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/catalogo" className={styles.link}>Catalogo</Link></li>
                            <li><Link to="/servizi" className={styles.link}>Servizi</Link></li>
                            <li><Link to="/chi-siamo" className={styles.link}>Chi Siamo</Link></li>
                        </ul>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Contatti</h4>
                        <ul className={styles.linkList}>
                            <li><a href={`mailto:${CONTACT.email}`} className={styles.link}>{CONTACT.email}</a></li>
                            <li><a href={CONTACT.phoneHref} className={styles.link}>{CONTACT.phone}</a></li>
                            <li><a href={CONTACT.youtube} className={styles.link} target="_blank" rel="noopener noreferrer">YouTube — L2F Automotive</a></li>
                        </ul>
                    </div>

                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Informazioni</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/condizioni" className={styles.link}>Resi a Vista — Regolamento</Link></li>
                            <li><Link to="/privacy" className={styles.link}>Privacy Policy</Link></li>
                            <li><Link to="/cookies" className={styles.link}>Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div>
                        &copy; {new Date().getFullYear()} L2F® è un marchio di {CONTACT.company} — {CONTACT.address} · P.IVA {CONTACT.piva}
                    </div>
                </div>
            </div>
        </footer>
    );
};
