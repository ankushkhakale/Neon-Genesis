
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

const NavLink = ({ href, text }: { href: string; text: string }) => {
  return (
    <a 
      href={href} 
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover-underline"
    >
      {text}
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 
      ${scrolled ? 'bg-background/80 backdrop-blur-md border-b py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <a href="#" className="text-xl md:text-2xl font-bold text-foreground">
            Aesthetic<span className="text-accent">Wave</span>
          </a>
        </motion.div>

        {/* Desktop Nav */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center space-x-8"
        >
          <NavLink href="#home" text="Home" />
          <NavLink href="#about" text="About" />
          <NavLink href="#services" text="Services" />
          <NavLink href="#portfolio" text="Portfolio" />
          <NavLink href="#contact" text="Contact" />
          <Button>Get Started</Button>
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground" 
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-background border-b"
        >
          <div className="container mx-auto py-4 flex flex-col space-y-4">
            <NavLink href="#home" text="Home" />
            <NavLink href="#about" text="About" />
            <NavLink href="#services" text="Services" />
            <NavLink href="#portfolio" text="Portfolio" />
            <NavLink href="#contact" text="Contact" />
            <Button className="w-full">Get Started</Button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
