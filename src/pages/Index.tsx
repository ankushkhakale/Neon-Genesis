
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { AboutSection } from '@/components/about-section';
import { ServicesSection } from '@/components/services-section';
import { PortfolioSection } from '@/components/portfolio-section';
import { ContactSection } from '@/components/contact-section';
import { Footer } from '@/components/footer';
import { Loader } from '@/components/loader';

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
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
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>

      <main className="min-h-screen relative">
        <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
        <Navbar />
        <div id="home">
          <Hero />
        </div>
        <div id="about">
          <AboutSection />
        </div>
        <div id="services">
          <ServicesSection />
        </div>
        <div id="portfolio">
          <PortfolioSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Index;
