import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import WeatherIntelligencePage from './pages/WeatherIntelligencePage';
import MachineryRentalPage from './pages/MachineryRentalPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
          <Route path="/weather-intelligence" element={<WeatherIntelligencePage />} />
          <Route path="/machinery-rental" element={<MachineryRentalPage />} />
          <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
