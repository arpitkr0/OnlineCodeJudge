import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HardDrive, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';

const TOPIC_METADATA = {
  "Watermelon": { tags: ["Math", "Parity", "Number Theory"], acc: "64.2%" },
  "Team": { tags: ["Greedy", "Bit Manipulation"], acc: "71.5%" },
  "Bit++": { tags: ["Implementation", "Simulation"], acc: "82.1%" },
  "Two Sum": { tags: ["Array", "Hash Table"], acc: "53.4%" },
  "Coin Change": { tags: ["Dynamic Programming", "BFS"], acc: "41.8%" },
  "Number of Islands": { tags: ["Graph", "DFS", "BFS"], acc: "56.3%" },
  "Maximum Depth of Binary Tree": { tags: ["Tree", "DFS", "Binary Tree"], acc: "74.6%" },
};

const ProblemCard = ({ problem, index, solved = false }) => {
  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case 'EASY':
        return 'bg-verdict-pass/15 text-verdict-pass border-verdict-pass/30';
      case 'MEDIUM':
        return 'bg-amber-accent/15 text-amber-accent border-amber-accent/30';
      case 'HARD':
        return 'bg-verdict-fail/15 text-verdict-fail border-verdict-fail/30';
      default:
        return 'bg-surface-border text-text-muted border-surface-border';
    }
  };

  const meta = TOPIC_METADATA[problem.title] || {
    tags: ["Algorithm", "Sandbox"],
    acc: problem.difficulty === 'EASY' ? "68.4%" : problem.difficulty === 'MEDIUM' ? "45.2%" : "24.7%"
  };

  return (
    <Link
      to={`/problems/${problem.id}`}
      className="group block bg-surface border border-surface-border rounded-xl p-6 hover:-translate-y-1 hover:border-amber-accent/40 hover:bg-[#151A24] transition-all duration-300 ease-out glow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          {/* Index ID Box - High end terminal styling */}
          <div className="w-10 h-10 rounded-lg bg-base border border-surface-border flex items-center justify-center font-mono font-bold text-text-muted text-xs group-hover:text-amber-accent group-hover:border-amber-accent/40 transition-colors shrink-0">
            #{String(index + 1).padStart(2, '0')}
          </div>

          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1.5">
              <h3 className="text-base font-mono font-bold text-text-primary group-hover:text-amber-accent transition-colors duration-200">
                {problem.title}
              </h3>
              {solved && (
                <span className="flex items-center gap-1 bg-verdict-pass/15 text-verdict-pass text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-verdict-pass/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Solved
                </span>
              )}
            </div>

            {/* Topic Tag Pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mono">
              {meta.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-base/80 text-text-muted text-[11px] px-2 py-0.5 rounded border border-surface-border group-hover:border-surface-hover transition-colors"
                >
                  {tag}
                </span>
              ))}
              <span className="text-text-dim text-[11px] ml-1">
                // {meta.acc} Acc
              </span>
            </div>

            <p className="mt-3 text-sm text-text-muted line-clamp-2 leading-relaxed font-sans">
              {problem.description ? problem.description.replace(/<[^>]*>?/gm, '') : 'Deconstruct and compile an optimal algorithmic resolution within the sandbox execution parameters.'}
            </p>
          </div>
        </div>

        {/* Difficulty Badge */}
        <span
          className={`shrink-0 px-3 py-1 rounded text-[10px] font-mono font-bold tracking-wider border uppercase ${getDifficultyStyles(
            problem.difficulty
          )}`}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* Footer Technical Specs */}
      <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-xs text-text-muted font-mono">
        <div className="flex items-center space-x-5">
          <span className="flex items-center space-x-1.5" title="Time Execution Limit">
            <Clock className="w-3.5 h-3.5 text-text-dim" />
            <span className="text-text-primary font-semibold">{problem.timeLimitMs}ms</span>
          </span>
          <span className="flex items-center space-x-1.5" title="Memory Allocation Limit">
            <HardDrive className="w-3.5 h-3.5 text-text-dim" />
            <span className="text-text-primary font-semibold">{problem.memoryLimitMb}MB</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-amber-accent font-mono font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span>SOLVE CHALLENGE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
};

export default ProblemCard;
