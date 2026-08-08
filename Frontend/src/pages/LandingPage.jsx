import React, { useState, useEffect } from "react";
import { 
  User, 
  Mic, 
  FileText, 
  Check, 
  Shuffle, 
  BarChart3, 
  Scale, 
  Layers, 
  Play, 
  RotateCcw, 
  X, 
  Briefcase, 
  Calendar,
  Volume2
} from "lucide-react";
import CandidateForm from "../components/CandidateForm";

// Simulated data for "See it in action" questions
const SIMULATION_QUESTIONS = [
  {
    id: "system-design",
    category: "System Design",
    difficulty: "hard",
    question: "Describe how you would design a rate limiter for a public API.",
    answer: "I'd start with a token bucket per client key stored in Redis, refilling at a fixed rate and rejecting requests once the bucket is empty.",
    scores: { technical: 8, communication: 9, confidence: 7 }
  },
  {
    id: "frontend",
    category: "Frontend",
    difficulty: "medium",
    question: "Explain how the React Virtual DOM improves rendering performance.",
    answer: "React creates a lightweight Virtual DOM tree in memory. On state changes, it diffs it with a new virtual tree and batch updates only the changed nodes in the real DOM.",
    scores: { technical: 9, communication: 8, confidence: 9 }
  },
  {
    id: "databases",
    category: "Databases",
    difficulty: "hard",
    question: "What is the difference between clustered and non-clustered indexes?",
    answer: "A clustered index defines the physical order of data storage in a table (one per table), while a non-clustered index is a separate structure pointing to the actual row location.",
    scores: { technical: 7, communication: 8, confidence: 8 }
  }
];

const LandingPage = () => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("candidate"); // "candidate" or "demo"

  // Pricing states
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // "monthly" or "annual"

  // --- Hero Animation Simulation ---
  const heroQuestion = "Explain how the Node.js event loop works.";
  const heroFullText = "The event loop lets Node handle non-blocking I/O by offloading operations to the system kernel whenever possible";
  const [heroTypedText, setHeroTypedText] = useState("");
  const [heroTypingIndex, setHeroTypingIndex] = useState(0);
  const [heroScores, setHeroScores] = useState({ technical: 0, communication: 0, confidence: 0 });
  const [heroStatus, setHeroStatus] = useState("typing"); // "typing", "evaluating", "done"

  useEffect(() => {
    // Typing animation for Hero
    if (heroTypingIndex < heroFullText.length) {
      const timeout = setTimeout(() => {
        setHeroTypedText((prev) => prev + heroFullText[heroTypingIndex]);
        setHeroTypingIndex((prev) => prev + 1);
      }, 35);
      return () => clearTimeout(timeout);
    } else {
      // Completed typing
      setHeroStatus("evaluating");
      const timeout = setTimeout(() => {
        setHeroStatus("done");
        setHeroScores({ technical: 82, communication: 76, confidence: 80 });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [heroTypingIndex]);

  // Restart hero animation
  const restartHeroAnimation = () => {
    setHeroTypedText("");
    setHeroTypingIndex(0);
    setHeroScores({ technical: 0, communication: 0, confidence: 0 });
    setHeroStatus("typing");
  };

  // --- "See it in Action" Simulation States ---
  const [selectedSimId, setSelectedSimId] = useState("system-design");
  const currentSim = SIMULATION_QUESTIONS.find((q) => q.id === selectedSimId) || SIMULATION_QUESTIONS[0];
  
  const [simTypedText, setSimTypedText] = useState("");
  const [simTypingIndex, setSimTypingIndex] = useState(0);
  const [simStatus, setSimStatus] = useState("idle"); // "idle", "typing", "countdown", "done"
  const [simCountdown, setSimCountdown] = useState(3);
  const [simScores, setSimScores] = useState({ technical: 0, communication: 0, confidence: 0 });

  // Handle playing simulation
  const startSimulation = (simId) => {
    const targetSim = SIMULATION_QUESTIONS.find((q) => q.id === simId);
    setSelectedSimId(simId);
    setSimTypedText("");
    setSimTypingIndex(0);
    setSimStatus("typing");
    setSimCountdown(3);
    setSimScores({ technical: 0, communication: 0, confidence: 0 });
  };

  // Auto trigger the "See it in action" simulation on load
  useEffect(() => {
    startSimulation("system-design");
  }, []);

  // Sim typing effect
  useEffect(() => {
    if (simStatus === "typing") {
      if (simTypingIndex < currentSim.answer.length) {
        const timeout = setTimeout(() => {
          setSimTypedText((prev) => prev + currentSim.answer[simTypingIndex]);
          setSimTypingIndex((prev) => prev + 1);
        }, 25);
        return () => clearTimeout(timeout);
      } else {
        setSimStatus("countdown");
      }
    }
  }, [simStatus, simTypingIndex, selectedSimId]);

  // Sim Countdown timer
  useEffect(() => {
    if (simStatus === "countdown") {
      if (simCountdown > 0) {
        const timer = setTimeout(() => {
          setSimCountdown((prev) => prev - 1);
        }, 1000);
        return () => timer;
      } else {
        setSimStatus("done");
        setSimScores({
          technical: currentSim.scores.technical * 10,
          communication: currentSim.scores.communication * 10,
          confidence: currentSim.scores.confidence * 10
        });
      }
    }
  }, [simStatus, simCountdown, selectedSimId]);

  // Open candidate details modal
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Smooth scroll to sections
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Pricing calculations
  const prices = {
    free: 0,
    pro: billingPeriod === "monthly" ? 19 : 15,
    enterprise: "Custom"
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 antialiased font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-gray-150/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center">
              HireIQ
              <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-sm ml-1"></span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("how-it-works")} className="text-slate-600 hover:text-slate-950 font-medium transition duration-150 text-sm cursor-pointer">How it Works</button>
            <button onClick={() => scrollToSection("features")} className="text-slate-600 hover:text-slate-950 font-medium transition duration-150 text-sm cursor-pointer">Features</button>
            <button onClick={() => scrollToSection("for-recruiters")} className="text-slate-600 hover:text-slate-950 font-medium transition duration-150 text-sm cursor-pointer">For Recruiters</button>
            <button onClick={() => scrollToSection("pricing")} className="text-slate-600 hover:text-slate-950 font-medium transition duration-150 text-sm cursor-pointer">Pricing</button>
          </nav>

          <button 
            onClick={() => openModal("candidate")}
            className="bg-[#121212] hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-150 hover:shadow-lg shadow-black/10 active:scale-95 cursor-pointer"
          >
            Start Free Interview
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6 text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800 border border-amber-200/50">
                AI-Powered • Voice-First • Bias-Free
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7.5xl font-black text-slate-900 leading-[1.08] tracking-tight">
              The AI That <br />
              <span className="bg-gradient-to-r from-slate-900 via-amber-600 to-slate-950 bg-clip-text text-transparent">Interviews Like <br />a Human</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-normal max-w-lg">
              Adaptive questions. Real-time evaluation. Instant hiring reports. No scripts. No bias. Just signal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button 
                onClick={() => openModal("candidate")}
                className="bg-[#121212] hover:bg-slate-800 text-white font-bold text-base px-8 py-4 rounded-xl transition duration-150 hover:shadow-xl shadow-black/15 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                Start Free Interview
              </button>
              <button 
                onClick={() => scrollToSection("see-it-in-action")}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-base px-8 py-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 hover:shadow-md active:scale-98 cursor-pointer"
              >
                Watch Demo
              </button>
            </div>

            <p className="text-sm text-slate-400 font-medium">
              No credit card required • Results in 30 min • 500+ companies
            </p>
          </div>

          {/* Right Column (Hero Animation Mockup) */}
          <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
            
            <div className="relative bg-[#FAF9F5] border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
              
              {/* Question */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                  {heroQuestion}
                </h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-700">Node.js</span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-500">medium</span>
                </div>
              </div>

              {/* Response Block */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 self-start px-2.5 py-1 rounded-full border border-amber-200/30">
                  <span className={`w-2 h-2 rounded-full bg-amber-500 ${heroStatus === 'typing' ? 'animate-ping' : ''}`}></span>
                  {heroStatus === "typing" ? "Listening..." : heroStatus === "evaluating" ? "Evaluating..." : "Completed"}
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[110px] text-slate-700 font-normal leading-relaxed relative flex flex-col justify-between">
                  <p className="text-sm md:text-base text-left">
                    {heroTypedText}
                    {heroStatus === "typing" && <span className="inline-block w-2.5 h-4 ml-1 bg-amber-500 animate-pulse">|</span>}
                  </p>
                  
                  {heroStatus === "done" && (
                    <button 
                      onClick={restartHeroAnimation}
                      className="absolute bottom-3 right-3 text-slate-400 hover:text-amber-600 transition p-1 cursor-pointer"
                      title="Replay Animation"
                    >
                      <RotateCcw className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bars */}
              <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 text-left">
                {/* Tech */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Technical</span>
                    <span className="text-slate-800">{heroScores.technical}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 transition-all duration-1000 ease-out" 
                      style={{ width: `${heroScores.technical}%` }}
                    ></div>
                  </div>
                </div>
                {/* Communication */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Communication</span>
                    <span className="text-slate-800">{heroScores.communication}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 transition-all duration-1000 ease-out" 
                      style={{ width: `${heroScores.communication}%` }}
                    ></div>
                  </div>
                </div>
                {/* Confidence */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Confidence</span>
                    <span className="text-slate-800">{heroScores.confidence}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 transition-all duration-1000 ease-out" 
                      style={{ width: `${heroScores.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 border-t border-slate-100/80 pt-4">
                <span>Question 3 of 10</span>
                <Mic className="w-4.5 h-4.5 text-slate-400" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="bg-slate-100/50 border-y border-slate-200/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
          <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Trusted by hiring teams at
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["Northwind", "Acmecorp", "Vertex", "Lumen", "Fjord"].map((company, index) => (
              <span 
                key={index}
                className="text-lg md:text-xl font-extrabold tracking-tight text-slate-400 hover:text-slate-600 transition duration-150 select-none cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-left mb-16 md:mb-20">
          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800 mb-4 border border-amber-200/50">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Three steps to a smarter hire
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 relative">
          
          {/* Subtle dashed line connecting steps */}
          <div className="absolute top-1/4 left-10 right-10 h-0.5 border-t border-dashed border-slate-200 hidden md:block -z-10"></div>

          {/* Step 1 */}
          <div className="flex flex-col gap-5 bg-white md:bg-transparent p-6 md:p-0 rounded-2xl border border-slate-200/60 md:border-0 shadow-md md:shadow-none hover:shadow-lg md:hover:shadow-none transition text-left">
            <span className="text-5xl font-black text-amber-600">1</span>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-955 mt-1">Fill Your Profile</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Enter your role, skills, and experience so the interview targets exactly what matters.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-5 bg-white md:bg-transparent p-6 md:p-0 rounded-2xl border border-slate-200/60 md:border-0 shadow-md md:shadow-none hover:shadow-lg md:hover:shadow-none transition text-left">
            <span className="text-5xl font-black text-amber-600">2</span>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-955 mt-1">Interview by Voice</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Speak naturally. The AI listens, evaluates, and adapts every question in real time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-5 bg-white md:bg-transparent p-6 md:p-0 rounded-2xl border border-slate-200/60 md:border-0 shadow-md md:shadow-none hover:shadow-lg md:hover:shadow-none transition text-left">
            <span className="text-5xl font-black text-amber-600">3</span>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-955 mt-1">Get Your Report</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Receive an instant structured report with scores, insights, and a clear recommendation.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="bg-[#FAF9F5] border-t border-slate-200/60 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-left mb-16 md:mb-20">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800 mb-4 border border-amber-200/50">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight max-w-2xl leading-tight">
              Everything a great interviewer does — automated
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition duration-300 group text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 transition">
                <Shuffle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Adaptive Questions</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Adjusts after every answer, with no fixed script to game.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition duration-300 group text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 transition">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Voice-First</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Speak naturally, exactly like a real interview. No typing required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition duration-300 group text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Evaluation</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Scored instantly on three dimensions as you speak.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition duration-300 group text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 transition">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hiring Report</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Strengths, weaknesses, and a clear recommendation on completion.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition duration-300 group text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 transition">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Bias</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                The same fair rubric applied to every single candidate.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition duration-300 group text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-100 transition">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Any Technical Role</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Frontend, backend, data, devops, and everything in between.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SEE IT IN ACTION */}
      <section id="see-it-in-action" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">
            See it in action
          </h2>
          
          {/* Question Selector Tabs */}
          <div className="inline-flex flex-wrap justify-center p-1 bg-slate-100 rounded-xl max-w-2xl">
            {SIMULATION_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => startSimulation(q.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  selectedSimId === q.id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-905"
                }`}
              >
                {q.category}
              </button>
            ))}
          </div>
        </div>

        {/* Simulator Frame */}
        <div className="w-full max-w-4xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl blur-2xl opacity-15"></div>
          
          <div className="relative bg-[#111111] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col gap-6 md:gap-8">
            
            {/* Simulation Header */}
            <div className="flex flex-col gap-3 text-left">
              <h3 className="text-xl md:text-2xl font-bold text-zinc-100 leading-snug">
                {currentSim.question}
              </h3>
              
              <div className="flex gap-2.5">
                <span className="px-3 py-1 text-xs font-semibold rounded bg-[#d97706]/20 text-[#fbbf24] border border-[#d97706]/10">
                  {currentSim.category}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded bg-zinc-800 text-zinc-400">
                  {currentSim.difficulty}
                </span>
              </div>
            </div>

            {/* Text Input Block */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-semibold self-start text-amber-500 bg-[#d97706]/10 px-3 py-1 rounded-full border border-amber-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  Listening...
                </span>
              </div>

              <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-5 min-h-[120px] text-zinc-300 font-mono text-sm md:text-base leading-relaxed relative text-left">
                <p>
                  {simTypedText}
                  {simStatus === "typing" && <span className="inline-block w-2.5 h-4 ml-1 bg-amber-500 animate-pulse">|</span>}
                </p>

                {simStatus === "countdown" && (
                  <div className="absolute bottom-4 left-5 text-xs md:text-sm font-semibold text-amber-500 animate-pulse font-sans">
                    Submitting in {simCountdown}...
                  </div>
                )}
                
                {simStatus === "done" && (
                  <button 
                    onClick={() => startSimulation(selectedSimId)}
                    className="absolute bottom-4 right-4 text-zinc-500 hover:text-amber-505 transition p-1 bg-zinc-800 rounded-lg cursor-pointer"
                    title="Restart Simulation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Score Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/80 pt-6">
              
              {/* Technical Card */}
              <div className="bg-[#1e1e1e] border border-zinc-800/50 p-5 rounded-2xl text-left flex flex-col justify-between min-h-[110px]">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Technical</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-zinc-100">{simScores.technical ? `${simScores.technical / 10}/10` : "—"}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${simScores.technical}%` }}
                  ></div>
                </div>
              </div>

              {/* Communication Card */}
              <div className="bg-[#1e1e1e] border border-zinc-800/50 p-5 rounded-2xl text-left flex flex-col justify-between min-h-[110px]">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Communication</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-zinc-100">{simScores.communication ? `${simScores.communication / 10}/10` : "—"}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${simScores.communication}%` }}
                  ></div>
                </div>
              </div>

              {/* Confidence Card */}
              <div className="bg-[#1e1e1e] border border-zinc-800/50 p-5 rounded-2xl text-left flex flex-col justify-between min-h-[110px]">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Confidence</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-zinc-100">{simScores.confidence ? `${simScores.confidence / 10}/10` : "—"}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${simScores.confidence}%` }}
                  ></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FOR RECRUITERS */}
      <section id="for-recruiters" className="bg-[#FAF9F5] border-t border-slate-200/60 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left text column */}
            <div className="flex flex-col gap-6 text-left">
              <div>
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800 mb-2 border border-amber-200/50">
                  FOR RECRUITERS
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Screen candidates at scale. <br />Without the bias.
              </h2>

              <ul className="flex flex-col gap-4 mt-2">
                {[
                  "Consistent scoring rubric for every candidate",
                  "Full transcript + evaluation report per interview",
                  "Compare candidates side by side",
                  "Works for any technical role or seniority level"
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5.5 h-5.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-slate-600 font-medium text-sm md:text-base">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <button 
                  onClick={() => openModal("demo")}
                  className="bg-[#121212] hover:bg-slate-800 text-white font-bold text-base px-8 py-4 rounded-xl transition duration-150 hover:shadow-xl shadow-black/15 active:scale-98 cursor-pointer"
                >
                  Book a Demo
                </button>
              </div>
            </div>

            {/* Right mockup column (High Fidelity Report Card Mockup) */}
            <div className="relative w-full max-w-md lg:max-w-none mx-auto">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl blur-xl opacity-15"></div>
              
              <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 hover:scale-[1.01] transition duration-300">
                
                {/* Header */}
                <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-100 pb-4">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Interview Report</span>
                  <span className="text-slate-400 font-medium">Mar 12, 2026</span>
                </div>

                {/* Score & Stamp */}
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">8.2</span>
                    <span className="text-xl text-slate-400 font-bold">/10</span>
                  </div>
                  <span className="px-3.5 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200/40">
                    Strong Hire
                  </span>
                </div>

                {/* Strengths */}
                <div className="flex flex-col gap-2.5 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Strengths</span>
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-slate-700 text-sm font-semibold">Strong system design fundamentals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-slate-700 text-sm font-semibold">Clear, structured communication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-slate-700 text-sm font-semibold">Handled follow-ups well</span>
                    </li>
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="flex flex-col gap-2.5 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weaknesses</span>
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      <span className="text-slate-700 text-sm font-semibold">Limited depth on database indexing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      <span className="text-slate-700 text-sm font-semibold">Hesitant on time-complexity tradeoffs</span>
                    </li>
                  </ul>
                </div>

                {/* Summary Evaluation */}
                <div className="border-t border-slate-100 pt-5 text-left text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                  A confident senior candidate with excellent design instincts. Recommend advancing to the onsite round with a focus on data modeling depth.
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-left mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            What people are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Testimonial 1 */}
          <div className="bg-[#FAF9F5] border border-slate-200/70 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] hover:shadow-lg hover:border-slate-300 transition duration-200">
            <div className="flex flex-col gap-4 text-left">
              <span className="text-amber-500 text-4xl font-serif">“</span>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-semibold">
                It felt like a real interview, not a quiz. The questions actually changed when I gave strong answers.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 border-t border-slate-200/50 pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 select-none">
                PM
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-900">Priya M.</h4>
                <p className="text-xs text-slate-400 font-semibold">Software Engineer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-[#FAF9F5] border border-slate-200/70 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] hover:shadow-lg hover:border-slate-300 transition duration-200">
            <div className="flex flex-col gap-4 text-left">
              <span className="text-amber-500 text-4xl font-serif">“</span>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-semibold">
                We screened 40 candidates in a day. Every report was consistent and actionable.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 border-t border-slate-200/50 pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 select-none">
                JT
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-900">James T.</h4>
                <p className="text-xs text-slate-400 font-semibold">Engineering Manager, Series B startup</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-[#FAF9F5] border border-slate-200/70 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] hover:shadow-lg hover:border-slate-300 transition duration-200">
            <div className="flex flex-col gap-4 text-left">
              <span className="text-amber-500 text-4xl font-serif">“</span>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-semibold">
                The bias-free scoring gave us confidence in our shortlist for the first time.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 border-t border-slate-200/50 pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 select-none">
                SK
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-900">Sara K.</h4>
                <p className="text-xs text-slate-400 font-semibold">Head of Talent</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 md:py-28 border-t border-slate-200/60">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Simple, transparent pricing
          </h2>
          
          {/* Switch toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200/20">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                billingPeriod === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-505 hover:text-slate-950"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                billingPeriod === "annual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-505 hover:text-slate-955"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-805">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5.5xl mx-auto">
          
          {/* Card 1: Free */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition duration-200">
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-slate-950">${prices.free}</span>
              </div>
              
              <ul className="flex flex-col gap-3.5 border-t border-slate-100 pt-5 mt-4">
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  1 Interview
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Basic report
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  No credit card required
                </li>
              </ul>
            </div>
            <button
              onClick={() => openModal("candidate")}
              className="w-full mt-8 bg-white hover:bg-slate-55 text-slate-900 border border-slate-300 font-bold py-3.5 rounded-xl transition duration-150 cursor-pointer"
            >
              Start Free
            </button>
          </div>

          {/* Card 2: Pro (Featured Card) */}
          <div className="bg-[#121212] text-white border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition duration-300">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/10 rounded-full blur-xl"></div>
            
            <div className="flex flex-col text-left">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-505 text-black rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-white">${prices.pro}</span>
                <span className="text-sm text-zinc-400">/month</span>
              </div>
              
              <ul className="flex flex-col gap-3.5 border-t border-zinc-850 pt-5 mt-4">
                <li className="flex items-center gap-2.5 text-sm font-semibold text-zinc-300">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Unlimited interviews
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-zinc-300">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Full voice mode
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-zinc-300">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Detailed reports
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-zinc-300">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Priority support
                </li>
              </ul>
            </div>
            <button
              onClick={() => openModal("candidate")}
              className="w-full mt-8 bg-white hover:bg-zinc-100 text-slate-900 font-bold py-3.5 rounded-xl transition duration-155 cursor-pointer"
            >
              Get Pro
            </button>
          </div>

          {/* Card 3: Enterprise */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition duration-200">
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-slate-950">{prices.enterprise}</span>
              </div>
              
              <ul className="flex flex-col gap-3.5 border-t border-slate-100 pt-5 mt-4">
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Team dashboard
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  API access
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  ATS integration
                </li>
                <li className="flex items-center gap-2.5 text-sm font-semibold text-slate-600">
                  <Check className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  Dedicated support
                </li>
              </ul>
            </div>
            <button
              onClick={() => openModal("demo")}
              className="w-full mt-8 bg-white hover:bg-slate-55 text-slate-900 border border-slate-300 font-bold py-3.5 rounded-xl transition duration-150 cursor-pointer"
            >
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER CTA BANNER */}
      <section className="bg-[#121212] text-white border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8 relative overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight max-w-2xl leading-tight">
            Ready to hire smarter?
          </h2>
          
          <p className="text-base md:text-lg text-zinc-400 max-w-md">
            Join thousands of candidates and companies using AI to hire better.
          </p>

          <button 
            onClick={() => openModal("candidate")}
            className="bg-amber-605 hover:bg-amber-700 text-white font-bold text-base px-8 py-4 rounded-xl transition duration-150 hover:shadow-xl shadow-amber-600/10 active:scale-98 relative z-10 cursor-pointer"
          >
            Start Your Free Interview
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-12 text-left">
          
          {/* Brand Info Column */}
          <div className="md:col-span-2 flex flex-col gap-4 pr-0 md:pr-12">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center">
              HireIQ
              <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-sm ml-1"></span>
            </span>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
              Adaptive AI interviews and instant hiring reports. No scripts. No bias. Just signal.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-905">Product</span>
            <ul className="flex flex-col gap-3">
              <li><button onClick={() => scrollToSection("features")} className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection("how-it-works")} className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition cursor-pointer">How it Works</button></li>
              <li><button onClick={() => scrollToSection("pricing")} className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition cursor-pointer">Pricing</button></li>
              <li><button onClick={() => scrollToSection("for-recruiters")} className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition cursor-pointer">For Recruiters</button></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-905">Company</span>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">About</a></li>
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Careers</a></li>
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Blog</a></li>
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Contact</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-905">Legal</span>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Privacy</a></li>
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Terms</a></li>
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Security</a></li>
              <li><a href="#" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition">Cookies</a></li>
            </ul>
          </div>

        </div>
      </footer>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col transform transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5.5 h-5.5" />
            </button>

            {/* Content Switch */}
            {modalType === "candidate" ? (
              <div className="p-6 md:p-10">
                {/* Render CandidateForm but wrapped style to make it responsive inside the modal */}
                <div className="w-full flex justify-center">
                  <CandidateForm onSuccessSubmit={() => setIsModalOpen(false)} />
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-10 flex flex-col gap-6 text-left">
                <div className="text-center mb-2">
                  <h3 className="text-3xl font-black text-slate-905 flex items-center justify-center gap-1.5">
                    Book a Demo
                  </h3>
                  <p className="text-slate-400 font-medium mt-1">
                    See how HireIQ can scale your technical hiring.
                  </p>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Demo request submitted successfully! We will contact you soon.");
                    setIsModalOpen(false);
                  }}
                  className="flex flex-col gap-4"
                >
                  <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm">
                    Full Name
                    <input 
                      type="text" 
                      required
                      placeholder="Jane Doe" 
                      className="border border-slate-200 rounded-xl px-4 py-3 text-slate-850 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm">
                    Work Email
                    <input 
                      type="email" 
                      required
                      placeholder="jane@company.com" 
                      className="border border-slate-200 rounded-xl px-4 py-3 text-slate-850 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm">
                    Company Name
                    <input 
                      type="text" 
                      required
                      placeholder="Acme Inc." 
                      className="border border-slate-200 rounded-xl px-4 py-3 text-slate-850 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm">
                    Role / Job Title
                    <input 
                      type="text" 
                      placeholder="Head of Engineering" 
                      className="border border-slate-200 rounded-xl px-4 py-3 text-slate-850 font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white"
                    />
                  </label>

                  <button 
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-705 text-white font-bold py-3.5 rounded-xl transition duration-150 hover:shadow-xl mt-3 cursor-pointer"
                  >
                    Request Demo Access
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
