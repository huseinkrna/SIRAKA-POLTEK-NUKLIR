import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext'; // IMPORT INI
import Home from './pages/Home';
import HistoryTour from './pages/HistoryTour';
import Simulator from './pages/Simulator';

function App() {
  return (
    <LanguageProvider> {/* BUNGKUS DI SINI */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tour" element={<HistoryTour />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;