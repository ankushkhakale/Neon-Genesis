import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <motion.ol 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Home link */}
        <li>
          <Link 
            to="/" 
            className="flex items-center text-muted-foreground hover:text-accent transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
            {item.href ? (
              <Link 
                to={item.href}
                className="text-muted-foreground hover:text-accent transition-colors duration-200 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </motion.ol>
    </nav>
  );
}

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  home: [],
  about: [{ label: 'About' }],
  services: [{ label: 'Services' }],
  portfolio: [{ label: 'Portfolio' }],
  contact: [{ label: 'Contact' }],
  team: [{ label: 'Team' }],
  project: (projectName: string) => [
    { label: 'Portfolio', href: '/#portfolio' },
    { label: projectName }
  ]
}; 