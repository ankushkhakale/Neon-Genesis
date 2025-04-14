
import { motion } from 'framer-motion';
import { Reveal } from './ui/reveal';
import { Check } from 'lucide-react';

export function AboutSection() {
  const features = [
    "User-centered design approach",
    "Modern web technologies",
    "Responsive across all devices",
    "Performance optimization",
    "Accessibility compliance",
    "SEO best practices"
  ];

  return (
    <section id="about" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative z-10 overflow-hidden rounded-lg shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1974"
                alt="Our team collaborating"
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent rounded-lg -z-10"></div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/60 rounded-lg -z-10"></div>
          </div>

          <div className="space-y-6">
            <Reveal>
              <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider">
                About Us
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                We Create <span className="text-gradient">Beautiful</span> Digital Experiences
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg text-muted-foreground">
                With over a decade of experience, our team of designers and developers 
                creates stunning digital products that help businesses grow. We combine
                aesthetics with functionality to deliver exceptional results.
              </p>
            </Reveal>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <Reveal key={feature} delay={0.2 + (i * 0.1)}>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
