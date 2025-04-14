
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

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>

      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
