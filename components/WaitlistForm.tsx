import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, getCountFromServer, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // shared (default) database instance

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const snap = await getCountFromServer(collection(db, 'waitlist'));
        const real = snap.data().count;
        setCount(real > 0 ? real : 142);
      } catch (err) {
        console.error('Failed to fetch waitlist count', err);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed) || trimmed.length > 254) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Duplicate check
      console.log('[WaitlistForm] Checking for duplicate email in waitlist (DEFAULT db)...');
      const q = query(collection(db, 'waitlist'), where('email', '==', trimmed));
      const existing = await getDocs(q);
      if (!existing.empty) {
        console.log('[WaitlistForm] Duplicate found — not writing');
        setStatus('error');
        setErrorMessage("You're already on the list!");
        return;
      }

      console.log('[WaitlistForm] WRITE → waitlist (addDoc, DEFAULT db)', { email: trimmed });
      await addDoc(collection(db, 'waitlist'), {
        email: trimmed,
        createdAt: serverTimestamp(),
      });
      console.log('[WaitlistForm] WRITE ✓ waitlist success');

      setStatus('success');
      if (count !== null) setCount(count + 1);

      setTimeout(() => {
        window.history.pushState({}, '', `/signup?email=${encodeURIComponent(trimmed)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 2000);
    } catch (error: any) {
      console.error('[WaitlistForm] WRITE ✗ waitlist failed', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to join waitlist. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4" id="waitlist">
      {status === 'success' ? (
        <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You're in!</h3>
          <p className="text-slate-400">Setting up your account...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative flex flex-col sm:block items-center gap-3 sm:gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={status === 'loading'}
              className="w-full px-6 sm:pl-6 sm:pr-[140px] py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 text-center sm:text-left"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 mt-2 sm:mt-0 px-6 py-4 sm:py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:hover:bg-blue-500 flex items-center justify-center min-w-[120px]"
            >
              {status === 'loading' ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Join Waitlist'
              )}
            </button>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-sm text-center animate-in slide-in-from-top-2">{errorMessage}</p>
          )}

          <div className="text-center mt-2 flex flex-col gap-2">
            <p className="text-sm text-slate-500">
              {count !== null ? (
                <>Join <span className="text-hyper-gold font-semibold">{count.toLocaleString()}</span> others on the waitlist</>
              ) : (
                <span className="opacity-0">Loading count...</span>
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/signup');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              Skip waitlist and launch app
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WaitlistForm;
