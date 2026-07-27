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
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';
import UploadLanding from './pages/UploadLanding';
import SeoLandingPage from './pages/SeoLandingPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
        <Navbar />
        
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadLanding />} />
            <Route path="/features" element={<Features />} />
            <Route path="/security" element={<Security />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* High-intent Organic Search Landing Pages */}
            <Route path="/share-pdf-online" element={<SeoLandingPage pageSlug="share-pdf-online" />} />
            <Route path="/share-images-securely" element={<SeoLandingPage pageSlug="share-images-securely" />} />
            <Route path="/share-zip-files" element={<SeoLandingPage pageSlug="share-zip-files" />} />
            <Route path="/share-videos-online" element={<SeoLandingPage pageSlug="share-videos-online" />} />
            <Route path="/password-protected-file-sharing" element={<SeoLandingPage pageSlug="password-protected-file-sharing" />} />

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
