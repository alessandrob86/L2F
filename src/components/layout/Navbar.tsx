import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, UserCircle2, ShoppingCart } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';
import { accessRequestMailto } from '../../lib/contact';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';

const navItems = [
    { name: 'Catalogo', path: '/catalogo' },
    { name: 'Servizi', path: '/servizi' },
    { name: 'Chi Siamo', path: '/chi-siamo' },
    { name: 'Contatti', path: '/contatti' },
];

export const Navbar = () => {
    const location = useLocation();
    const { session, officina, isAdmin } = useAuth();
    const { count, open } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    const accountLabel = session
        ? (officina?.ragione_sociale
            ? (officina.ragione_sociale.length > 18 ? officina.ragione_sociale.slice(0, 18) + '…' : officina.ragione_sociale)
            : 'Il mio account')
        : 'Area Clienti';

    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logo}>
                <img src={logo} alt="L2F Automotive" style={{ height: '40px' }} />
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
                    </Link>
                ))}
                {isAdmin && <Link to="/admin" className={styles.link}>Admin</Link>}
            </div>

            <div className={styles.actions}>
                <Link to={session ? '/area-clienti' : '/accedi'} className={`${styles.link} ${styles.areaClienti}`}>
                    {session && <UserCircle2 size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} />}
                    {accountLabel}
                </Link>

                <button type="button" className={styles.cartBtn} onClick={open} aria-label={`Carrello (${count})`}>
                    <ShoppingCart size={20} />
                    {count > 0 && <span className={styles.cartBadge}>{count}</span>}
                </button>
                {!session && (
                    <motion.a
                        href={accessRequestMailto()}
                        className={styles.ctaButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Richiedi Accesso
                    </motion.a>
                )}
                <button
                    className={styles.menuToggle}
                    onClick={() => setMenuOpen(open => !open)}
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {navItems.map((item) => (
                            <Link key={item.path} to={item.path} className={styles.mobileLink} onClick={closeMenu}>
                                {item.name}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link to="/admin" className={styles.mobileLink} onClick={closeMenu}>Admin</Link>
                        )}
                        <Link to={session ? '/area-clienti' : '/accedi'} className={styles.mobileLink} onClick={closeMenu}>
                            {accountLabel}
                        </Link>
                        {!session && (
                            <a href={accessRequestMailto()} className={styles.mobileCta} onClick={closeMenu}>
                                Richiedi Accesso
                            </a>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
