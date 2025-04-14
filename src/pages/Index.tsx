
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
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Simulate content loading
    const contentTimer = setTimeout(() => {
      setContentLoaded(true);
    }, 1000);
    
    // Simulate loading time with a slightly longer delay
    const loadingTimer = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Welcome to Neon Genesis",
        description: "Explore our digital realm and discover our projects.",
      });
    }, 2500);

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
