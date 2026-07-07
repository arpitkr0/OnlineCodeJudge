import React, { useState, useEffect } from 'react';
import { submissionsAPI } from '../services/api';
import VerdictBadge from '../components/VerdictBadge';
import { Link } from 'react-router-dom';
import { History, Clock, HardDrive, Cpu, Terminal, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await submissionsAPI.getMySubmissions(page, 15);
      const content = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setSubmissions(content);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || content.length);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError('Could not fetch your submission history. Please make sure you are logged in and backend is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative overflow-hidden">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6 animate-section-left relative z-10">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-4 h-4" />
            <span>Execution Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Submissions</h1>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Solve New Challenges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
          <p className="text-sm font-mono animate-pulse">Loading submission history from database...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-rose-400 mb-2">Error Loading History</h3>
          <p className="text-sm text-slate-300 mb-6">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-600/30"
          >
            Retry
          </button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 bg-dark-800/40 rounded-3xl border border-slate-800/60 max-w-2xl mx-auto">
          <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No submissions recorded yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Pick a coding challenge from the home page and run your solution in the Docker sandbox!
          </p>
          <Link
            to="/"
            className="mt-6 inline-block px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
          >
            Browse Problem List
          </Link>
        </div>
      ) : (
        <div className="bg-dark-800/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl glow-card relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-dark-900/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-4 px-6">ID #</th>
                  <th className="py-4 px-6">Problem Title</th>
                  <th className="py-4 px-6">Language</th>
                  <th className="py-4 px-6">Verdict</th>
                  <th className="py-4 px-6 text-right">Runtime</th>
                  <th className="py-4 px-6 text-right">Memory</th>
                  <th className="py-4 px-6 text-right">CPU</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {submissions.map((sub, index) => (
                  <tr key={sub.id} className="table-row-hover transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      #{totalElements ? totalElements - (page * 15) - index : sub.id}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">
                      <Link to={`/problems/${sub.problemId}`} className="hover:text-cyan-400 transition-colors">
                        {sub.problemTitle || `Problem #${sub.problemId}`}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-dark-900 border border-slate-700/80 text-xs font-mono font-bold text-slate-300">
                        {sub.language}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <VerdictBadge status={sub.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-xs text-slate-300">
                      {sub.runtimeMs !== null && sub.runtimeMs !== undefined ? `${sub.runtimeMs} ms` : '—'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-xs text-slate-300">
                      {sub.memoryMb !== null && sub.memoryMb !== undefined ? `${sub.memoryMb} MB` : '—'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-xs text-slate-300">
                      {sub.cpuUsage !== null && sub.cpuUsage !== undefined ? `${sub.cpuUsage}%` : '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/problems/${sub.problemId}`}
                        className="text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        Re-try
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-dark-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong></span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-700 text-slate-200 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-700 text-slate-200 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SubmissionHistory;
