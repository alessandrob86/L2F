import { useEffect } from 'react';
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

import { PlaceholderPage } from './pages/PlaceholderPage';
import { ResiAVista } from './pages/ResiAVista';
import { Catalogo } from './pages/Catalogo';
import { ProductDetail } from './pages/ProductDetail';
import { Servizi } from './pages/Servizi';
import { ChiSiamo } from './pages/ChiSiamo';
import { Contatti } from './pages/Contatti';
import { Accedi } from './pages/Accedi';
import { AreaClienti } from './pages/AreaClienti';
import { Admin } from './pages/Admin';
import { Corsi } from './pages/Corsi';
import { Privacy } from './pages/Privacy';
import { CookiePolicy } from './pages/CookiePolicy';

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
