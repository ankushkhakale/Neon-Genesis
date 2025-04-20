
import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Loader } from '@/components/loader';
import { toast } from '@/hooks/use-toast';

// Lazy load components that are not visible in the initial viewport
const AboutSection = lazy(() => import('@/components/about-section').then(module => ({ default: module.AboutSection })));
const ServicesSection = lazy(() => import('@/components/services-section').then(module => ({ default: module.ServicesSection })));
const PortfolioSection = lazy(() => import('@/components/portfolio-section').then(module => ({ default: module.PortfolioSection })));
const ContactSection = lazy(() => import('@/components/contact-section').then(module => ({ default: module.ContactSection })));
const Footer = lazy(() => import('@/components/footer').then(module => ({ default: module.Footer })));

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Simulate content loading - faster timing for better user experience
    const contentTimer = setTimeout(() => {
      setContentLoaded(true);
    }, 800);
    
    // Simulate loading time with a slightly shorter delay
    const loadingTimer = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Welcome to Neon Genesis",
        description: "Explore our digital realm and discover our projects.",
      });
    }, 2000);

    // Add smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (!element) return;
      
      window.scrollTo({
        top: element.offsetTop - 80, // Offset for fixed header
        behavior: 'smooth'
      });
    };

    document.addEventListener('click', handleAnchorClick);
    
    // Apply glitch effect to text elements
    const glitchElements = document.querySelectorAll('.text-glitch');
    glitchElements.forEach(el => {
      el.setAttribute('data-text', el.textContent || '');
    });
    
    // Preload critical images
    const preloadImages = () => {
      const imageUrls = [
        // Add critical image URLs here if needed
      ];
      
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    preloadImages();
    
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(loadingTimer);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>

      <main className={`min-h-screen relative ${!contentLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
        <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
        <Navbar />
        <div id="home">
          <Hero />
        </div>
        
        <Suspense fallback={null}>
          <div id="about">
            <AboutSection />
          </div>
        </Suspense>
        
        <Suspense fallback={null}>
          <div id="services">
            <ServicesSection />
          </div>
        </Suspense>
        
        <Suspense fallback={null}>
          <div id="portfolio">
            <PortfolioSection />
          </div>
        </Suspense>
        
        <Suspense fallback={null}>
          <div id="contact">
            <ContactSection />
          </div>
        </Suspense>
        
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
    </>
  );
};

export default Index;
