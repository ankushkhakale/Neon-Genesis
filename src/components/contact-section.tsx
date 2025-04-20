import { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from './ui/reveal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/22581109/2x5er3e/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      recipient: "neongenesis.devs@gmail.com",
      timestamp: new Date().toISOString(),
      source: window.location.origin,
    };

    try {
      const response = await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(data),
      });

      toast({
        title: "Message sent!",
        description: "We'll get back to you soon.",
        duration: 5000,
      });
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <Reveal>
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-wider">
              Get In Touch
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              Let's <span className="text-gradient">Connect</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind or want to learn more about our services? 
              Reach out to us and let's create something amazing together.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Reveal>
              <div className="flex items-start space-x-4">
                <div className="mt-1 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Email Us</h3>
                  <p className="mt-1 text-muted-foreground">neongenesis.devs@gmail.com</p>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={0.1}>
              <div className="flex items-start space-x-4">
                <div className="mt-1 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Call Us</h3>
                  <p className="mt-1 text-muted-foreground">+91 72764 12788</p>
                  <p className="mt-1 text-muted-foreground">+91 75881 95521</p>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="flex items-start space-x-4">
                <div className="mt-1 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Visit Us</h3>
                  <p className="mt-1 text-muted-foreground">
                    Nashik District
                    <br />
                    Maharashtra, India
                  </p>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={0.3}>
              <div className="mt-8 p-6 bg-secondary/50 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Office Hours</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span>Closed</span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
          
          <Reveal className="w-full" delay={0.2}>
            <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-background rounded-lg border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" placeholder="Your email" required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input id="subject" name="subject" placeholder="How can we help you?" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea 
                  id="message" 
                  name="message"
                  placeholder="Your message..." 
                  rows={5} 
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
