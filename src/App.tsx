import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
// import { BackgroundMotif } from './components/layout/BackgroundMotif';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';

import { PlaceholderPage } from './pages/PlaceholderPage';

function App() {
  return (
    <Router>
      <div className="app">
        <AnimatedBackground />
        {/* <BackgroundMotif /> */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<PlaceholderPage title="Catalogo" />} />
          <Route path="/servizi" element={<PlaceholderPage title="Servizi" />} />
          <Route path="/chi-siamo" element={<PlaceholderPage title="Chi Siamo" />} />
          <Route path="/contatti" element={<PlaceholderPage title="Contatti" />} />
          <Route path="/accedi" element={<PlaceholderPage title="Area Clienti" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
