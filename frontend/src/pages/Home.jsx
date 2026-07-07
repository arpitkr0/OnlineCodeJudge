import React, { useState, useEffect } from 'react';
import { problemsAPI } from '../services/api';
import ProblemCard from '../components/ProblemCard';
import { Search, Terminal, Cpu, Zap, ShieldCheck, Filter, Loader2, Plus, Trophy, Activity, Layers, Play, CheckCircle2, XCircle, RotateCcw, Clock, HardDrive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_SNIPPETS = {
  JAVA: `import java.util.*;

public class Solution {
    public static long solveTrap(int[] height) {
        // Two-pointer O(1) space optimization
        int left = 0, right = height.length - 1;
        int maxLeft = 0, maxRight = 0;
        long totalWater = 0;

        while (left <= right) {
            if (height[left] <= height[right]) {
                if (height[left] >= maxLeft) maxLeft = height[left];
                else totalWater += maxLeft - height[left];
                left++;
            } else {
                if (height[right] >= maxRight) maxRight = height[right];
                else totalWater += maxRight - height[right];
                right--;
            }
        }
        return totalWater;
    }
}`,
  PYTHON: `import sys

def solve_trap(height: list[int]) -> int:
    # Two-pointer O(1) space optimization
    if not height:
        return 0
    left, right = 0, len(height) - 1
    max_left, max_right = 0, 0
    total_water = 0

    while left <= right:
        if height[left] <= height[right]:
            if height[left] >= max_left:
                max_left = height[left]
            else:
                total_water += max_left - height[left]
            left += 1
        else:
            if height[right] >= max_right:
                max_right = height[right]
            else:
                total_water += max_right - height[right]
            right -= 1
    return total_water`,
  CPP: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long solveTrap(const vector<int>& height) {
    // Two-pointer O(1) space optimization
    if (height.empty()) return 0;
    int left = 0, right = height.size() - 1;
    int maxLeft = 0, maxRight = 0;
    long long totalWater = 0;

    while (left <= right) {
        if (height[left] <= height[right]) {
            if (height[left] >= maxLeft) maxLeft = height[left];
            else totalWater += maxLeft - height[left];
            left++;
        } else {
            if (height[right] >= maxRight) maxRight = height[right];
            else totalWater += maxRight - height[right];
            right--;
        }
    }
    return totalWater;
}`
};

const Home = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Demo Execution State Machine
  const [demoLang, setDemoLang] = useState('JAVA');
  const [execState, setExecState] = useState('ACCEPTED'); // 'QUEUED' | 'RUNNING' | 'ACCEPTED'
  const [testProgress, setTestProgress] = useState(50);
  const [timerMs, setTimerMs] = useState(42);

  useEffect(() => {
    fetchProblems();
  }, [difficultyFilter]);

  // Automated Showcase Simulation Loop
  useEffect(() => {
    let interval;
    if (execState === 'QUEUED') {
      setTestProgress(0);
      setTimerMs(0);
      const timeout = setTimeout(() => setExecState('RUNNING'), 1200);
      return () => clearTimeout(timeout);
    } else if (execState === 'RUNNING') {
      interval = setInterval(() => {
        setTestProgress((prev) => {
          if (prev >= 48) {
            clearInterval(interval);
            setTimeout(() => setExecState('ACCEPTED'), 200);
            return 50;
          }
          return prev + 2;
        });
        setTimerMs((prev) => prev + 2);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [execState]);

  const triggerDemoRun = () => {
    setExecState('QUEUED');
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await problemsAPI.list(difficultyFilter);
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setProblems(list);
    } catch (err) {
      console.error('Failed to load problems:', err);
      setError('Unable to reach JudgeX execution servers. Verify that your Spring Boot cluster is active.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-28 bg-ambient-grid animate-fade-in relative overflow-hidden">
      {/* Ambient background glow objects */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />
      
      {/* 1. Hero Section - Live Submission Execution Showcase */}
      <section className="pt-12 pb-20 border-b border-surface-border relative overflow-hidden">
        {/* Floating Particles */}
        <div className="particles-container">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Technical Monospace Headline */}
            <div className="lg:col-span-6 space-y-8 animate-load-hero">
              
              {/* Tagline Pill */}
              <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-surface border border-surface-border text-amber-accent font-mono text-xs font-bold shadow-sm glow-card">
                <span className="w-2 h-2 rounded-full bg-amber-accent animate-pulse" />
                <span className="tracking-wider uppercase typing-cursor">// JudgeX — Where Algorithms Compete</span>
              </div>

              {/* Monospace Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-extrabold text-text-primary tracking-tight leading-[1.12]">
                PRECISION <br className="hidden sm:inline" />
                ALGORITHMIC <br className="hidden sm:inline" />
                <span className="text-amber-accent">ARENA.</span>
              </h1>

              {/* Disciplined Body Explanation */}
              <p className="text-base sm:text-lg text-text-muted leading-relaxed font-sans max-w-xl">
                Test your computational mettle. Execute high-performance Java, Python, and C++ solutions in isolated Docker sandboxes with microsecond precision, real-time WebSocket telemetry, and 50+ stress test evaluations.
              </p>

              {/* Feature Highlights Row */}
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-primary">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface border border-surface-border shadow-inner">
                  <Cpu className="w-3.5 h-3.5 text-amber-accent" />
                  <span>Isolated Sandbox</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface border border-surface-border shadow-inner">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kafka Queue</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface border border-surface-border shadow-inner">
                  <Activity className="w-3.5 h-3.5 text-verdict-pass" />
                  <span>STOMP Push</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2 font-mono">
                <a
                  href="#arena-challenges"
                  className="btn-shine px-7 py-3.5 rounded-xl text-xs font-bold text-ink bg-amber-accent hover:bg-amber-400 shadow-[0_0_20px_rgba(232,184,92,0.3)] hover:shadow-[0_0_25px_rgba(232,184,92,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  LAUNCH EXECUTION ENGINE
                </a>
                <Link
                  to={problems.length > 0 ? `/problems/${problems[0].id}` : '#arena-challenges'}
                  className="px-6 py-3.5 rounded-xl text-xs font-semibold text-text-primary bg-surface hover:bg-surface-light border border-surface-border transition-all duration-150"
                >
                  VIEW SPECIFICATIONS
                </Link>
              </div>
            </div>

            {/* Right Column: Live Submission Execution Glass Panel */}
            <div className="lg:col-span-6 animate-load-code gradient-border rounded-2xl">
              <div className={`glass-overlay rounded-2xl overflow-hidden border transition-colors duration-300 ${
                execState === 'ACCEPTED' ? 'border-verdict-pass/60 shadow-[0_0_30px_rgba(94,201,140,0.15)]' : 'border-surface-border'
              }`}>
                
                {/* Panel Header */}
                <div className="bg-base/90 px-4 py-3 border-b border-surface-border flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center space-x-3">
                    {/* Monochrome Window Dots */}
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-surface-border" />
                      <span className="w-2.5 h-2.5 rounded-full bg-dark-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-dark-500" />
                    </div>
                    <div className="h-4 w-px bg-surface-border" />
                    <span className="text-text-muted text-[11px] font-semibold flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-amber-accent" />
                      sandbox_execution_pool // worker-1
                    </span>
                  </div>

                  {/* Language Switcher Tabs */}
                  <div className="flex items-center space-x-1 bg-base p-1 rounded-lg border border-surface-border text-[10px] font-bold">
                    {['JAVA', 'PYTHON', 'CPP'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setDemoLang(lang); setExecState('ACCEPTED'); setTestProgress(50); setTimerMs(42); }}
                        className={`px-2 py-1 rounded transition-colors ${
                          demoLang === lang ? 'bg-amber-accent text-ink' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {lang === 'CPP' ? 'C++' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Snippet View */}
                <div className="p-5 bg-base font-mono text-xs sm:text-sm text-text-primary overflow-x-auto leading-relaxed border-b border-surface-border select-none">
                  <pre className="text-text-primary">
                    <code>{DEMO_SNIPPETS[demoLang]}</code>
                  </pre>
                </div>

                {/* Live Execution State Dashboard */}
                <div className="p-4 bg-surface/90 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {execState === 'QUEUED' && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-verdict-queued animate-pulse" />
                          <span className="text-text-muted font-bold tracking-wider uppercase">STATUS: QUEUED // WAITING FOR WORKER POOL...</span>
                        </>
                      )}
                      {execState === 'RUNNING' && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-accent animate-ping" />
                          <span className="text-amber-accent font-bold tracking-wider uppercase">STATUS: EXECUTING IN DOCKER SANDBOX</span>
                        </>
                      )}
                      {execState === 'ACCEPTED' && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-verdict-pass" />
                          <span className="text-verdict-pass font-bold tracking-wider uppercase">STATUS: TERMINAL VERDICT RESOLVED</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-text-muted">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-accent" />
                        <span className="text-text-primary font-bold">00:00.0{String(timerMs).padStart(2, '0')}s</span>
                      </span>
                      <button
                        onClick={triggerDemoRun}
                        disabled={execState !== 'ACCEPTED'}
                        className={`p-1.5 rounded bg-base border border-surface-border text-text-primary hover:border-amber-accent transition-all ${
                          execState !== 'ACCEPTED' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                        }`}
                        title="Re-run Simulation"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${execState === 'RUNNING' ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar / Chip Resolution */}
                  {execState === 'RUNNING' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>Evaluating Test Cases...</span>
                        <span className="font-bold text-amber-accent">{testProgress} / 50 PASSED</span>
                      </div>
                      <div className="w-full h-2 bg-base rounded-full overflow-hidden border border-surface-border">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-accent transition-all duration-75"
                          style={{ width: `${(testProgress / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {execState === 'ACCEPTED' && (
                    <div className="bg-verdict-pass/10 border border-verdict-pass/40 p-3 rounded-xl flex items-center justify-between animate-verdict-snap">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-verdict-pass shrink-0" />
                        <div>
                          <div className="font-bold text-verdict-pass tracking-wider">ACCEPTED // 50/50 TEST CASES PASSED</div>
                          <div className="text-[10px] text-text-muted mt-0.5">Zero regression detected. Memory cap within 256MB boundary.</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-text-primary bg-base px-3 py-1.5 rounded-lg border border-surface-border">
                        <div>Time: <strong className="text-verdict-pass">42ms</strong></div>
                        <div className="text-[10px] text-text-muted">Top 99.4%</div>
                      </div>
                    </div>
                  )}

                  {execState === 'QUEUED' && (
                    <div className="bg-base/80 border border-surface-border p-3 rounded-xl flex items-center justify-between text-text-muted">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-accent" />
                        <span>Dispatching payload to Kafka consumer topic...</span>
                      </div>
                      <span className="text-[10px] bg-surface px-2 py-0.5 rounded border border-surface-border">Priority: HIGH</span>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Problem List Section */}
      <section id="arena-challenges" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-6 animate-section-left">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-accent mb-1 typing-cursor">
              // ACTIVE COMPETITION TILES
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-extrabold text-text-primary tracking-tight">
              ARENA CHALLENGES
            </h2>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-80 group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-amber-accent transition-colors" />
              <input
                type="text"
                placeholder="Search problems by title or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-surface-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-accent focus:ring-1 focus:ring-amber-accent font-mono transition-all duration-150"
              />
            </div>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="px-5 py-2.5 bg-amber-accent hover:bg-amber-400 text-ink font-mono font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                New Challenge
              </Link>
            )}
          </div>
        </div>
        
        {/* Controls Bar - Restrained Difficulty Tabs */}
        <div className="flex items-center justify-between mb-8 animate-section-right">
          <div className="flex items-center space-x-1.5 bg-surface p-1.5 rounded-xl border border-surface-border font-mono">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-150 flex items-center gap-2 ${
                  difficultyFilter === diff
                    ? 'bg-surface-light text-amber-accent border border-surface-border shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-card'
                }`}
              >
                {diff === 'ALL' && <Filter className="w-3 h-3" />}
                {diff === 'EASY' && <span className="w-2 h-2 rounded-full bg-verdict-pass" />}
                {diff === 'MEDIUM' && <span className="w-2 h-2 rounded-full bg-amber-accent" />}
                {diff === 'HARD' && <span className="w-2 h-2 rounded-full bg-verdict-fail" />}
                {diff === 'ALL' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-text-muted hidden md:block">
            Showing <strong className="text-text-primary">{filteredProblems.length}</strong> available challenge tiles
          </div>
        </div>

        {/* Challenge Grid Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-text-muted font-mono">
            <Loader2 className="w-10 h-10 animate-spin text-amber-accent mb-4" />
            <p className="text-xs tracking-wider uppercase animate-pulse">Synchronizing JudgeX arena payload...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-surface border border-verdict-fail/40 rounded-xl text-center max-w-lg mx-auto font-mono">
            <XCircle className="w-10 h-10 text-verdict-fail mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary mb-1">Execution Node Offline</h3>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">{error}</p>
            <button
              onClick={fetchProblems}
              className="px-5 py-2.5 bg-surface-light hover:bg-surface-card border border-surface-border text-xs font-bold text-amber-accent rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-24 bg-surface/60 rounded-xl border border-surface-border p-8 font-mono">
            <Terminal className="w-12 h-12 text-text-dim mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-primary mb-1">No challenges match query parameters</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mb-6">
              Adjust your search keywords or reset difficulty filters to view the complete JudgeX algorithmic problem repository.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setDifficultyFilter('ALL'); }}
              className="px-4 py-2 bg-surface-light hover:bg-surface-card border border-surface-border text-xs font-bold text-amber-accent rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem, idx) => (
              <div key={problem.id || idx} className="animate-card-reveal" style={{ animationDelay: `${idx * 80}ms` }}>
                <ProblemCard
                  problem={problem}
                  index={idx}
                  solved={false}
                />
              </div>
            ))}
          </div>
        )}

      </section>

    </div>
  );
};

export default Home;
