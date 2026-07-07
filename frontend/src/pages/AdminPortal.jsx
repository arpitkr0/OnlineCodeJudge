import React, { useState } from 'react';
import { problemsAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Plus, Terminal, Clock, HardDrive, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

const AdminPortal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  
  // Test cases array
  const [testCases, setTestCases] = useState([
    { input: '1 2', expectedOutput: '3', hidden: false },
    { input: '10 20', expectedOutput: '30', hidden: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', hidden: true }]);
  };

  const handleRemoveTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Create Problem
      const res = await problemsAPI.create({
        title,
        description,
        difficulty,
        timeLimitMs: Number(timeLimitMs),
        memoryLimitMb: Number(memoryLimitMb)
      });
      const newProblem = res.data;

      // 2. Add Test Cases
      for (const tc of testCases) {
        if (tc.input && tc.expectedOutput) {
          // Note: our backend endpoint is POST /api/problems/{id}/testcases with { input, expectedOutput, hidden }
          await problemsAPI.createTestCase ? problemsAPI.createTestCase(newProblem.id, tc) : null;
        }
      }

      setSuccess(`Problem "${newProblem.title}" (#${newProblem.id}) created successfully!`);
      setTimeout(() => {
        navigate(`/problems/${newProblem.id}`);
      }, 1500);

    } catch (err) {
      console.error('Error creating problem:', err);
      setError(err.response?.data?.message || 'Failed to create problem. Verify you have ADMIN authorities.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create New Challenge</h1>
        </div>
        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-rose-950/40 border border-rose-500/40 text-rose-300 p-4 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Problem Details */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>Problem Specification</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Challenge Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reverse Linked List"
                className="w-full px-4 py-2.5 bg-dark-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty Level *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Problem Description (Markdown Supported) *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide problem statement, input constraints, and expected format..."
              className="w-full px-4 py-3 bg-dark-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Time Limit (ms)</span>
              </label>
              <input
                type="number"
                min={500}
                max={10000}
                step={100}
                value={timeLimitMs}
                onChange={(e) => setTimeLimitMs(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-slate-700/80 rounded-xl text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>Memory Limit (MB)</span>
              </label>
              <input
                type="number"
                min={64}
                max={1024}
                step={32}
                value={memoryLimitMb}
                onChange={(e) => setMemoryLimitMb(e.target.value)}
                className="w-full px-4 py-2 bg-dark-900 border border-slate-700/80 rounded-xl text-sm text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Test Cases Specification */}
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Test Cases Suite</h2>
              <p className="text-xs text-slate-400 mt-0.5">Include public sample tests and private hidden tests for evaluation</p>
            </div>
            <button
              type="button"
              onClick={handleAddTestCase}
              className="px-3.5 py-1.5 bg-dark-700 hover:bg-dark-600 text-cyan-400 font-bold text-xs rounded-xl border border-slate-600 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Test Case</span>
            </button>
          </div>

          <div className="space-y-4">
            {testCases.map((tc, idx) => (
              <div key={idx} className="bg-dark-900/80 p-4 rounded-2xl border border-slate-800 space-y-4 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono">Test Case #{idx + 1}</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.hidden}
                        onChange={(e) => handleTestCaseChange(idx, 'hidden', e.target.checked)}
                        className="rounded bg-dark-950 border-slate-700 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className={tc.hidden ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                        {tc.hidden ? 'Hidden Test Case' : 'Public Sample'}
                      </span>
                    </label>

                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-slate-500 hover:text-rose-400 text-xs font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">Input (stdin)</label>
                    <textarea
                      rows={2}
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                      placeholder="e.g. 5&#10;1 2 3 4 5"
                      className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">Expected Output (stdout)</label>
                    <textarea
                      rows={2}
                      value={tc.expectedOutput}
                      onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl text-sm font-extrabold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
            loading
              ? 'bg-slate-700 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:opacity-95 shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.01]'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Problem & Seeding Test Cases...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Publish Challenge to Judge</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default AdminPortal;
