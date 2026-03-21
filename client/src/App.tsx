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
      if (tg) tg.HapticFeedback.notificationOccurred('error');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Please enter your phone number.');
      if (tg) tg.HapticFeedback.notificationOccurred('error');
      return;
    }
    if (!validatePhone(formData.phoneNumber)) {
      setError('Please enter a valid Ethiopian phone number.');
      if (tg) tg.HapticFeedback.notificationOccurred('error');
      return;
    }
    setError(null);
    setStep(2);
    if (tg) tg.HapticFeedback.impactOccurred('medium');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Email address is required.');
      return;
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50 text-slate-900">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-100 p-6 rounded-full mb-6 border border-green-200 shadow-sm"
        >
          <CheckCircle2 size={64} className="text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          Welcome!
        </h1>
        <p className="text-slate-600 max-w-xs mx-auto">
          Registration complete. We'll reach out shortly!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 flex flex-col items-center justify-center overflow-x-hidden selection:bg-blue-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-orange-400/15 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        layout
        className="w-full max-w-sm relative z-10 p-4 mt-8 flex-1 flex flex-col justify-center"
      >
        <div className="flex justify-center gap-1.5 mb-10">
          <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === 1 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === 2 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200'}`} />
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="Enter name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="0911223344"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>

                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-20 h-20 rounded-full border-2 border-blue-200 p-1 bg-white overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                    <img 
                      src="/course_icon.png" 
                      alt="Prompt Engineering" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-blue-700 tracking-[0.2em] uppercase">
                    Prompt Engineering
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Experience Level</label>
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
                            ? 'bg-blue-50 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <p className={`font-bold text-sm ${formData.experience === opt.id ? 'text-blue-700' : 'text-slate-700'}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            formData.experience === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}>
                            {formData.experience === opt.id && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                        </div>
                        {formData.experience === opt.id && (
                          <motion.div 
                            layoutId="active-bg"
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"
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
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  x: [0, -4, 4, -4, 4, 0] 
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                  x: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 text-red-700 text-xs font-semibold bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm mb-4"
              >
                <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}

export default App;
