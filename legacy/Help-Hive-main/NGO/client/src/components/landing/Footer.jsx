import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedLogo from '../common/AnimatedLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-black/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex cursor-pointer transition-transform hover:scale-[1.02]">
              <AnimatedLogo className="h-10 w-10" />
              <span className="font-outfit text-xl font-bold tracking-tight text-text-primary group-hover:text-accent-primary transition-colors duration-300">
                Help<span className="text-gradient">Hive</span>
              </span>
            </Link>
            <p className="text-text-tertiary max-w-xs leading-relaxed font-medium">
              Empowering NGOs globally through smart volunteer, resource, and event coordination.
            </p>
          </div>

          <div>
            <h4 className="font-outfit font-bold text-text-primary mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-text-secondary hover:text-accent-primary transition-colors cursor-pointer text-sm font-medium">Features</a></li>
              <li><a href="#how-it-works" className="text-text-secondary hover:text-accent-primary transition-colors cursor-pointer text-sm font-medium">How it Works</a></li>
              <li><Link to="/login" className="text-text-secondary hover:text-accent-primary transition-colors cursor-pointer text-sm font-medium">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-outfit font-bold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors cursor-pointer text-sm font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-primary transition-colors cursor-pointer text-sm font-medium">Terms of Service</a></li>
            </ul>
          </div>
          
        </div>

        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-tertiary text-sm font-medium">
            © {currentYear} HelpHive. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-text-tertiary font-medium">
             Designed for impact.
          </div>
        </div>
      </div>
    </footer>
  );
}
