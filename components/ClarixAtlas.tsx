
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TOPICS } from '../constants';
import { UserProgress, Difficulty } from '../types';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.BASIC]:       'Level 1: Beginner',
  [Difficulty.FUNDAMENTAL]: 'Level 2: Practical',
  [Difficulty.MID]:         'Level 3: Intermediate',
  [Difficulty.PRO]:         'Level 4: Advanced',
};

const LEVEL_ICONS: Record<Difficulty, string> = {
  [Difficulty.BASIC]:       'fa-seedling',
  [Difficulty.FUNDAMENTAL]: 'fa-graduation-cap',
  [Difficulty.MID]:         'fa-chart-line',
  [Difficulty.PRO]:         'fa-crown',
};

interface ClarixAtlasProps {
  progress: UserProgress;
  onSelectTopic: (id: string) => void;
}

const ClarixAtlas: React.FC<ClarixAtlasProps> = ({ progress, onSelectTopic }) => {
  // Track which topic IDs were previously unlocked so we can animate newly unlocked ones
  const prevUnlockedRef = useRef<Set<string>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentlyUnlocked = new Set<string>(
      TOPICS.filter((t, i) => i === 0 || progress.completedTopics.includes(TOPICS[i - 1].id)).map(t => t.id)
    );

    const justUnlocked = new Set<string>();
    currentlyUnlocked.forEach(id => {
      if (!prevUnlockedRef.current.has(id)) justUnlocked.add(id);
    });

    if (justUnlocked.size > 0) {
      setNewlyUnlocked(justUnlocked);
      // Clear highlight after animation
      setTimeout(() => setNewlyUnlocked(new Set()), 3000);
    }

    prevUnlockedRef.current = currentlyUnlocked;
  }, [progress.completedTopics]);

  const overallPct = Math.round((progress.completedTopics.length / TOPICS.length) * 100);

  return (
    <div className="mb-12 md:mb-24 py-8 md:py-10 px-6 md:px-10 rounded-[2rem] md:rounded-[3.5rem] bg-surface border border-white/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-cyber-lime/5 blur-[80px] md:blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Your Learning Path</h3>
          <p className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic">Knowledge Atlas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Overall</p>
            <p className="text-lg font-black text-white">{overallPct}%</p>
          </div>
          <div className="w-20 h-20 relative flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                stroke="#6366F1" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${overallPct} 100`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">{progress.completedTopics.length}/{TOPICS.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-8 md:mb-10">
        <div className="h-full bg-cyber-lime rounded-full transition-all duration-1000" style={{ width: `${overallPct}%` }} />
      </div>

      {/* Topic cards */}
      <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-6">
        {/* Connector line */}
        <svg className="absolute top-1/2 left-0 w-full h-1 hidden md:block opacity-10 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
          <line x1="0" y1="0" x2="100%" y2="0" stroke="#6366F1" strokeWidth="2" strokeDasharray="8,8" />
        </svg>

        {TOPICS.map((topic, i) => {
          const isUnlocked = i === 0 || progress.completedTopics.includes(TOPICS[i - 1].id);
          const isCompleted = progress.completedTopics.includes(topic.id);
          const isCurrent = progress.currentTopicId === topic.id;
          const isNew = newlyUnlocked.has(topic.id);

          const completedSubtopicsInTopic = topic.subtopics.filter(s =>
            progress.completedSubtopics.includes(s.id)
          ).length;
          const lessonPct = Math.round((completedSubtopicsInTopic / topic.subtopics.length) * 100);

          return (
            <motion.div
              key={topic.id}
              layout
              initial={false}
              animate={isNew ? {
                scale: [1, 1.04, 1],
                boxShadow: ['0 0 0 0 rgba(99,102,241,0.2)', '0 0 0 8px rgba(99,102,241,0.2)', '0 0 0 0 rgba(99,102,241,0.2)'],
              } : {}}
              transition={{ duration: 0.7 }}
              className="relative z-10 flex-1"
            >
              <button
                disabled={!isUnlocked}
                onClick={() => onSelectTopic(topic.id)}
                className={`w-full h-full p-5 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-500 flex flex-col gap-3 text-left group ${
                  isCompleted ? 'bg-cyber-lime/8 border-cyber-lime/35' :
                  isCurrent   ? 'bg-white/8 border-white/25 shadow-xl shadow-white/5' :
                  isNew       ? 'bg-cyber-lime/5 border-cyber-lime/30' :
                  isUnlocked  ? 'bg-white/[0.02] border-white/8 hover:border-white/25 hover:bg-white/[0.05]' :
                                'bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
                }`}
              >
                {/* Icon + level label row */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-lg transition-all duration-500 ${
                    isCompleted ? 'bg-cyber-lime text-white' :
                    isCurrent   ? 'bg-white text-black animate-pulse' :
                    isNew       ? 'bg-cyber-lime/20 text-cyber-lime' :
                                  'bg-white/5 text-slate-500 group-hover:text-white'
                  }`}>
                    <i className={`fa-solid ${isCompleted ? 'fa-check' : LEVEL_ICONS[topic.difficulty]}`}></i>
                  </div>
                  {isNew && (
                    <span className="text-[8px] font-black text-cyber-lime uppercase tracking-widest animate-bounce">
                      Unlocked!
                    </span>
                  )}
                  {isCurrent && !isNew && (
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[8px] font-black text-cyber-lime uppercase tracking-widest">
                      ✓ Done
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <span className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">
                    {DIFFICULTY_LABELS[topic.difficulty]}
                  </span>
                  <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-tight leading-snug">
                    {topic.title}
                  </h4>
                </div>

                {/* Lesson progress bar */}
                {isUnlocked && (
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                        {completedSubtopicsInTopic}/{topic.subtopics.length} lessons
                      </span>
                      <span className="text-[8px] font-bold text-slate-500">{lessonPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-cyber-lime' : 'bg-white/40'}`}
                        style={{ width: `${lessonPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Locked badge */}
                {!isUnlocked && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded-full text-[7px] font-black text-rose-400 uppercase tracking-widest whitespace-nowrap">
                    <i className="fa-solid fa-lock mr-1 text-[6px]"></i>Complete previous level first
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ClarixAtlas;
