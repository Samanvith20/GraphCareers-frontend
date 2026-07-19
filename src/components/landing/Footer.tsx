import { Link } from "react-router-dom";
import { Search, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[r] pt-24 pb-12 border-t border-white/5 bg-zinc-950 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-primary/10 blur-[120px] rounded-[100%] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 text-2xl font-bold tracking-tight text-white">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-primary">Graph</span>Careers
            </Link>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm mb-8">
              The intelligent career operating system. Bypass the resume black hole and land the perfect role faster.
            </p>
            {/* <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div> */}
          </div>
          
          {/* Product Links */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-zinc-400 hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-zinc-400 hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#faq" className="text-zinc-400 hover:text-primary transition-colors">FAQ</a></li>
              {/* <li><Link to="/pricing" className="text-zinc-400 hover:text-primary transition-colors">Pricing</Link></li> */}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-zinc-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-zinc-400 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-zinc-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><a href="mailto:support@graphcareers.com" className="text-zinc-400 hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} GraphCareers. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-zinc-500 text-sm">
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;