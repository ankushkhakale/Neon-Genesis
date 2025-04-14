
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary/80 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">
              Aesthetic<span className="text-accent">Wave</span>
            </h3>
            <p className="text-muted-foreground mb-4">
              Creating stunning digital experiences that inspire and elevate your brand.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  UI/UX Design
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  Web Development
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  Mobile App Development
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  Digital Marketing
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#portfolio" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-accent hover-underline transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>123 Design Street, Creative District</li>
              <li>San Francisco, CA 94107</li>
              <li>hello@aestheticwave.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="relative border-t pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AestheticWave. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-accent hover-underline transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-accent hover-underline transition-colors">
              Terms of Service
            </a>
          </div>
          
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3 }}
            whileTap={{ y: 0 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-full hidden sm:flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
