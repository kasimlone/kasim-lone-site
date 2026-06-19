import Nav from "@/components/sixth-form-taster/Nav";
import Reveal from "@/components/sixth-form-taster/Reveal";
import BinarySearchAnimation from "@/components/sixth-form-taster/BinarySearchAnimation";
import AnswerReveal from "@/components/sixth-form-taster/AnswerReveal";

function Section({
  id,
  children,
  className = "",
  dark = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={[
        "relative min-h-screen flex items-center py-20 md:py-28 px-4 md:px-8 scroll-mt-16",
        dark ? "bg-navy text-white" : "bg-page text-ink",
        className,
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto w-full">{children}</div>
    </section>
  );
}

function Eyebrow({ children, color = "text-accent" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className={`text-xs md:text-sm font-bold tracking-[0.18em] uppercase ${color}`}>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      {/* ============ HERO ============ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center bg-navy text-white overflow-hidden px-4 md:px-8"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent blur-3xl opacity-20" />
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-teal blur-3xl opacity-20" />
        </div>
        <div className="max-w-7xl mx-auto w-full relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs md:text-sm tracking-wider mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              A LEVEL COMPUTER SCIENCE · TASTER LESSON
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">
              Thinking Like an
              <br />
              <span className="text-white">A Level</span>{" "}
              <span className="text-accent">Computer Scientist</span>
            </h1>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-8 text-xl md:text-3xl text-slate-300 italic">
              From Data to Decisions
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-14 flex items-center gap-6">
              <a
                href="#hook"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent hover:bg-orange-600 transition text-white font-semibold"
              >
                Begin the lesson
                <span className="text-lg">↓</span>
              </a>
              <span className="text-sm text-slate-400">Scroll to reveal each slide</span>
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce text-2xl">
          ↓
        </div>
      </section>

      {/* ============ HOOK ============ */}
      <Section id="hook">
        <Reveal>
          <Eyebrow color="text-teal">Warm-up</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">A real-world question</h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-5 gap-6">
          <Reveal className="lg:col-span-3" delay={150}>
            <div className="rounded-2xl bg-white border border-slate-200 p-8 md:p-10 shadow-sm h-full">
              <Eyebrow color="text-teal">The scenario</Eyebrow>
              <p className="text-2xl md:text-3xl font-bold text-navy mt-3">
                A website stores 10,000 usernames.
              </p>
              <p className="text-lg md:text-xl text-ink mt-3">
                A user types in their username to log in.
              </p>
              <p className="mt-6 text-xl md:text-2xl italic text-accent font-semibold">
                How could the computer check whether the username exists?
              </p>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={300}>
            <AnswerReveal
              answers={[
                "Check each username one by one",
                "Search the list",
                "Use a database",
                "Compare the typed username",
              ]}
            />
          </Reveal>
        </div>
      </Section>

      {/* ============ GCSE vs A LEVEL ============ */}
      <Section id="gcse-vs-a">
        <Reveal>
          <Eyebrow color="text-teal">Stepping up</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">GCSE vs A Level</h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Reveal delay={150}>
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm h-full">
              <div className="bg-teal text-white px-6 py-3 font-bold tracking-wide">GCSE</div>
              <div className="p-8">
                <p className="text-xl text-ink">You might write the code to search the list.</p>
                <div className="mt-6 text-xs font-bold tracking-widest text-muted uppercase">Focus</div>
                <p className="mt-1 italic text-ink">Getting the program to work.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="rounded-2xl bg-white border-2 border-accent overflow-hidden shadow-md h-full">
              <div className="bg-accent text-white px-6 py-3 font-bold tracking-wide">
                A LEVEL — we also ask…
              </div>
              <ul className="p-8 space-y-4">
                {[
                  "Is this the best way?",
                  "What happens when the list gets huge?",
                  "What data structure should we use?",
                  "How efficient is the algorithm?",
                ].map((q) => (
                  <li key={q} className="flex gap-3 items-start text-lg">
                    <span className="flex-none mt-2.5 w-2.5 h-2.5 rounded-full bg-accent" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============ LINEAR SEARCH ============ */}
      <Section id="linear">
        <Reveal>
          <Eyebrow>Task 1</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">
            Linear search vs smarter thinking
          </h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
          <p className="text-lg text-muted mt-4">Below is a list of usernames. Your task:</p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-8 code-window">
            <div>
              <span>users </span>
              <span className="kw">= </span>
              <span>[</span>
              <span className="str">
                &quot;adam23&quot;, &quot;bella99&quot;, &quot;chen05&quot;, &quot;dina11&quot;,
              </span>
            </div>
            <div>
              <span>        </span>
              <span className="str">&quot;elliot7&quot;, &quot;fatima2&quot;, &quot;george8&quot;</span>
              <span>]</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={350}>
          <div className="mt-8 rounded-2xl bg-white border-l-4 border-accent shadow-sm p-6 md:p-8">
            <Eyebrow>Your task</Eyebrow>
            <p className="text-xl md:text-2xl text-ink mt-2">
              Write Python code to search the list and confirm a log-in for the username{" "}
              <span className="font-mono text-accent font-bold">fatima2</span>.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ============ SCALING ============ */}
      <Section id="scaling">
        <Reveal>
          <Eyebrow color="text-teal">Now scale it up</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">
            What happens when the list grows?
          </h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { big: "10,000", text: "What if there were 10,000 users?", color: "text-teal", bar: "bg-teal" },
            { big: "Not found", text: "What if the username was not in the list?", color: "text-accent", bar: "bg-accent" },
            { big: "How many?", text: "How many checks might be needed?", color: "text-leafSA", bar: "bg-leafSA" },
          ].map((c, i) => (
            <Reveal key={c.big} delay={150 * (i + 1)}>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden h-full">
                <div className={`h-1.5 ${c.bar}`} />
                <div className="p-8">
                  <div className={`text-4xl md:text-5xl font-bold ${c.color}`}>{c.big}</div>
                  <p className="mt-6 text-xl text-ink">{c.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600}>
          <p className="mt-10 text-center italic text-muted">Think → Pair → Share</p>
        </Reveal>
      </Section>

      {/* ============ TIME COMPLEXITY ============ */}
      <Section id="complexity" dark>
        <Reveal>
          <Eyebrow>Key concept</Eyebrow>
          <h2 className="text-5xl md:text-6xl font-bold mt-2">Time complexity</h2>
          <div className="mt-3 w-16 h-1 bg-accent" />
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-12 text-2xl md:text-3xl text-slate-300 leading-relaxed">
            At A Level, we start{" "}
            <span className="text-accent font-semibold">analysing</span> algorithms —
            not just writing them.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <blockquote className="mt-10 rounded-2xl bg-navy-dark p-8 md:p-10 border-l-4 border-accent">
            <p className="text-2xl md:text-3xl italic">
              &ldquo;How does the algorithm grow as the data grows?&rdquo;
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={600}>
          <p className="mt-10 text-xl md:text-2xl text-slate-300">
            This idea is known as <span className="font-bold text-white">time complexity</span>.
          </p>
        </Reveal>
      </Section>

      {/* ============ BINARY SEARCH ============ */}
      <Section id="binary">
        <Reveal>
          <Eyebrow color="text-teal">A smarter approach</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">Binary search</h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
          <p className="text-lg text-muted mt-4">
            Same list — but what if it were sorted? Watch how the search halves the
            problem each step.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-8">
            <BinarySearchAnimation />
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Reveal delay={300}>
            <div className="rounded-2xl bg-navy text-white p-8 h-full">
              <Eyebrow>Halving the list</Eyebrow>
              <div className="mt-5 space-y-3">
                {[
                  { lbl: "7 items", w: "w-full", color: "bg-slate-300" },
                  { lbl: "3 items", w: "w-1/2", color: "bg-accent" },
                  { lbl: "1 item ✓", w: "w-1/6", color: "bg-emerald-400" },
                ].map((b) => (
                  <div key={b.lbl} className="flex items-center gap-3">
                    <div className={`${b.w} ${b.color} h-8 rounded-md`} />
                    <span className="text-sm font-semibold">{b.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={450}>
            <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm h-full">
              <h3 className="text-xl font-bold text-navy">What&apos;s powerful about this idea?</h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Removes half the possibilities each time",
                  "Much faster for large lists",
                  "Only works if the data is sorted",
                  "How data is stored affects the algorithm we can use",
                ].map((b) => (
                  <li key={b} className="flex gap-3 items-start">
                    <span className="flex-none w-6 h-6 rounded-full bg-leafSA text-white text-xs font-bold flex items-center justify-center">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============ QUOTE ============ */}
      <Section id="quote" dark>
        <Reveal>
          <div className="text-[140px] md:text-[200px] leading-none font-bold text-accent -mb-8">
            &ldquo;
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-2xl md:text-4xl text-slate-300">
            A Level Computer Science is not just{" "}
            <span className="text-white font-bold">&ldquo;can I code it?&rdquo;</span>
          </p>
        </Reveal>
        <Reveal delay={350}>
          <div className="mt-8 border-l-4 border-accent pl-6">
            <p className="text-2xl md:text-4xl text-slate-300">It is</p>
            <p className="text-3xl md:text-5xl text-accent font-bold italic mt-2">
              &ldquo;can I design a better solution?&rdquo;
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ============ TASK 2 (combined) ============ */}
      <Section id="task2">
        <Reveal>
          <Eyebrow>Task 2</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">
            Designing for a real problem
          </h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
        </Reveal>

        <div className="mt-10 grid lg:grid-cols-5 gap-6">
          <Reveal className="lg:col-span-3" delay={150}>
            <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm h-full">
              <Eyebrow color="text-teal">The brief</Eyebrow>
              <p className="mt-3 text-xl text-ink">
                A school wants a system to check whether a student is allowed into
                the sixth form study room.
              </p>
              <p className="mt-4 text-muted">Each student needs the following details stored:</p>
              <p className="mt-6 text-xl text-accent italic font-semibold">
                How could this data be stored in a Python file?
              </p>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={300}>
            <div className="rounded-2xl bg-navy text-white p-6 h-full">
              <Eyebrow>Data fields</Eyebrow>
              <div className="mt-4 space-y-3">
                {[
                  { n: "name", t: "string" },
                  { n: "year group", t: "integer" },
                  { n: "behaviour points", t: "integer" },
                ].map((f) => (
                  <div key={f.n} className="rounded-xl bg-navy-dark p-4">
                    <div className="font-mono font-bold">{f.n}</div>
                    <div className="text-xs text-accent">{f.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={500}>
          <div className="mt-10 code-window">
            <span>Students </span>
            <span className="kw">= </span>
            <span>[</span>
            <span className="str">
              [&quot;Amira&quot;, 12, 4], [&quot;Borris&quot;, 13, 17]
            </span>
            <span>, ...]</span>
          </div>
        </Reveal>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Reveal delay={600}>
            <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm h-full">
              <Eyebrow color="text-teal">A student is allowed in if…</Eyebrow>
              <ul className="mt-5 space-y-3">
                {[
                  "They are in Year 12 or Year 13",
                  "They have fewer than 10 behaviour points",
                  "Their permission status is set to True",
                ].map((b) => (
                  <li key={b} className="flex gap-3 items-start">
                    <span className="flex-none w-6 h-6 rounded-full bg-leafSA text-white text-xs font-bold flex items-center justify-center">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={750}>
            <div className="rounded-2xl bg-white border-l-4 border-accent shadow-sm p-8 h-full">
              <Eyebrow>Your task</Eyebrow>
              <p className="mt-3 text-lg">
                Write a function that takes a student&apos;s name as a parameter
                and returns{" "}
                <span className="font-mono font-bold text-leafSA">True</span> or{" "}
                <span className="font-mono font-bold text-accent">False</span>{" "}
                based on the conditions.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============ COMPARISON TABLE ============ */}
      <Section id="table">
        <Reveal>
          <Eyebrow color="text-teal">The big picture</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mt-2">
            GCSE vs A Level Computer Science
          </h2>
          <div className="mt-2 w-16 h-1 bg-accent" />
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-10 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="grid grid-cols-2 text-white font-bold">
              <div className="bg-teal px-6 py-4">GCSE Computer Science</div>
              <div className="bg-accent px-6 py-4">A Level Computer Science</div>
            </div>
            {[
              ["Write simple programs", "Design larger solutions"],
              ["Use selection and iteration", "Think about efficiency and scalability"],
              ["Learn hardware components", "Understand how systems work in more depth"],
              ["Convert binary and hexadecimal", "Explore how data is structured and processed"],
              ["Follow algorithms", "Analyse and improve algorithms"],
              ["Learn Python basics", "Build confidence with more complex programming"],
            ].map(([a, b], i) => (
              <div
                key={a}
                className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center ${
                  i % 2 ? "bg-slate-50" : "bg-white"
                }`}
              >
                <div className="px-6 py-4 text-ink">{a}</div>
                <div className="px-4 text-accent font-bold text-xl text-center hidden md:block">
                  →
                </div>
                <div className="px-6 py-4 text-navy font-semibold">{b}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={500}>
          <div className="mt-16 text-center">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-navy text-white text-sm font-semibold hover:bg-navy-dark transition"
            >
              ↑ Back to top
            </a>
          </div>
        </Reveal>
      </Section>

      <footer className="bg-navy-dark text-slate-400 text-sm py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <span>A Level Computer Science · Searching Taster Lesson</span>
          <span>From Data to Decisions</span>
        </div>
      </footer>
    </>
  );
}
