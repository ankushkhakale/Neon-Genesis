
import { motion } from 'framer-motion';
import { Reveal } from './ui/reveal';
import { Code, Palette, LineChart, Smartphone, Zap, Globe } from 'lucide-react';

const services = [
  {
    icon: <Palette className="w-10 h-10" />,
    title: "UI/UX Design",
    description: "Creating intuitive and engaging user experiences with modern design principles."
  },
  {
    icon: <Code className="w-10 h-10" />,
    title: "Web Development",
    description: "Building fast, responsive websites and applications with cutting-edge technologies."
  },
  {
    icon: <Smartphone className="w-10 h-10" />,
    title: "Mobile Apps",
    description: "Developing native and cross-platform mobile applications for iOS and Android."
  },
  {
    icon: <Globe className="w-10 h-10" />,
    title: "Digital Marketing",
    description: "Growing your online presence with strategic digital marketing campaigns."
  },
  {
    icon: <LineChart className="w-10 h-10" />,
    title: "SEO Optimization",
    description: "Improving your search engine rankings to increase organic traffic and visibility."
  },
  {
    icon: <Zap className="w-10 h-10" />,
    title: "Performance",
    description: "Optimizing your digital products for speed, accessibility, and conversion."
  }
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <Reveal>
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider">
              Our Services
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              What We <span className="text-gradient">Offer</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a wide range of services to help businesses establish a strong digital presence
              and achieve their goals through innovative solutions.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Reveal key={index} delay={0.1 * index} className="w-full">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-background border rounded-lg p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-accent/50"
              >
                <div className="text-accent mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground flex-grow">{service.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
