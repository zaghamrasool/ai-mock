import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mic, BarChart3, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      signIn();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-linear-to-b from-white to-neutral-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium mb-6">
            AI-Powered Mock Interviews
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-6">
            Master your next <br />
            <span className="text-neutral-500">job interview</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
            Practice with our realistic AI interviewer. Get instant, detailed feedback on your communication, technical skills, and body language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-lg rounded-full" onClick={handleStart}>
              Start Trial Interview <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
              View Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 w-full max-w-5xl rounded-2xl border bg-white shadow-2xl overflow-hidden aspect-video relative group"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/0 transition-colors">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Mic className="h-8 w-8 text-black" />
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=2000" 
            alt="AI Interview Interface" 
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <Mic className="h-8 w-8 text-neutral-900" />
              </div>
              <h3 className="text-xl font-bold mb-3">Realistic Voice AI</h3>
              <p className="text-neutral-600">Interact naturally with our ultra-low latency voice AI that understands context and nuance.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-neutral-900" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Analysis</h3>
              <p className="text-neutral-600">Get a comprehensive score and breakdown of your performance as soon as your session ends.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-neutral-900" />
              </div>
              <h3 className="text-xl font-bold mb-3">Unlimited Practice</h3>
              <p className="text-neutral-600">Practice anytime, anywhere. Choose from hundreds of job roles and industry-specific questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Trusted by candidates at top companies</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            <span className="text-2xl font-bold tracking-tighter">GOOGLE</span>
            <span className="text-2xl font-bold tracking-tighter">META</span>
            <span className="text-2xl font-bold tracking-tighter">AMAZON</span>
            <span className="text-2xl font-bold tracking-tighter">NETFLIX</span>
            <span className="text-2xl font-bold tracking-tighter">STRIPE</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-4 h-4" />
            </div>
            <span className="font-bold">MockAI</span>
          </div>
          <div className="flex gap-8 text-sm text-neutral-500">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
            <a href="#" className="hover:text-black">Contact Us</a>
          </div>
          <p className="text-sm text-neutral-500">© 2026 MockAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
