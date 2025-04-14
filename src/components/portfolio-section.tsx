
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from './ui/reveal';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

const categories = ["All", "Web Design", "Mobile App", "Branding"];

const projects = [
  {
    id: 1,
    title: "Modern E-commerce Platform",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=2071",
  },
  {
    id: 2,
    title: "Fitness Tracking Mobile App",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 3,
    title: "Corporate Brand Identity",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 4,
    title: "Travel Booking Website",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1549715173-3bfc3c637f74?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 5,
    title: "Food Delivery App",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&q=80&w=2036",
  },
  {
    id: 6,
    title: "Photography Portfolio",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?auto=format&fit=crop&q=80&w=2070",
  }
];

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <Reveal>
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider">
              Our Portfolio
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              Recent <span className="text-gradient">Projects</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully crafted projects that showcase our expertise and 
              commitment to creating impactful digital solutions.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-wrap justify-center mb-12 gap-2">
          {categories.map((category, index) => (
            <Reveal key={category} delay={0.1 * index}>
              <Button
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="m-1"
              >
                {category}
              </Button>
            </Reveal>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.1 * index, duration: 0.5 }
                }}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-lg bg-muted">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 w-full">
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <span className="text-sm text-white/75 mb-3 inline-block">{project.category}</span>
                      <Button size="sm" variant="outline" className="mt-2 text-white border-white hover:bg-white/20">
                        View Project <ExternalLink className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
