
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
    name: "Ankush Khakale",
    role: "Full-Stack Developer",
    image: "https://media.licdn.com/dms/image/v2/D4E03AQFhFPMKUIyaBw/profile-displayphoto-shrink_400_400/B4EZTFsYjtGYAg-/0/1738483536336?e=1750291200&v=beta&t=NlQIL1l_IOqbN4A0iK8KZDnqK1eGbT_acR6Kf8jxhyQ",
    specialty: "React, GenAI, Python",
    bio: "Passionate about creating elegant solutions to complex problems. When not coding, Ankush enjoys competitive gaming and mountain biking.",
    skills: ["React", "Node.js", "Python", "GenAI", "Google Cloud"],
    icon: <Code className="w-5 h-5" />,
    links: {
      github: "https://github.com/ankushkhakale/",
      linkedin: "https://www.linkedin.com/in/ankush-khakale-45423a324/",
      twitter: "https://x.com/Stoic_Ankush"
    }
  },
  {
    name: "Atharva Jangale",
    role: "AI/ML Enthusiast",
    image: "https://media.licdn.com/dms/image/v2/D5622AQHKkP1EdMlD9A/feedshare-shrink_1280/B56ZThx9BxGoAs-/0/1738954758452?e=1747872000&v=beta&t=O61CCY5eFQ9chQvueuf6hNwo-IBdPQk5EHGeq-_-RHQ",
    specialty: "MCP, Google Cloud, NLP",
    bio: "Fascinated by the possibilities of machine learning. Atharva specializes in creating intelligent solutions that push technology forward.",
    skills: ["TensorFlow", "Python", "IoT", "NLP", "API"],
    icon: <Brain className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "https://www.linkedin.com/in/atharva-jangale/",
      twitter: "#"
    }
  },
  {
    name: "Atharva Jondhale",
    role: "UI/UX Designer & DBMS",
    image: "https://media.licdn.com/dms/image/v2/D4E03AQE2qIAJH-4XPQ/profile-displayphoto-shrink_400_400/B4EZQ1eV.ZHEAg-/0/1736063935636?e=1750291200&v=beta&t=srCkypWWKhPx2iBPlyuYsCzxqzXsXJ4k7dFOfrVyO_k",
    specialty: "Database Management, Interaction Design",
    bio: "Creating beautiful and intuitive interfaces is Atharva's passion. He plays an important role in Database Management for the team.",
    skills: ["NoSQL", "Figma", "C#", "Prototyping", "Design Systems"],
    icon: <Palette className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "https://www.linkedin.com/in/atharva-jondhale-8886b8344/",
      twitter: "#"
    }
  },
  {
    name: "Shravani Bharambe",
    role: "Frontend Developer ",
    image: "/lovable-uploads/a57b3b83-d2ed-4893-8b7e-70d4838d7868.png",
    specialty: "User Interface, Python, DSA",
    bio: "Creating stunning impactful front-end websites. Shravani is passionate about new techs and infrastructure as code.",
    skills: ["Communication", "React", "NodeJS", "Leadership"],
    icon: <Code className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "https://www.linkedin.com/in/shravani-bharambe-74809631b/",
      twitter: "#"
    }
  },
  {
    name: "Mahima Chaudhari",
    role: "UI-UX Designer",
    image: "https://i.pinimg.com/736x/a9/75/93/a975934bb378afc4ca8c133df451f56e.jpg",
    specialty: "UI Design, Team Lead",
    bio: "Mahima shapes the team's design vision while championing a culture of iterative improvement and user-centric innovation.",
    skills: ["UI-Design", "Leadership", "Sketching"],
    icon: <Code className="w-5 h-5" />,
    links: {
      github: "#",
      linkedin: "https://www.linkedin.com/in/mahima-chaudhari-518904333/",
      twitter: "#"
    }
  }
];

const TeamMemberCard = ({ member, index }) => {
  return (
    <Reveal delay={0.1 * index}>
      <motion.div 
        className="glassmorphism p-1 rounded-xl neon-border overflow-hidden h-full flex flex-col"
        whileHover={{ 
          y: -10,
          transition: { duration: 0.3 }
        }}
      >
        <div className="bg-black/60 rounded-lg overflow-hidden flex flex-col h-full">
          <div className="relative h-64 flex-shrink-0">
            <img 
              src={member.image} 
              alt={member.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
          
          <div className="p-6 flex flex-col flex-grow justify-between">
            <div>
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold neon-text">{member.name}</h3>
                  <p className="text-secondary">{member.role}</p>
                </div>
                <div className="flex-shrink-0 p-2 rounded-full bg-accent/20">{member.icon}</div>
              </div>
              
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className="text-sm text-muted-foreground mb-4 cursor-help border-b border-dashed border-muted-foreground inline-block">
                    {member.specialty}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent 
                  side="top"
                  align="start"
                  className="glassmorphism bg-black/95 border-accent/30 w-80 z-50 shadow-xl shadow-accent/20"
                >
                  <div className="space-y-3 p-1">
                    <h4 className="text-sm font-semibold text-accent">Expertise Areas</h4>
                    <p className="text-xs text-muted-foreground">{member.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-accent/30 text-accent px-2 py-1 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            
            <div className="flex space-x-2 mt-auto">
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
