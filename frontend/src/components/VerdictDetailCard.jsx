import React from 'react';
import VerdictBadge from './VerdictBadge';
import { Clock, Cpu, HardDrive, CheckCircle2, XCircle, AlertCircle, Terminal, RefreshCw } from 'lucide-react';

const VerdictDetailCard = ({ submission, onRetry }) => {
  if (!submission) return null;

  const { status, runtimeMs, memoryMb, cpuUsage, passedTestCases, totalTestCases, failedTestCase, errorMessage } = submission;
  const isPendingOrRunning = status === 'PENDING' || status === 'RUNNING';
  const isAccepted = status === 'ACCEPTED';
  const isError = !isAccepted && !isPendingOrRunning;

  return (
    <div className={`rounded-xl border transition-all duration-200 p-5 font-mono ${
      isAccepted
        ? 'bg-verdict-pass/10 border-verdict-pass/40 shadow-lg'
        : isPendingOrRunning
        ? 'bg-surface border-amber-accent/40 animate-pulse-slow'
        : 'bg-verdict-fail/10 border-verdict-fail/40 shadow-lg'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <VerdictBadge status={status} size="lg" />
          {isPendingOrRunning && (
            <span className="text-xs text-text-muted flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-accent" />
              Real-time WebSocket connection active
            </span>
          )}
        </div>

        {/* Real-time High Performance Evaluation Progress Bar */}
        {isPendingOrRunning && (
          <div className="w-full mt-3 bg-base p-4 rounded-xl border border-amber-accent/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-accent font-bold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>JudgeX Distributed Worker Arena Executing...</span>
              </span>
              <span className="text-text-primary font-bold">
                {passedTestCases ?? 0} / {totalTestCases > 0 ? totalTestCases : '50+'} Heavy Test Cases
              </span>
            </div>
            <div className="w-full h-2 bg-base rounded-full overflow-hidden border border-surface-border relative">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-accent rounded-full transition-all duration-200 animate-pulse"
                style={{ width: `${totalTestCases > 0 ? Math.max(10, ((passedTestCases ?? 0) / totalTestCases) * 100) : 40}%` }}
              />
            </div>
            <p className="text-[11px] text-text-muted font-sans italic text-center">
              Executing against maximum constraint inputs (N=10,000+), checking time limits & memory limits in isolated Docker sandbox...
            </p>
          </div>
        )}

        {/* Metrics Pill */}
        {!isPendingOrRunning && (
          <div className="flex items-center gap-4 text-xs bg-base px-3.5 py-2 rounded-xl border border-surface-border font-mono">
            <div className="flex items-center gap-1.5 text-text-muted" title="Execution Wall Time">
              <Clock className="w-3.5 h-3.5 text-amber-accent" />
              <span className="text-text-primary font-bold">{runtimeMs ?? 0} ms</span>
            </div>
            <div className="h-3 w-px bg-surface-border" />
            <div className="flex items-center gap-1.5 text-text-muted" title="Peak Memory Consumption">
              <HardDrive className="w-3.5 h-3.5 text-amber-accent" />
              <span className="text-text-primary font-bold">{memoryMb ?? 0} MB</span>
            </div>
            {cpuUsage !== null && cpuUsage !== undefined && (
              <>
                <div className="h-3 w-px bg-surface-border" />
                <div className="flex items-center gap-1.5 text-text-muted" title="Average CPU Usage">
                  <Cpu className="w-3.5 h-3.5 text-amber-accent" />
                  <span className="text-text-primary font-bold">{cpuUsage}% CPU</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Test Cases Counter */}
      {totalTestCases > 0 && !isPendingOrRunning && (
        <div className="mb-4 bg-base p-3.5 rounded-xl border border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isAccepted ? (
              <CheckCircle2 className="w-4 h-4 text-verdict-pass" />
            ) : (
              <XCircle className="w-4 h-4 text-verdict-fail" />
            )}
            <span className="text-xs font-bold text-text-primary font-sans">
              Test Cases Evaluation:
            </span>
          </div>
          <div className="text-xs font-mono font-bold">
            <span className={isAccepted ? 'text-verdict-pass' : 'text-verdict-fail'}>{passedTestCases ?? 0}</span>
            <span className="text-text-muted"> / </span>
            <span className="text-text-primary">{totalTestCases} Passed</span>
          </div>
        </div>
      )}

      {/* Error Message / Failed Test Case Detail */}
      {errorMessage && (
        <div className="mt-3 bg-base rounded-xl p-4 border border-verdict-fail/30 text-left font-mono text-xs overflow-x-auto">
          <div className="flex items-center space-x-2 text-verdict-fail font-bold mb-2 pb-2 border-b border-verdict-fail/20">
            <Terminal className="w-4 h-4" />
            <span>
              {failedTestCase ? `Failed on Test Case #${failedTestCase}` : 'Execution Diagnostic Output'}
            </span>
          </div>
          <pre className="text-text-primary whitespace-pre-wrap leading-relaxed font-mono">
            {errorMessage}
          </pre>
        </div>
      )}

      {/* Action Footer */}
      {isError && onRetry && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-surface hover:bg-surface-light text-text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-surface-border hover:border-amber-accent"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-accent" />
            Edit Code & Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default VerdictDetailCard;
