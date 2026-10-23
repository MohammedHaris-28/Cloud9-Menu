import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Utensils, Compass } from "lucide-react";

// Asset import from your local directory
import notFoundImg from "@/assets/Not Found.webp";

export const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between selection:bg-amber-200 selection:text-slate-900 antialiased relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-200/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0F172A] hover:text-amber-600 transition-colors"
        >
          
        </Link>

       
      </header>

      {/* Main 404 Hero Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex justify-center order-1 lg:order-1"
          >
            <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-[3rem] bg-white border border-slate-200/80 p-6 shadow-2xl flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-transparent to-slate-50/50 opacity-60" />

              <img
                src={notFoundImg}
                alt="404 - Page Not Found"
                className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full text-center tracking-wider uppercase">
                404 • Lost Destination
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left order-2 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold tracking-widest uppercase border border-amber-200/80 shadow-sm">
            
              Oops! Page Off Route
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0F172A] leading-none">
                404 Error
              </h1>
              <p className="text-xl sm:text-2xl font-serif italic text-slate-600">
                Looks like you took a wrong turn.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              The requested page <code className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 text-xs font-mono">{location.pathname}</code> doesn't exist or has been relocated within Mayya's Residency Cloud 9.
            </p>

            {/* Quick Navigation Buttons */}
           
          </motion.div>

        </div>
      </main>

      {/* Footer text */}
      <footer className="w-full text-center py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
        Mayya's Residency Cloud 9 Bar & Family Restaurant • Shivamogga
      </footer>
    </div>
  );
};

export default NotFound;