
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mail, Code, BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinTeamModal({ isOpen, onClose }: JoinTeamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '',
    experience: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in joining Neon Genesis. We'll review your application soon.",
      });
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-lg bg-background rounded-xl overflow-hidden neon-border z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading tracking-wider heading-slashed">
                  JOIN OUR TEAM
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-accent/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium flex items-center">
                    <User className="w-4 h-4 mr-2 text-accent" />
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-background border border-accent/30 focus:border-accent/70 focus:outline-none rounded-md px-4 py-2 transition-all"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-accent" />
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-background border border-accent/30 focus:border-accent/70 focus:outline-none rounded-md px-4 py-2 transition-all"
                    placeholder="Your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium flex items-center">
                    <Code className="w-4 h-4 mr-2 text-accent" />
                    SKILLS
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    className="w-full bg-background border border-accent/30 focus:border-accent/70 focus:outline-none rounded-md px-4 py-2 transition-all"
                    placeholder="Your skills (e.g., React, Node.js, UI/UX)"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium flex items-center">
                    <BriefcaseBusiness className="w-4 h-4 mr-2 text-accent" />
                    EXPERIENCE
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-background border border-accent/30 focus:border-accent/70 focus:outline-none rounded-md px-4 py-2 transition-all"
                    placeholder="Briefly describe your relevant experience"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 neon-border animate-pulse-glow"
                >
                  {isSubmitting ? (
                    <motion.div 
                      className="flex items-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Processing...
                    </motion.div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-4 h-4 mr-2" /> Submit Application
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
