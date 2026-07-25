import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UploadHUD from './components/UploadHUD';
import Home from './pages/Home';
import Features from './pages/Features';
import Security from './pages/Security';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import ShareView from './pages/ShareView';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
        <Navbar />
        
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/security" element={<Security />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/share/:id" element={<ShareView />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <UploadHUD />
      </div>
    </BrowserRouter>
  );
}
