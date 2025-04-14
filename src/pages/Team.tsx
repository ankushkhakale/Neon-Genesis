
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Loader } from '@/components/loader';
import { Reveal } from '@/components/ui/reveal';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Github, Linkedin, Twitter, Code, Brain, Palette, MessageSquare } from 'lucide-react';

const teamMembers = [
  {
    name: "Alex Reeves",
    role: "Full-Stack Developer",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=1760",
    specialty: "React, Node.js, GraphQL",
    bio: "Passionate about creating elegant solutions to complex problems. When not coding, Alex enjoys competitive gaming and mountain biking.",
    skills: ["React", "Node.js", "GraphQL", "TypeScript", "AWS"],
    icon: <Code className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Maya Chen",
    role: "AI/ML Engineer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1974",
    specialty: "TensorFlow, PyTorch, NLP",
    bio: "Fascinated by the possibilities of machine learning. Maya specializes in creating intelligent solutions that push technology forward.",
    skills: ["TensorFlow", "PyTorch", "Python", "NLP", "Computer Vision"],
    icon: <Brain className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Jordan Williams",
    role: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=1760",
    specialty: "User Experience, Interaction Design",
    bio: "Creating beautiful and intuitive interfaces is Jordan's passion. Always focused on enhancing the human-computer interaction experience.",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems"],
    icon: <Palette className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Sarah Johnson",
    role: "DevOps Specialist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1961",
    specialty: "CI/CD, Kubernetes, Docker",
    bio: "Streamlining development processes and ensuring smooth deployments. Sarah is passionate about automation and infrastructure as code.",
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform"],
    icon: <Code className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Kevin Park",
    role: "Technical Lead",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=1974",
    specialty: "Architecture, Team Leadership",
    bio: "With over a decade of experience, Kevin guides the technical direction of the team while fostering a culture of continuous learning.",
    skills: ["System Architecture", "Leadership", "Mentoring", "Full-Stack", "Strategy"],
    icon: <Code className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Olivia Martinez",
    role: "Community Manager",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=1740",
    specialty: "Developer Relations, Communication",
    bio: "Building bridges between the team and the community. Olivia ensures our work is accessible and our message is clear.",
    skills: ["Communication", "Content Creation", "Event Management", "Social Media", "Technical Writing"],
    icon: <MessageSquare className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  }
];

const TeamMemberCard = ({ member, index }) => {
  return (
    <Reveal delay={0.1 * index}>
      <motion.div 
        className="glassmorphism p-1 rounded-xl neon-border overflow-hidden"
        whileHover={{ 
          y: -10,
          transition: { duration: 0.3 }
        }}
      >
        <div className="bg-black/60 rounded-lg overflow-hidden">
          <div className="relative">
            <img 
              src={member.image} 
              alt={member.name}
              className="w-full h-64 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
          
          <div className="p-6">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold neon-text">{member.name}</h3>
                <p className="text-secondary">{member.role}</p>
              </div>
              <div className="flex-shrink-0 p-2 rounded-full bg-accent/20">{member.icon}</div>
            </div>
            
            <HoverCard>
              <HoverCardTrigger>
                <p className="text-sm text-muted-foreground mb-4 cursor-help border-b border-dashed border-muted-foreground inline-block">
                  {member.specialty}
                </p>
              </HoverCardTrigger>
              <HoverCardContent className="glassmorphism bg-black/80 border-accent/20 w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-accent">Expertise Areas</h4>
                  <p className="text-xs text-muted-foreground">{member.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            
            <div className="flex space-x-2 mt-4">
              <motion.a 
                href={member.links.github} 
                className="p-2 bg-muted/20 hover:bg-accent/20 rounded-full text-muted-foreground hover:text-accent transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="w-4 h-4" />
              </motion.a>
              <motion.a 
                href={member.links.linkedin} 
                className="p-2 bg-muted/20 hover:bg-accent/20 rounded-full text-muted-foreground hover:text-accent transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-4 h-4" />
              </motion.a>
              <motion.a 
                href={member.links.twitter} 
                className="p-2 bg-muted/20 hover:bg-accent/20 rounded-full text-muted-foreground hover:text-accent transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
};

const Team = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>

      <main className="min-h-screen relative">
        <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
        
        <Navbar />
        
        <section className="pt-32 pb-16 relative z-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <Reveal>
                <span className="inline-block text-sm font-semibold glassmorphism px-3 py-1 rounded-full uppercase tracking-wider">
                  Meet The Team
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-4 text-4xl md:text-5xl font-bold neon-text">
                  The <span className="text-gradient">Minds</span> Behind Neon Genesis
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-4 text-lg text-muted-foreground">
                  Our team consists of passionate developers, designers, and communicators who are dedicated 
                  to pushing the boundaries of what's possible in technology. Together, we create innovative 
                  solutions that make a difference.
                </p>
              </Reveal>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} index={index} />
              ))}
            </div>
            
            <div className="mt-24 glassmorphism rounded-xl p-8 max-w-3xl mx-auto">
              <Reveal>
                <h2 className="text-2xl font-bold neon-text mb-4">Join Our Team</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-muted-foreground mb-6">
                  Are you passionate about coding and technology? Do you thrive in collaborative environments 
                  where innovation is valued? We're always looking for talented individuals to join our team.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="bg-black/40 p-6 rounded-lg">
                  <h3 className="text-accent font-semibold mb-2">Open Positions:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                      <Code className="w-4 h-4 mr-2 text-secondary" /> Backend Developer (Node.js/Python)
                    </li>
                    <li className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-secondary" /> Machine Learning Engineer
                    </li>
                    <li className="flex items-center">
                      <Palette className="w-4 h-4 mr-2 text-secondary" /> UI/UX Designer
                    </li>
                  </ul>
                  <motion.button 
                    className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg font-medium w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Now
                  </motion.button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    </>
  );
};

export default Team;
