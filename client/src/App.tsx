import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ChevronRight, Shield, Users, X, Search, Phone, Mail, Calendar } from 'lucide-react';

// Telegram WebApp SDK
const tg = (window as any).Telegram?.WebApp;

const ADMIN_TELEGRAM_ID = 5908397596;

const LAUNCH_DATE = new Date('2026-05-20T00:00:00+03:00');

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

function CountdownScreen() {
  const { days, hours, minutes, seconds } = useCountdown();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center bg-slate-50 text-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-orange-400/15 rounded-full blur-[80px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="bg-green-100 p-5 rounded-full mb-5 border border-green-200 shadow-sm inline-flex"
        >
          <CheckCircle2 size={52} className="text-green-600" />
        </motion.div>

        <h1 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          Welcome to Fiter.ai!
        </h1>
        <p className="text-slate-500 text-sm mb-8">Registration complete</p>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            🚀 Cohort Starts In
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }, { v: minutes, l: 'Mins' }, { v: seconds, l: 'Secs' }].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center bg-slate-50 rounded-2xl py-3 px-1 border border-slate-100">
                <span className="text-2xl font-black text-blue-700 tabular-nums">
                  {String(v).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4 font-medium">
            May 20, 2026 · Addis Ababa Time
          </p>
        </div>

        <p className="text-slate-400 text-xs">
          We'll notify you before the cohort begins • Fiter.ai
        </p>
      </motion.div>
    </div>
  );
}

interface Student {
  id: string;
  telegram_id: number;
  username: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  experience_level: string;
  created_at: string;
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/admin', {
          headers: { 'x-init-data': tg?.initData || '' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setStudents(data.students);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.username || '').toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.phone_number.includes(search)
  );

  const expColor = (level: string) => {
    if (level === 'Beginner') return 'bg-green-100 text-green-700 border-green-200';
    if (level === 'Intermediate') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/60 bg-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Admin Panel</h2>
            <p className="text-[10px] text-slate-400">Fiter.ai · Registrations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1">
            <Users size={12} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-300">{students.length}</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-slate-800/40">
        <div className="flex items-center gap-2 bg-slate-700/60 rounded-xl px-3 py-2.5 border border-slate-600/40">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder:text-slate-500 outline-none w-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-blue-400" size={28} />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-700/40 rounded-2xl p-4 text-red-300 text-xs">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">No students found.</div>
        )}
        {!loading && !error && filtered.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-white">{s.full_name}</p>
                <p className="text-[11px] text-slate-400">
                  {s.username ? `@${s.username}` : `ID: ${s.telegram_id}`}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${expColor(s.experience_level)}`}>
                {s.experience_level}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <Mail size={11} className="text-slate-500 shrink-0" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <Phone size={11} className="text-slate-500 shrink-0" />
                <span>{s.phone_number}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Calendar size={11} className="text-slate-500 shrink-0" />
                <span>{new Date(s.created_at).toLocaleString('en-ET', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function App() {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showAdmin, setShowAdmin] = useState(false);

  const currentUserId = tg?.initDataUnsafe?.user?.id || null;
  const isAdmin = currentUserId === ADMIN_TELEGRAM_ID;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    experience: '',
  });

  const [checking, setChecking] = useState(true);

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
      try {
        if (tg.requestFullscreen) tg.requestFullscreen();
        if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
      } catch (e) {
        console.warn('Fullscreen API not supported', e);
      }
      document.documentElement.style.setProperty('--tg-bg', tg.backgroundColor || '#0f172a');
      document.documentElement.style.setProperty('--tg-text', tg.textColor || '#f8fafc');
    }

    const checkRegistration = async () => {
      const userId = tg?.initDataUnsafe?.user?.id?.toString() || null;
      const storageKey = userId ? `fiter_registered_${userId}` : 'fiter_registered_guest';

      if (localStorage.getItem(storageKey) === 'true') {
        if (userId) {
          try {
            const res = await fetch(`/api/check?telegram_id=${userId}`);
            const data = await res.json();
            if (data.registered) {
              setRegistered(true);
            } else {
              localStorage.removeItem(storageKey);
              setRegistered(false);
            }
          } catch (e) {
            console.error('Failed to check registration:', e);
            // If API fails (e.g., offline), default to allowing them in
            setRegistered(true);
          }
        } else {
          setRegistered(true);
        }
      }
      setChecking(false);
    };

    checkRegistration();
  }, []);

  const markRegistered = () => {
    const userId = tg?.initDataUnsafe?.user?.id?.toString() || null;
    const storageKey = userId ? `fiter_registered_${userId}` : 'fiter_registered_guest';
    localStorage.setItem(storageKey, 'true');
    setRegistered(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
        <p className="text-slate-400 text-sm font-medium">Loading...</p>
      </div>
    );
  }

  if (registered) {
    return (
      <>
        <CountdownScreen />
        {isAdmin && (
          <>
            <button
              onClick={() => setShowAdmin(true)}
              className="fixed bottom-6 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 hover:bg-slate-800 active:scale-[0.97] transition-all"
            >
              <Shield size={14} className="text-blue-400" />
              Admin
            </button>
            <AnimatePresence>
              {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
            </AnimatePresence>
          </>
        )}
      </>
    );
  }

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
        markRegistered();
        if (tg) tg.HapticFeedback.notificationOccurred('success');
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 pb-4 pt-20 flex flex-col items-center justify-center overflow-x-hidden selection:bg-blue-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-orange-400/15 rounded-full blur-[80px]" />
      </div>

      <header className="w-full max-w-sm mb-6 text-center relative z-10">
        <motion.h1 
          className="text-4xl font-black mb-1 tracking-tighter"
        >
          <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase drop-shadow-sm">
            FITER.AI
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-bold tracking-[0.2em] text-blue-600/80 uppercase mb-4"
        >
          AI Engineering Masterclass: From Zero to AI Hero
        </motion.p>
        <div className="flex justify-center gap-1.5">
          <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === 1 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === 2 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200'}`} />
        </div>
      </header>

      <motion.div 
        layout
        className="w-full max-w-sm bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10"
      >
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

                <div className="flex justify-center items-start gap-6 py-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-18 h-18 rounded-full border-2 border-blue-200 p-1 bg-white overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)]" style={{width:'72px',height:'72px'}}>
                      <img 
                        src="/course_icon.png" 
                        alt="Prompt Engineering" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-blue-700 tracking-[0.12em] uppercase text-center max-w-[72px]">
                      Prompt Engineering
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="rounded-full border-2 border-orange-200 p-1 bg-white overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.15)]" style={{width:'72px',height:'72px'}}>
                      <img 
                        src="/ai_web_dev_icon.png" 
                        alt="AI Web & App Development" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-orange-600 tracking-[0.12em] uppercase text-center max-w-[72px]">
                      AI Web & App Dev
                    </p>
                  </div>
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
      <footer className="mt-auto py-8 text-center relative z-10">
        <p className="text-slate-400 text-sm flex items-center gap-2">
          Secure Registration • Powered by Fiter.ai
        </p>
      </footer>

      {/* Admin button - only visible to admin */}
      {isAdmin && (
        <>
          <button
            onClick={() => setShowAdmin(true)}
            className="fixed bottom-6 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 hover:bg-slate-800 active:scale-[0.97] transition-all"
          >
            <Shield size={14} className="text-blue-400" />
            Admin
          </button>
          <AnimatePresence>
            {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;
