import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

// Telegram WebApp SDK Mock for development
const tg = (window as any).Telegram?.WebApp;

function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    experience: '',
  });

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^(\+251|0)[79]\d{8}$/.test(phone);
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      document.documentElement.style.setProperty('--tg-bg', tg.backgroundColor || '#0f172a');
      document.documentElement.style.setProperty('--tg-text', tg.textColor || '#f8fafc');
    }
  }, []);

  const handleNext = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!validatePhone(formData.phoneNumber)) {
      setError('Enter a valid Ethiopian phone number.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.experience) {
      setError('Please select your experience level.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience_level: formData.experience,
          phone_number: formData.phoneNumber,
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
        <p className="text-slate-400 max-w-xs mx-auto">
          Registration complete. We'll reach out shortly!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 flex flex-col items-center justify-center overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[80px]" />
      </div>

      <header className="w-full max-w-sm mb-6 text-center relative z-10">
        <motion.h1 
          className="text-4xl font-black mb-1 tracking-tighter"
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase">
            FITER.AI
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4"
        >
          AI Engineering Masterclass: From Zero to AI Hero
        </motion.p>
        <div className="flex justify-center gap-1.5">
          <div className={`h-1 w-8 rounded-full transition-all duration-500 ${step === 1 ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`} />
          <div className={`h-1 w-8 rounded-full transition-all duration-500 ${step === 2 ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`} />
        </div>
      </header>

      <motion.div 
        layout
        className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl relative z-10"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-slate-700"
                    placeholder="Enter name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-slate-700"
                    placeholder="0911223344"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-slate-700"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Experience Level</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'Beginner', label: 'Beginner', desc: 'New to AI & Coding' },
                      { id: 'Intermediate', label: 'Intermediate', desc: 'Some experience' },
                      { id: 'Advanced', label: 'Advanced', desc: 'Professional level' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({...formData, experience: opt.id})}
                        className={`relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 group ${
                          formData.experience === opt.id 
                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <p className={`font-bold text-sm ${formData.experience === opt.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.experience === opt.id ? 'border-cyan-500 bg-cyan-500' : 'border-slate-800'
                          }`}>
                            {formData.experience === opt.id && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                        </div>
                        {formData.experience === opt.id && (
                          <motion.div 
                            layoutId="active-bg"
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Join Fiter.ai'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
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
