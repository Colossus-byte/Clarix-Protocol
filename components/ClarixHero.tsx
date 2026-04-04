import React from 'react';

const ClarixHero: React.FC = () => {
  const goToSignup = () => {
    window.history.pushState({}, '', '/signup');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-surface overflow-hidden font-sans">
      {/* Signal Pulse Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[300px] h-[300px] border border-blue-500/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute w-[500px] h-[500px] border border-blue-500/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-[700px] h-[700px] border border-blue-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full"></div>
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-surface to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-hyper-gold animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide uppercase">Clarix Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-6 leading-tight sm:leading-tight">
          Crypto intelligence, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">made clear.</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-medium px-2">
          Tired of endless jargon and confusing charts? Our AI translates complex market data into plain English, giving you the confidence to make your next move, whether it's your first trade or your thousandth.
        </p>

        {/* Single CTA */}
        <button
          onClick={goToSignup}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-base sm:text-lg font-black text-black uppercase tracking-widest rounded-full bg-gradient-to-r from-blue-500 to-cyber-lime hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <i className="fa-solid fa-rocket text-sm"></i>
          Launch App
          <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
        </button>

        <p className="mt-6 text-sm text-slate-600 font-medium">
          Free to start · Connect any wallet · No email required
        </p>
      </div>
    </section>
  );
};

export default ClarixHero;
