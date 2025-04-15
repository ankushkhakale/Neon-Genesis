
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Menu, X, Code, Brain, MessageSquare } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const NavLink = ({ href, text, onClick, isExternal = false }: { 
  href: string; 
  text: string; 
  onClick?: () => void;
  isExternal?: boolean;
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // For internal section links on home page
  if (href.startsWith('#') && isHomePage) {
    return (
      <motion.a 
        href={href} 
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent hover-underline"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {text}
      </motion.a>
    );
  }
  
  // For external links or section links when not on home page
  if (isExternal || (href.startsWith('#') && !isHomePage)) {
    return (
      <RouterLink 
        to={isHomePage ? href : `/${href}`} 
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent hover-underline"
        onClick={onClick}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {text}
        </motion.span>
      </RouterLink>
    );
  }
  
  // For navigating to other pages
  return (
    <RouterLink
      to={href}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-accent hover-underline"
      onClick={onClick}
    >
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {text}
      </motion.span>
    </RouterLink>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 
      ${scrolled ? 'glassmorphism py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <RouterLink to="/" className="text-xl md:text-2xl font-bold neon-text">
            NEON<span className="text-secondary">GENESIS</span>
          </RouterLink>
        </motion.div>

        {/* Desktop Nav */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center space-x-8"
        >
          {isHomePage ? (
            <>
              <NavLink href="#home" text="Home" onClick={closeMenu} />
              <NavLink href="#about" text="About" onClick={closeMenu} />
              <NavLink href="#services" text="Services" onClick={closeMenu} />
              <NavLink href="#portfolio" text="Projects" onClick={closeMenu} />
              <NavLink href="#contact" text="Contact" onClick={closeMenu} />
            </>
          ) : (
            <>
              <NavLink href="/" text="Home" onClick={closeMenu} />
              <NavLink href="/#about" text="About" onClick={closeMenu} isExternal={true} />
              <NavLink href="/#services" text="Services" onClick={closeMenu} isExternal={true} />
              <NavLink href="/#portfolio" text="Projects" onClick={closeMenu} isExternal={true} />
              <NavLink href="/#contact" text="Contact" onClick={closeMenu} isExternal={true} />
            </>
          )}
          <RouterLink to="/team" onClick={closeMenu}>
            <Button variant="outline" className="border-accent/50 hover:border-accent hover:bg-accent/10">
              Our Team
            </Button>
          </RouterLink>
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu}
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
          className="md:hidden glassmorphism"
        >
          <div className="container mx-auto py-4 flex flex-col space-y-4 px-4">
            {isHomePage ? (
              <>
                <NavLink href="#home" text="Home" onClick={closeMenu} />
                <NavLink href="#about" text="About" onClick={closeMenu} />
                <NavLink href="#services" text="Services" onClick={closeMenu} />
                <NavLink href="#portfolio" text="Projects" onClick={closeMenu} />
                <NavLink href="#contact" text="Contact" onClick={closeMenu} />
              </>
            ) : (
              <>
                <NavLink href="/" text="Home" onClick={closeMenu} />
                <NavLink href="/#about" text="About" onClick={closeMenu} isExternal={true} />
                <NavLink href="/#services" text="Services" onClick={closeMenu} isExternal={true} />
                <NavLink href="/#portfolio" text="Projects" onClick={closeMenu} isExternal={true} />
                <NavLink href="/#contact" text="Contact" onClick={closeMenu} isExternal={true} />
              </>
            )}
            <RouterLink to="/team" onClick={closeMenu} className="w-full">
              <Button variant="outline" className="w-full border-accent/50 hover:border-accent hover:bg-accent/10">
                Our Team
              </Button>
            </RouterLink>
          </div>
        </motion.div>
      )}
    </header>
  );
}
