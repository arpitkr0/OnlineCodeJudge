import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Cpu, Loader2, ServerCrash, Zap } from 'lucide-react';

const VerdictBadge = ({ status, size = 'md', pulse = true }) => {
  const getBadgeConfig = (s) => {
    switch (s) {
      case 'ACCEPTED':
        return {
          label: 'Accepted',
          icon: CheckCircle2,
          bg: 'bg-verdict-pass/15',
          text: 'text-verdict-pass',
          border: 'border-verdict-pass/40',
          glow: 'shadow-verdict-pass/20 shadow-md',
        };
      case 'WRONG_ANSWER':
        return {
          label: 'Wrong Answer',
          icon: XCircle,
          bg: 'bg-verdict-fail/15',
          text: 'text-verdict-fail',
          border: 'border-verdict-fail/40',
          glow: 'shadow-verdict-fail/20 shadow-sm',
        };
      case 'TIME_LIMIT_EXCEEDED':
        return {
          label: 'Time Limit Exceeded (TLE)',
          icon: Clock,
          bg: 'bg-amber-accent/15',
          text: 'text-amber-accent',
          border: 'border-amber-accent/40',
          glow: 'shadow-amber-accent/10 shadow-sm',
        };
      case 'MEMORY_LIMIT_EXCEEDED':
        return {
          label: 'Memory Limit Exceeded (MLE)',
          icon: Cpu,
          bg: 'bg-amber-600/15',
          text: 'text-amber-400',
          border: 'border-amber-600/40',
          glow: 'shadow-amber-600/10 shadow-sm',
        };
      case 'COMPILATION_ERROR':
        return {
          label: 'Compilation Error (CE)',
          icon: AlertTriangle,
          bg: 'bg-verdict-fail/15',
          text: 'text-verdict-fail',
          border: 'border-verdict-fail/40',
          glow: 'shadow-verdict-fail/10 shadow-sm',
        };
      case 'RUNTIME_ERROR':
        return {
          label: 'Runtime Error (RE)',
          icon: Zap,
          bg: 'bg-verdict-fail/15',
          text: 'text-verdict-fail',
          border: 'border-verdict-fail/40',
          glow: 'shadow-verdict-fail/10 shadow-sm',
        };
      case 'SYSTEM_ERROR':
        return {
          label: 'System Infrastructure Error',
          icon: ServerCrash,
          bg: 'bg-surface border',
          text: 'text-text-muted',
          border: 'border-surface-border',
          glow: 'shadow-sm',
        };
      case 'RUNNING':
        return {
          label: 'Running in Sandbox...',
          icon: Loader2,
          bg: 'bg-amber-accent/15',
          text: 'text-amber-accent',
          border: 'border-amber-accent/40',
          glow: 'shadow-amber-accent/20 shadow-md',
          animate: 'animate-spin',
        };
      case 'PENDING':
      default:
        return {
          label: 'Queued in Kafka...',
          icon: Loader2,
          bg: 'bg-surface',
          text: 'text-text-muted',
          border: 'border-surface-border',
          glow: 'shadow-sm',
          animate: 'animate-spin',
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-xs font-bold gap-1.5',
    lg: 'px-4 py-1.5 text-sm font-extrabold gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-mono ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses} transition-all duration-200 ${
        pulse && (status === 'RUNNING' || status === 'PENDING') ? 'animate-pulse' : ''
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.animate || ''}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default VerdictBadge;
