
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from './ui/reveal';
import { Button } from './ui/button';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

const categories = ["All", "Web Design", "Mobile App", "Branding"];

const projects = [
  {
    id: 1,
    title: "Modern E-commerce Platform",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=2071",
    description: "A fully responsive e-commerce platform with advanced filtering and payment integration.",
    link: "#"
  },
  {
    id: 2,
    title: "Fitness Tracking Mobile App",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=2070",
    description: "Track your workouts, nutrition, and progress with this comprehensive fitness application.",
    link: "#"
  },
  {
    id: 3,
    title: "Corporate Brand Identity",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070",
    description: "Complete brand identity including logo design, color palette, and brand guidelines.",
    link: "#"
  },
  {
    id: 4,
    title: "Travel Booking Website",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1549715173-3bfc3c637f74?auto=format&fit=crop&q=80&w=2070",
    description: "An intuitive travel booking platform with destination suggestions and user reviews.",
    link: "#"
  },
  {
    id: 5,
    title: "Food Delivery App",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&q=80&w=2036",
    description: "Order food from local restaurants with real-time delivery tracking and notifications.",
    link: "#"
  },
  {
    id: 6,
    title: "Photography Portfolio",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?auto=format&fit=crop&q=80&w=2070",
    description: "Showcase of professional photography with gallery views and client testimonials.",
    link: "#"
  }
];

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const isMobile = useIsMobile();
  
  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-background to-secondary/10">
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
                onClick={() => handleCategoryClick(category)}
                className="m-1"
              >
                {category}
              </Button>
            </Reveal>
          ))}
        </div>

        {isMobile ? (
          // Mobile view - Vertical scrolling grid
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          // Desktop view - Carousel
          <Reveal>
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredProjects.map((project, index) => (
                  <CarouselItem key={project.id} className="pl-2 md:pl-4 sm:basis-1/2 lg:basis-1/3">
                    <ProjectCard project={project} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-8 gap-4">
                <CarouselPrevious className="static relative transform-none translate-y-0 mx-2" />
                <CarouselNext className="static relative transform-none translate-y-0 mx-2" />
              </div>
            </Carousel>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { delay: 0.1 * index, duration: 0.5 }
      }}
      className="group relative overflow-hidden rounded-lg h-full"
    >
      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-lg bg-muted h-full">
        <img 
          src={project.image} 
          alt={project.title}
          className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-6 w-full">
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <span className="text-sm text-white/75 mb-3 inline-block">{project.category}</span>
            <p className="text-white/80 text-sm mb-4">{project.description}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 text-white border-white hover:bg-white/20"
              onClick={() => window.open(project.link, '_blank')}
            >
              View Project <ExternalLink className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
