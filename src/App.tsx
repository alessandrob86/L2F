import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './lib/auth';
import { CartProvider } from './lib/cart';
import { BackgroundMotif } from './components/layout/BackgroundMotif';
import { CartDrawer } from './components/cart/CartDrawer';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BackToTop } from './components/layout/BackToTop';
import { Home } from './pages/Home';

/* Pagine caricate on-demand: ognuna diventa un chunk separato,
   scaricato solo quando l'utente apre quella rotta. */
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })));
const ResiAVista = lazy(() => import('./pages/ResiAVista').then((m) => ({ default: m.ResiAVista })));
const Catalogo = lazy(() => import('./pages/Catalogo').then((m) => ({ default: m.Catalogo })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Servizi = lazy(() => import('./pages/Servizi').then((m) => ({ default: m.Servizi })));
const ChiSiamo = lazy(() => import('./pages/ChiSiamo').then((m) => ({ default: m.ChiSiamo })));
const Contatti = lazy(() => import('./pages/Contatti').then((m) => ({ default: m.Contatti })));
const Accedi = lazy(() => import('./pages/Accedi').then((m) => ({ default: m.Accedi })));
const AreaClienti = lazy(() => import('./pages/AreaClienti').then((m) => ({ default: m.AreaClienti })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const Corsi = lazy(() => import('./pages/Corsi').then((m) => ({ default: m.Corsi })));
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy').then((m) => ({ default: m.CookiePolicy })));

/* Riporta lo scroll in cima a ogni cambio pagina. */
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

function App() {
    return (
        <MotionConfig reducedMotion="user">
            <AuthProvider>
            <CartProvider>
            <Router>
                <ScrollToTop />
                <div className="app">
                    <BackgroundMotif />
                    <Navbar />
                    <Suspense fallback={<div style={{ minHeight: '70vh' }} aria-busy="true" />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/catalogo" element={<Catalogo />} />
                            <Route path="/catalogo/:codice" element={<ProductDetail />} />
                            <Route path="/servizi" element={<Servizi />} />
                            <Route path="/chi-siamo" element={<ChiSiamo />} />
                            <Route path="/contatti" element={<Contatti />} />
                            <Route path="/accedi" element={<Accedi />} />
                            <Route path="/area-clienti" element={<AreaClienti />} />
                            <Route path="/corsi" element={<Corsi />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/condizioni" element={<ResiAVista />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/cookies" element={<CookiePolicy />} />
                            <Route path="*" element={<PlaceholderPage title="Pagina non trovata" />} />
                        </Routes>
                    </Suspense>
                    <Footer />
                    <BackToTop />
                    <CartDrawer />
                </div>
            </Router>
            </CartProvider>
            </AuthProvider>
        </MotionConfig>
    );
}

export default App;
