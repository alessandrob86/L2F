import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';

const navItems = [
    { name: 'Catalogo', path: '/catalogo' },
    { name: 'Servizi', path: '/servizi' },
    { name: 'Chi Siamo', path: '/chi-siamo' },
    { name: 'Contatti', path: '/contatti' },
];

export const Navbar = () => {
    const location = useLocation();

    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logo}>
                <img src={logo} alt="L2F Logo" style={{ height: '40px' }} />
            </Link>


            <div className={styles.navLinks}>
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} className={styles.link}>
                        {item.name}
                        {location.pathname === item.path && (
                            <motion.div
                                className={styles.activeLine}
                                layoutId="navbar-active"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            />
                        )}
                        {/* Hover effect could also use layoutId if we want it to move between items */}
                    </Link>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link to="/accedi" className={styles.link} style={{ marginRight: '8px' }}>
                    Area Clienti
                </Link>
                <motion.button
                    className={styles.ctaButton}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Richiedi Accesso
                </motion.button>
            </div>
        </nav>
    );
};
