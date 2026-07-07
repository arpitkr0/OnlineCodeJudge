package com.codejudge.config;

import com.codejudge.problem.*;
import com.codejudge.submission.SubmissionRepository;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ProblemGenerator {

    public static void seedProblems(ProblemRepository problemRepository, SubmissionRepository submissionRepository) {
        if (problemRepository.count() > 0 && problemRepository.existsByTitle("Watermelon") && !problemRepository.existsByTitle("Way Too Long Words")) {
            return; // Already seeded with Codeforces problems
        }

        // Clear existing demo problems/submissions when replacing seed
        submissionRepository.deleteAll();
        problemRepository.deleteAll();

        seedWatermelon(problemRepository);
        seedTeam(problemRepository);
        seedBitPlusPlus(problemRepository);
    }

    private static void seedWatermelon(ProblemRepository repository) {
        Problem p = new Problem();
        p.setTitle("Watermelon");
        p.setDifficulty(Difficulty.EASY);
        p.setTimeLimitMs(1000);
        p.setMemoryLimitMb(256);
        p.setDescription("""
                <div class="space-y-4 font-sans text-slate-300">
                  <p class="text-sm leading-relaxed">One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">w</code> kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.</p>
                  <p class="text-sm leading-relaxed">Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs an even number of kilos, at the same time it is not obligatory that the parts are equal. The boys are extremely tired and want to start their meal as soon as possible, that's why you should help them and find out, if they can divide the watermelon in the way they want. For sure, each of them should get a part of positive weight.</p>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mt-6 mb-2">Input Format</h3>
                  <p class="text-sm leading-relaxed">The first (and the only) input line contains integer number <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">w</code> (<code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">1 &le; w &le; 100</code>) &mdash; the weight of the watermelon bought by the boys.</p>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mt-6 mb-2">Output Format</h3>
                  <p class="text-sm leading-relaxed">Print <code class="bg-dark-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">YES</code>, if the boys can divide the watermelon into two parts, each of them weighing an even number of kilos; and <code class="bg-dark-900 px-1.5 py-0.5 rounded text-rose-400 font-mono font-bold">NO</code> in the opposite case.</p>
                </div>
                """);

        // 1. Manual Edge & Sample Test Cases
        addCase(p, "8", "YES", false);
        addCase(p, "5", "NO", false);
        addCase(p, "2", "NO", false);
        addCase(p, "4", "YES", true);
        addCase(p, "1", "NO", true);
        addCase(p, "100", "YES", true);
        addCase(p, "99", "NO", true);

        // 2. Programmatic Test Cases (all weights 1 to 100)
        for (int w = 1; w <= 100; w++) {
            String ans = (w > 2 && w % 2 == 0) ? "YES" : "NO";
            addCase(p, String.valueOf(w), ans, true);
        }

        repository.save(p);
    }


    private static void seedTeam(ProblemRepository repository) {
        Problem p = new Problem();
        p.setTitle("Team");
        p.setDifficulty(Difficulty.EASY);
        p.setTimeLimitMs(1000);
        p.setMemoryLimitMb(256);
        p.setDescription("""
                <div class="space-y-4 font-sans text-slate-300">
                  <p class="text-sm leading-relaxed">One day three best friends Petya, Vasya and Tonya decided to form a team and take part in programming contests. Participants are usually offered several problems during programming contests. Long before the start the friends decided that they will implement a problem if at least two of them are sure about the solution. Otherwise, the friends won't write the problem's solution.</p>
                  <p class="text-sm leading-relaxed">This contest offers <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">n</code> problems to the participants. For each problem we know, which friend is sure about the solution. Help the friends find the number of problems for which they will write a solution.</p>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mt-6 mb-2">Input Format</h3>
                  <p class="text-sm leading-relaxed">The first input line contains a single integer <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">n</code> (<code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">1 &le; n &le; 1000</code>) &mdash; the number of problems in the contest. Then <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">n</code> lines contain three integers each, each integer is either 0 or 1. If the first number in the line equals 1, then Petya is sure about the problem's solution, otherwise he isn't. The second number shows Vasya's view on the solution, and the third number shows Tonya's view. The numbers on the lines are separated by spaces.</p>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mt-6 mb-2">Output Format</h3>
                  <p class="text-sm leading-relaxed">Print a single integer &mdash; the number of problems the friends will implement on the contest.</p>
                </div>
                """);

        // 1. Sample Test Cases
        addCase(p, "3\n1 1 0\n1 1 1\n1 0 0", "2", false);
        addCase(p, "2\n1 0 0\n0 1 1", "1", false);

        // 2. Stress Test Cases
        Random rand = new Random(231);
        for (int i = 0; i < 50; i++) {
            int n = 5 + rand.nextInt(100);
            StringBuilder inSb = new StringBuilder().append(n).append("\n");
            int solved = 0;
            for (int j = 0; j < n; j++) {
                int a = rand.nextInt(2);
                int b = rand.nextInt(2);
                int c = rand.nextInt(2);
                if (a + b + c >= 2) solved++;
                inSb.append(a).append(" ").append(b).append(" ").append(c).append((j == n - 1) ? "" : "\n");
            }
            addCase(p, inSb.toString(), String.valueOf(solved), true);
        }

        repository.save(p);
    }


    private static void seedBitPlusPlus(ProblemRepository repository) {
        Problem p = new Problem();
        p.setTitle("Bit++");
        p.setDifficulty(Difficulty.EASY);
        p.setTimeLimitMs(1000);
        p.setMemoryLimitMb(256);
        p.setDescription("""
                <div class="space-y-4 font-sans text-slate-300">
                  <p class="text-sm leading-relaxed">The classic programming language of Bit++ is very simple. It has exactly one variable, called <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono font-bold">X</code>, which initially equals 0. There are exactly two operations in Bit++:</p>
                  <ul class="list-disc pl-5 space-y-1 text-sm text-slate-300">
                    <li>Operation <code class="bg-dark-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono font-bold">++</code> increases the value of variable <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">X</code> by 1. (Can be written as <code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">++X</code> or <code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">X++</code>).</li>
                    <li>Operation <code class="bg-dark-900 px-1.5 py-0.5 rounded text-rose-400 font-mono font-bold">--</code> decreases the value of variable <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">X</code> by 1. (Can be written as <code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">--X</code> or <code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">X--</code>).</li>
                  </ul>
                  <p class="text-sm leading-relaxed">You are given a program in language Bit++, consisting of <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">n</code> statements. Execute the program and find the final value of variable <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono font-bold">X</code>.</p>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mt-6 mb-2">Input Format</h3>
                  <p class="text-sm leading-relaxed">The first line contains a single integer <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">n</code> (<code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">1 &le; n &le; 150</code>) &mdash; the number of statements in the program. Next <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono">n</code> lines contain a statement each. Each statement contains exactly one operation (<code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">++</code> or <code class="bg-dark-900 px-1.5 py-0.5 rounded text-slate-200 font-mono">--</code>) and exactly one variable <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono font-bold">X</code> (denoted as letter X). Thus, there are no empty statements. The operation and the variable can be written in any order.</p>
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mt-6 mb-2">Output Format</h3>
                  <p class="text-sm leading-relaxed">Print a single integer &mdash; the final value of <code class="bg-dark-900 px-1.5 py-0.5 rounded text-cyan-400 font-mono font-bold">X</code> after executing all statements.</p>
                </div>
                """);

        // 1. Sample Test Cases
        addCase(p, "1\n++X", "1", false);
        addCase(p, "2\nX++\n--X", "0", false);

        // 2. Stress Cases
        String[] ops = {"++X", "X++", "--X", "X--"};
        Random rand = new Random(282);
        for (int i = 0; i < 50; i++) {
            int n = 1 + rand.nextInt(150);
            StringBuilder inSb = new StringBuilder().append(n).append("\n");
            int x = 0;
            for (int j = 0; j < n; j++) {
                String op = ops[rand.nextInt(4)];
                if (op.contains("++")) x++;
                else x--;
                inSb.append(op).append((j == n - 1) ? "" : "\n");
            }
            addCase(p, inSb.toString(), String.valueOf(x), true);
        }

        repository.save(p);
    }

    private static void addCase(Problem p, String input, String expected, boolean hidden) {
        TestCase tc = new TestCase();
        tc.setInput(input);
        tc.setExpectedOutput(expected);
        tc.setHidden(hidden);
        p.addTestCase(tc);
    }
}
