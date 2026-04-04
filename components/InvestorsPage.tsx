import React from 'react';
import { motion } from 'motion/react';

const FadeIn: React.FC<{ children: React.ReactNode, delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const InvestorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-hyper-gold/30">
      {/* 1. HERO */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-white to-white pointer-events-none"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs sm:text-sm tracking-widest uppercase mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-hyper-gold animate-pulse"></span>
              Investor Relations
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
              Built for the next billion <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-hyper-gold">crypto users</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Clarix Protocol is an AI-powered crypto intelligence platform that makes digital finance accessible to everyone, from first-time investors to seasoned traders.
            </p>
            <a href="#" className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold text-white transition-all bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1">
              Download Pitch Deck
              <i className="fa-solid fa-arrow-down ml-3"></i>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">
              Crypto is powerful. <br className="hidden sm:block" />
              <span className="text-hyper-gold">But most people can't use it.</span>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'fa-users-slash', text: '420M+ crypto users worldwide, yet 80% quit within 3 months' },
              { icon: 'fa-brain', text: 'Complex jargon and overwhelming data drive beginners away' },
              { icon: 'fa-bridge-water', text: 'No single platform bridges the gap between newbies and pros' }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 h-full border border-slate-100 hover:border-amber-200 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-hyper-gold flex items-center justify-center text-2xl mb-8 border border-amber-100">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR SOLUTION */}
      <section className="py-24 bg-white px-4 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">
              Clarix makes crypto intelligence <span className="text-hyper-gold">clear</span>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Smart Signals', desc: 'AI reads the market and tells you what matters', icon: 'fa-wand-magic-sparkles' },
              { title: 'Newbie Mode', desc: 'Plain English explanations for every term and metric', icon: 'fa-graduation-cap' },
              { title: 'Intelligence Tiers', desc: 'From free insights to professional-grade analysis', icon: 'fa-layer-group' },
              { title: 'Decentralized Identity', desc: 'Clarix uses decentralized identity. Your data belongs to you, not us.', icon: 'fa-fingerprint' }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-slate-50 p-8 md:p-10 rounded-[2rem] border border-slate-200 h-full hover:bg-slate-900 hover:border-slate-900 transition-colors group">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl mb-8 group-hover:bg-hyper-gold transition-colors shadow-md">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-white transition-colors">{item.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MARKET OPPORTUNITY */}
      <section className="py-24 bg-slate-900 text-white px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-hyper-gold/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 tracking-tight">
              A <span className="text-hyper-gold">$3B+</span> market growing 18% annually
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'TAM', value: '$3.2B', desc: 'Global crypto analytics market' },
              { label: 'SAM', value: '$480M', desc: 'Retail crypto intelligence tools' },
              { label: 'SOM', value: '$24M', desc: 'Target in first 3 years' }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-slate-800/40 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-slate-700 text-center h-full hover:border-hyper-gold/50 transition-colors">
                  <div className="text-sm font-black text-hyper-gold tracking-widest uppercase mb-4">{item.label}</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{item.value}</div>
                  <p className="text-slate-400 text-lg font-medium">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRACTION & GRANTS */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">
              Early <span className="text-hyper-gold">momentum</span> & Grants
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: 'Waitlist signups growing steadily', icon: 'fa-users' },
              { text: 'MVP live at clarixprotocol.com', icon: 'fa-rocket' },
              { text: 'Targeting Web3 Ecosystem Grants (Arbitrum, Optimism)', icon: 'fa-hand-holding-dollar' }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col items-center text-center gap-6 h-full hover:-translate-y-1 transition-transform">
                  <div className="w-20 h-20 rounded-full bg-amber-50 text-hyper-gold flex items-center justify-center text-3xl shrink-0 border border-amber-100">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOUNDER */}
      <section className="py-24 bg-white px-4 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">The Team</h2>
            <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-200 flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-shadow">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-200 border-4 border-white shadow-xl overflow-hidden shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jude" alt="Jude Baraka" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Jude Baraka</h3>
                <p className="text-hyper-gold font-bold tracking-widest uppercase text-sm mb-6">Founder & CEO, Colteum Limited</p>
                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed italic font-medium">
                  "Building Clarix to democratize crypto intelligence for the next billion users."
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 7. THE ASK */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl shadow-slate-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-hyper-gold/10 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10 tracking-tight">Funding Strategy</h2>
              <p className="text-slate-300 text-lg md:text-xl mb-16 relative z-10 max-w-2xl mx-auto">
                We are pursuing a hybrid capital strategy, leveraging Web3 ecosystem grants to minimize dilution while raising a strategic seed round to accelerate growth.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-slate-700 hover:border-hyper-gold/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-hyper-gold/20 flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-hand-holding-dollar text-hyper-gold text-xl"></i>
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Targeting Non-Dilutive Grants</p>
                  <p className="text-4xl md:text-5xl font-black text-hyper-gold tracking-tight">$50,000+</p>
                  <p className="text-slate-400 text-sm mt-4">Via Arbitrum, Optimism RetroPGF, and Solana Foundation</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] border border-slate-700 hover:border-blue-500/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-seedling text-blue-500 text-xl"></i>
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Strategic Seed Round</p>
                  <p className="text-4xl md:text-5xl font-black text-white tracking-tight">$150,000</p>
                  <p className="text-slate-400 text-sm mt-4">For core team expansion and user acquisition</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <a href="mailto:clarixprotocol@gmail.com" className="w-full sm:w-auto px-10 py-5 bg-hyper-gold hover:bg-amber-400 text-slate-900 font-extrabold text-lg rounded-full transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-1">
                  Discuss Investment
                </a>
                <a href="#" className="w-full sm:w-auto px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-lg rounded-full transition-all border border-white/10 hover:-translate-y-1">
                  View Grant Proposals
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-16 bg-white border-t border-slate-100 text-center px-4">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-md">
          <i className="fa-solid fa-chart-pie text-hyper-gold text-2xl"></i>
        </div>
        <p className="text-slate-900 font-extrabold text-2xl mb-2 tracking-tight">Clarix Protocol</p>
        <p className="text-slate-500 font-medium mb-6">clarixprotocol.com</p>
        <a href="mailto:clarixprotocol@gmail.com" className="inline-flex items-center gap-2 text-hyper-gold hover:text-amber-600 font-bold transition-colors bg-amber-50 px-6 py-3 rounded-full">
          <i className="fa-regular fa-envelope"></i>
          clarixprotocol@gmail.com
        </a>
      </footer>
    </div>
  );
};

export default InvestorsPage;
