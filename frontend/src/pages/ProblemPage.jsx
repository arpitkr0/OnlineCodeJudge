import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemsAPI, submissionsAPI } from '../services/api';
import wsService from '../services/websocket';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import VerdictBadge from '../components/VerdictBadge';
import VerdictDetailCard from '../components/VerdictDetailCard';
import { useAuth } from '../context/AuthContext';
import {
  Play, Send, RotateCcw, Clock, HardDrive, ArrowLeft, Terminal,
  CheckCircle2, AlertCircle, Loader2, Sparkles, Code2, BookOpen, Layers,
  Lightbulb, ShieldCheck, Zap
} from 'lucide-react';

const DEFAULT_BOILERPLATES = {
  JAVA: ``,
  PYTHON: ``,
  CPP: ``
};

const PROBLEM_TEMPLATES = {};

const PROBLEM_EDITORIALS = {
  "Watermelon": {
    title: "Even Number Parity Check & Edge Case Analysis",
    complexity: "Time: O(1) | Space: O(1)",
    explanation: "An even number W can be divided into two even positive integers A and B if and only if W is even and strictly greater than 2. Why? Because if W = A + B where A and B are positive even integers, their sum W must be even and at least 2 + 2 = 4. Conversely, if W is even and W >= 4, we can split it into 2 and W - 2, which are both positive even numbers!"
  },
  "Way Too Long Words": {
    title: "String Length Verification & Character Indexing",
    complexity: "Time: O(N) | Space: O(1)",
    explanation: "For each word, check its length L. If L <= 10, print the word as is. Otherwise, print the first character, followed by the integer (L - 2), followed by the last character."
  },
  "Team": {
    title: "Greedy Vote Counting",
    complexity: "Time: O(N) | Space: O(1)",
    explanation: "For each problem, sum up the three binary opinions (Petya, Vasya, Tonya). If the sum is >= 2, increment your total solved counter."
  },
  "Trapping Rain Water": {
    title: "Two Pointers / Left-Right Prefix Max",
    complexity: "Time: O(N) | Space: O(1)",
    explanation: "Maintain two pointers (left = 0, right = n - 1) and variables maxLeft and maxRight. At each step, compare height[left] and height[right]. If height[left] <= height[right], update maxLeft and add (maxLeft - height[left]) to total water, then increment left. Otherwise do the symmetric operation on the right pointer."
  },
  "Bit++": {
    title: "String Substring Matching",
    complexity: "Time: O(N * L) | Space: O(1)",
    explanation: "Initialize X = 0. Loop through all N statements. If a statement contains the substring '++', increment X by 1. If it contains '--', decrement X by 1. Finally print X."
  }
};

const ProblemPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Editor State
  const [language, setLanguage] = useState('JAVA');
  const [code, setCode] = useState(DEFAULT_BOILERPLATES.JAVA);
  const [fontSize, setFontSize] = useState(14);
  
  // Verdict / Submission State
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'testcases' | 'verdict'
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchProblem();
    return () => {
      stopPolling();
      if (submission?.id) {
        wsService.unsubscribe(submission.id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (problem) {
      const template = PROBLEM_TEMPLATES[problem.title]?.[language] || DEFAULT_BOILERPLATES[language];
      setCode(template);
    }
  }, [problem]);

  const fetchProblem = async () => {
    setLoading(true);
    try {
      const res = await problemsAPI.getById(id);
      setProblem(res.data);
    } catch (err) {
      console.error('Error fetching problem:', err);
      setError('Problem not found or server is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    const currentDefault = PROBLEM_TEMPLATES[problem?.title]?.[language] || DEFAULT_BOILERPLATES[language];
    const nextDefault = PROBLEM_TEMPLATES[problem?.title]?.[newLang] || DEFAULT_BOILERPLATES[newLang];
    if (code === currentDefault) {
      setCode(nextDefault);
    }
    setLanguage(newLang);
  };

  const handleResetCode = () => {
    const defaultTemplate = PROBLEM_TEMPLATES[problem?.title]?.[language] || DEFAULT_BOILERPLATES[language];
    if (window.confirm(`Reset code to default ${language} template?`)) {
      setCode(defaultTemplate);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleVerdictReceived = (verdictData) => {
    setSubmission(verdictData);
    const isDone = verdictData.status !== 'PENDING' && verdictData.status !== 'RUNNING';
    if (isDone) {
      stopPolling();
      setSubmitting(false);
      if (verdictData.status === 'ACCEPTED') {
        triggerCelebration();
      }
    }
  };

  const handleSubmitCode = async (sampleOnly = false) => {
    if (!isAuthenticated) {
      alert('Please sign in or create an account to submit code to the Docker sandbox.');
      return;
    }
    if (!code.trim()) return;

    setSubmitting(true);
    setActiveTab('verdict');
    stopPolling();

    try {
      // 1. Submit code to Spring Boot API
      const res = await submissionsAPI.submit({
        problemId: Number(id),
        language: language,
        code: code,
        sampleOnly: typeof sampleOnly === 'boolean' ? sampleOnly : false
      });
      
      const initialSub = res.data;
      setSubmission(initialSub);

      // 2. Subscribe to real-time WebSocket topic
      wsService.subscribeToSubmission(initialSub.id, (realtimeVerdict) => {
        console.log('[WebSocket] Realtime verdict received:', realtimeVerdict);
        handleVerdictReceived(realtimeVerdict);
      });

      // 3. Fallback polling loop (every 1.5s in case WebSocket drops)
      pollingRef.current = setInterval(async () => {
        try {
          const pollRes = await submissionsAPI.getById(initialSub.id);
          const latest = pollRes.data;
          if (latest.status !== 'PENDING' && latest.status !== 'RUNNING') {
            handleVerdictReceived(latest);
          } else {
            setSubmission(latest);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 1500);

    } catch (err) {
      console.error('Submission error:', err);
      setSubmitting(false);
      setSubmission({
        status: 'SYSTEM_ERROR',
        errorMessage: err.response?.data?.message || 'Failed to submit code to backend server.'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-sm font-mono text-slate-400">Loading problem environment...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen p-8 bg-dark-900 flex items-center justify-center">
        <div className="max-w-md bg-dark-800 p-6 rounded-2xl border border-slate-800 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white">Problem Unavailable</h2>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Problem List
          </Link>
        </div>
      </div>
    );
  }

  const sampleTestCases = problem.testCases?.filter(tc => !tc.hidden) || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-dark-900 overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="h-14 border-b border-slate-800/80 bg-dark-800/60 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problems</span>
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold text-white">{problem.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase border ${
              problem.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              problem.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="flex items-center space-x-2 bg-dark-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="JAVA" className="bg-dark-900 text-white">Java (openjdk:17)</option>
              <option value="PYTHON" className="bg-dark-900 text-white">Python (3.11)</option>
              <option value="CPP" className="bg-dark-900 text-white">C++ (gcc:12)</option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-700 rounded-lg transition-colors"
            title="Reset to Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700" />

          {/* Run Sample Tests Button */}
          <button
            onClick={() => handleSubmitCode(true)}
            disabled={submitting}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              submitting
                ? 'bg-surface border border-surface-border text-text-muted cursor-not-allowed opacity-80'
                : 'bg-surface hover:bg-surface-light text-amber-accent border border-amber-accent/40 shadow-sm hover:border-amber-accent'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-amber-accent" />
                <span>Run Sample Tests</span>
              </>
            )}
          </button>

          {/* Submit Button */}
          <button
            onClick={() => handleSubmitCode(false)}
            disabled={submitting}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-extrabold flex items-center gap-2 transition-all ${
              submitting
                ? 'bg-surface border border-surface-border text-text-muted cursor-not-allowed opacity-80'
                : 'bg-amber-accent hover:bg-amber-400 text-ink shadow-[0_0_15px_rgba(232,184,92,0.3)] hover:shadow-[0_0_20px_rgba(232,184,92,0.45)] hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Judge</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* Left Pane: Description & Test Cases */}
        <div className="border-r border-slate-800/80 flex flex-col bg-dark-900/40 overflow-hidden">
          
          {/* Left Tabs Bar */}
          <div className="flex items-center space-x-1 px-4 pt-3 border-b border-slate-800/80 shrink-0 bg-dark-800/40">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'description'
                  ? 'border-cyan-500 text-cyan-400 bg-dark-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Description
            </button>
            <button
              onClick={() => setActiveTab('editorial')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'editorial'
                  ? 'border-cyan-500 text-cyan-400 bg-dark-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Editorial & Hints
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'testcases'
                  ? 'border-cyan-500 text-cyan-400 bg-dark-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Sample Tests ({sampleTestCases.length})
            </button>
            <button
              onClick={() => setActiveTab('verdict')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'verdict'
                  ? 'border-cyan-500 text-cyan-400 bg-dark-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Verdict Panel
              {submission && (
                <span className={`w-2 h-2 rounded-full ${
                  submission.status === 'ACCEPTED' ? 'bg-emerald-400 animate-pulse' :
                  submission.status === 'PENDING' || submission.status === 'RUNNING' ? 'bg-cyan-400 animate-ping' : 'bg-rose-400'
                }`} />
              )}
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {activeTab === 'description' && (
              <div className="space-y-6">
                {/* Limits Spec Box */}
                <div className="flex items-center space-x-6 text-xs font-mono bg-dark-800/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Time Limit: <strong>{problem.timeLimitMs} ms</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span>Memory Limit: <strong>{problem.memoryLimitMb} MB</strong></span>
                  </div>
                </div>

                {/* Problem Description Text */}
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed font-sans"
                     dangerouslySetInnerHTML={{ __html: problem.description }} />

                {/* Sample Test Cases Preview in Description */}
                {sampleTestCases.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-800/80">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Example Inputs & Outputs
                    </h4>
                    {sampleTestCases.map((tc, idx) => (
                      <div key={tc.id || idx} className="bg-dark-800/60 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
                        <div className="font-bold text-slate-400">Example {idx + 1}</div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 mb-1 font-sans font-bold">Input</div>
                          <div className="bg-dark-900 p-2.5 rounded-lg text-slate-200 border border-slate-800 whitespace-pre-wrap">{tc.input}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 mb-1 font-sans font-bold">Expected Output</div>
                          <div className="bg-dark-900 p-2.5 rounded-lg text-emerald-400 border border-slate-800 whitespace-pre-wrap">{tc.expectedOutput}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'editorial' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">JudgeX Algorithmic Editorial</h3>
                      <p className="text-[11px] text-slate-400">Verified optimal time & space complexity approach</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 bg-dark-800 rounded-lg text-cyan-400 border border-slate-800 font-bold">
                    {PROBLEM_EDITORIALS[problem.title]?.complexity || "Time: Optimal | Space: Optimal"}
                  </span>
                </div>

                <div className="bg-dark-800/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{PROBLEM_EDITORIALS[problem.title]?.title || "Optimal Algorithmic Approach"}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {PROBLEM_EDITORIALS[problem.title]?.explanation || "Write an optimal solution with appropriate time and space complexity that processes the standard input within the specified memory and runtime bounds."}
                  </p>
                </div>

                <div className="bg-dark-900/80 rounded-2xl p-5 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Why Heavy Stress Testing?</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    When you click <strong className="text-emerald-400">Submit to Judge</strong>, JudgeX evaluates your solution asynchronously against <strong>50+ heavy stress test cases</strong> inside isolated Docker containers. This ensures your code doesn't just pass trivial examples—it proves industry-grade performance under maximum constraint inputs!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Sample Evaluation Cases</h3>
                  <span className="text-xs text-slate-400">Hidden tests are evaluated securely in Docker</span>
                </div>
                {sampleTestCases.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm font-mono">No sample test cases provided.</div>
                ) : (
                  sampleTestCases.map((tc, idx) => (
                    <div key={tc.id || idx} className="bg-dark-800/80 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-3">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-cyan-400">Test Case #{idx + 1}</span>
                        <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-300">Public Sample</span>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 mb-1 font-sans uppercase font-bold">Standard Input (stdin)</div>
                        <div className="bg-dark-950 p-3 rounded-lg text-slate-200 border border-slate-800/80 whitespace-pre-wrap">{tc.input}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 mb-1 font-sans uppercase font-bold">Expected Output (stdout)</div>
                        <div className="bg-dark-950 p-3 rounded-lg text-emerald-400 border border-slate-800/80 whitespace-pre-wrap">{tc.expectedOutput}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'verdict' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Docker Sandbox Evaluation Verdict</h3>
                    {submission && submission.sampleOnly && (
                      <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Sample Tests Only
                      </span>
                    )}
                  </div>
                  {submission && (
                    <span className="text-xs font-mono text-slate-400">ID: #{submission.id}</span>
                  )}
                </div>
                
                {!submission ? (
                  <div className="text-center py-20 bg-dark-800/30 rounded-2xl border border-slate-800/60 p-6">
                    <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-300">No submission evaluated yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Click the <strong className="text-emerald-400">Submit to Judge</strong> button to run your solution inside the sandboxed Docker worker pool.
                    </p>
                  </div>
                ) : (
                  <VerdictDetailCard
                    submission={submission}
                    onRetry={() => {
                      setActiveTab('description');
                    }}
                  />
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Pane: Monaco Editor */}
        <div className="flex flex-col bg-dark-950 overflow-hidden relative">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language.toLowerCase() === 'cpp' ? 'cpp' : language.toLowerCase()}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                padding: { top: 16 },
                lineNumbersMinChars: 3,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Quick Verdict Bar at bottom of editor */}
          {submission && activeTab !== 'verdict' && (
            <div
              onClick={() => setActiveTab('verdict')}
              className="h-12 bg-dark-800/90 backdrop-blur-md border-t border-slate-800 px-4 flex items-center justify-between cursor-pointer hover:bg-dark-800 transition-colors shrink-0"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-400">Latest Verdict:</span>
                <VerdictBadge status={submission.status} size="sm" />
              </div>
              <span className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                <span>View Full Diagnostics</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProblemPage;
