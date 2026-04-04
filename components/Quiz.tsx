
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onCancel: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const isCorrect = selected === current?.correctAnswerIndex;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === current.correctAnswerIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const passed = score >= questions.length * 0.7;
    return (
      <div className="cyber-panel p-8 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-700">
        <div className={`w-16 md:w-24 h-16 md:h-24 rounded-full mx-auto mb-6 md:mb-10 flex items-center justify-center text-2xl md:text-4xl shadow-2xl ${passed ? 'bg-cyber-lime text-black shadow-cyber-lime/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
          <i className={`fa-solid ${passed ? 'fa-star' : 'fa-rotate-right'}`}></i>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tighter">
          {passed ? 'Level Passed! 🎉' : 'Keep Practising!'}
        </h2>
        <p className="text-slate-400 mb-4 text-sm md:text-lg font-medium leading-relaxed">
          You got <span className="text-white font-bold">{score} out of {questions.length}</span> correct.
          {passed
            ? ' Great work! You\'ve unlocked the next level.'
            : ' You need 70% to pass. Review the lesson and try again.'}
        </p>

        {/* Score bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8 md:mb-12">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${passed ? 'bg-cyber-lime' : 'bg-rose-500'}`}
            style={{ width: `${(score / questions.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => onComplete(score, questions.length)} className="flex-1 py-4 md:py-5 bg-cyber-lime text-black font-bold uppercase tracking-widest text-[8px] md:text-xs rounded-xl md:rounded-2xl hover:scale-[1.02] transition-all">
            {passed ? 'Continue →' : 'See Results Anyway'}
          </button>
          {!passed && (
            <button onClick={onCancel} className="flex-1 py-4 md:py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[8px] md:text-xs rounded-xl md:rounded-2xl hover:bg-white/10">
              Go Back &amp; Review
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 md:mb-12">
        <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          Question {currentIndex + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-24 md:w-32 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-lime transition-all duration-700" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="text-[9px] font-bold text-slate-500">{score} ✓</span>
        </div>
      </div>

      <h3 className="text-xl md:text-3xl font-bold text-white mb-8 md:mb-10 tracking-tight leading-tight">
        {current.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
        {current.options.map((opt, i) => {
          let state = 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-slate-300';
          if (showExplanation) {
            if (i === current.correctAnswerIndex) state = 'bg-cyber-lime/10 border-cyber-lime text-cyber-lime';
            else if (i === selected) state = 'bg-rose-500/10 border-rose-500 text-rose-400';
            else state = 'opacity-30 border-white/5 text-slate-600';
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showExplanation}
              className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-300 font-semibold text-sm md:text-base flex justify-between items-center gap-3 ${state}`}
            >
              <span>{opt}</span>
              {showExplanation && i === current.correctAnswerIndex && (
                <i className="fa-solid fa-circle-check text-cyber-lime flex-shrink-0"></i>
              )}
              {showExplanation && i === selected && i !== current.correctAnswerIndex && (
                <i className="fa-solid fa-circle-xmark text-rose-400 flex-shrink-0"></i>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`mb-8 md:mb-10 animate-in slide-in-from-top-2 duration-400 p-5 md:p-6 rounded-[1.5rem] border ${
          isCorrect ? 'bg-cyber-lime/5 border-cyber-lime/20' : 'bg-rose-500/5 border-rose-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <i className={`fa-solid ${isCorrect ? 'fa-lightbulb text-cyber-lime' : 'fa-triangle-exclamation text-rose-400'} text-sm`}></i>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isCorrect ? 'text-cyber-lime' : 'text-rose-400'}`}>
              {isCorrect ? 'Correct!' : `Not quite. The correct answer is: ${current.options[current.correctAnswerIndex]}`}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">{current.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!showExplanation}
          className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-white text-black font-bold uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-xl"
        >
          {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <i className="fa-solid fa-chevron-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default Quiz;
