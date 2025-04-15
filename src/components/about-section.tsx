
import { motion } from 'framer-motion';
import { Reveal } from './ui/reveal';
import { Check, Code, Brain, Cpu, Zap, Network, Users } from 'lucide-react';

export function AboutSection() {
  const features = [
    {
      icon: <Code className="w-4 h-4 text-accent" />,
      text: "Advanced coding expertise"
    },
    {
      icon: <Brain className="w-4 h-4 text-accent" />,
      text: "AI/ML enthusiasts"
    },
    {
      icon: <Cpu className="w-4 h-4 text-accent" />,
      text: "Full-stack development"
    },
    {
      icon: <Zap className="w-4 h-4 text-accent" />,
      text: "Rapid prototyping"
    },
    {
      icon: <Network className="w-4 h-4 text-accent" />,
      text: "Scalable architecture"
    },
    {
      icon: <Users className="w-4 h-4 text-accent" />,
      text: "Strong communication"
    }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 cyberpunk-grid opacity-30"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative z-10 overflow-hidden rounded-xl"
            >
              <div className="glassmorphism p-1 neon-border animate-pulse-glow">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1974"
                  alt="Team of developers coding"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </motion.div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/30 rounded-lg -z-10 blur-xl"></div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/30 rounded-lg -z-10 blur-xl"></div>
          </div>

          <div className="space-y-6">
            <Reveal>
              <span className="inline-block text-sm font-semibold glassmorphism px-3 py-1 rounded-full uppercase tracking-wider">
                About Neon Genesis
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight neon-text">
                We Are <span className="text-gradient">Passionate</span> Code Enthusiasts
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg text-muted-foreground">
                Neon Genesis is a team of dedicated developers who live and breathe code. 
                We are driven by innovation, constantly pushing the boundaries of what's 
                possible in the digital realm. Our passion for technology is matched only 
                by our commitment to delivering exceptional results.
              </p>
            </Reveal>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <Reveal key={i} delay={0.2 + (i * 0.1)}>
                  <motion.div 
                    className="flex items-center space-x-3 glassmorphism p-3 rounded-lg"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
