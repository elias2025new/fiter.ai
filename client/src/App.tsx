import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

// Telegram WebApp SDK Mock for development
const tg = (window as any).Telegram?.WebApp;

function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    experience: '',
  });

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Apply theme colors
      document.documentElement.style.setProperty('--tg-bg', tg.backgroundColor || '#0f172a');
      document.documentElement.style.setProperty('--tg-text', tg.textColor || '#f8fafc');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In production, the URL should be your deployed backend URL
      // For local development, it might be http://localhost:3001
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience_level: formData.experience,
          initData: tg?.initData || '',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (tg) {
          tg.HapticFeedback.notificationOccurred('success');
          setTimeout(() => tg.close(), 3000);
        }
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message);
      if (tg) tg.HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-500/10 p-6 rounded-full mb-6 border border-green-500/20"
        >
          <CheckCircle2 size={64} className="text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Welcome to Fiter.ai!
        </h1>
        <p className="text-slate-400 max-w-xs mx-auto mb-8">
          Registration complete. We'll reach out to your email shortly with next steps.
        </p>
        <p className="text-xs text-slate-600">Closing in 3 seconds...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col items-center">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <header className="w-full max-w-md mb-10 text-center relative z-10 pt-8">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-black mb-2 tracking-tighter"
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            FITER.AI
          </span>
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 font-medium"
        >
          Join the elite AI engineering cohort
        </motion.p>
      </header>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-slate-600"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-slate-600"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Experience Level</label>
            <div className="relative">
              <select
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
              >
                <option value="" disabled className="bg-slate-950">Select your level</option>
                <option value="Beginner" className="bg-slate-950">Beginner - New to AI</option>
                <option value="Intermediate" className="bg-slate-950">Intermediate - Some experience</option>
                <option value="Advanced" className="bg-slate-950">Advanced - Pro developer</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronRight size={20} className="rotate-90" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>Register Now <ChevronRight size={20} /></>
            )}
          </button>
        </form>
      </motion.div>
      
      <footer className="mt-auto py-8 text-center relative z-10">
        <p className="text-slate-500 text-sm flex items-center gap-2">
          Secure Registration • Powered by Fiter.ai
        </p>
      </footer>
    </div>
  );
}

export default App;
