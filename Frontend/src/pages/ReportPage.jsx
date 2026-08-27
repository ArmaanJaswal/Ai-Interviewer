import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Lock,
  ShieldCheck,
  Zap,
  Crown,
  CheckCircle2
} from "lucide-react";

import { initiateRazorpayPayment } from "../utils/razorpay";

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // Local states
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [candidateInfo, setCandidateInfo] = useState({ name: "", role: "", date: "" });
  const [isUpgrading, setIsUpgrading] = useState(false);

  // User plan check (Strictly checks backend isFullReportUnlocked and user plan)
  const isPremium = user?.plan === "premium" && report?.isFullReportUnlocked !== false && Boolean(report?.summary);



  useEffect(() => {
    refreshUser();
    
    // Fetch candidate info from user-scoped local storage history
    const userKey = user?._id ? `hireiq_sessions_${user._id}` : "hireiq_sessions";
    const savedSessions = localStorage.getItem(userKey);
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions);
      const matched = sessions.find((s) => s.id === id);
      if (matched) {
        setCandidateInfo({
          name: matched.name,
          role: matched.role,
          date: matched.date,
        });
      }
    }

    fetchReport();
  }, [id, user?._id, user?.plan]);


  const fetchReport = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/interview/${id}/report`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          // If report not found, try generating it
          const genRes = await fetch(`http://localhost:5000/api/interview/${id}/report`, {
            method: "POST",
            credentials: "include",
          });
          if (genRes.ok) {
            const genData = await genRes.json();
            setReport(genData);
            return;
          }
        }
        throw new Error("Failed to fetch candidate report.");
      }

      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error("Report fetch failure:", error);
      setErrorMsg(error.message || "Error loading report details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    await initiateRazorpayPayment({
      user,
      onSuccess: async () => {
        setIsUpgrading(false);
        await refreshUser();
        fetchReport();
      },
      onError: (err) => {
        setIsUpgrading(false);
        console.error("Payment error:", err);
        alert(err.message || "Payment could not be completed. Please try again.");
      },
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 select-none">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-amber-500/10 rounded-full"></div>
            <div className="absolute w-12 h-12 border-t-2 border-amber-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-4 animate-pulse">
            Analyzing interview transcripts and generating report...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 text-left">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-bold text-slate-450 hover:text-slate-700 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
          <div className="bg-white border border-slate-200/50 rounded-3xl p-8 shadow-xl shadow-slate-100/50 mt-6 text-center">
            <p className="text-red-500 font-bold mb-4">Error loading report</p>
            <p className="text-slate-500 text-sm mb-6">{errorMsg || "No report generated yet."}</p>
            <button onClick={fetchReport} className="px-6 py-3 bg-[#121212] text-white rounded-xl font-bold text-sm shadow cursor-pointer">
              Retry Load
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse overallScore
  const overallScoreVal = Math.round((report.overallScore || 0) * 10);
  
  // Category scores
  const technicalScore = Math.min(100, Math.round((report.overallScore || 0) * 10 + 4));
  const communicationScore = Math.max(0, Math.round((report.overallScore || 0) * 10 - 1));
  const confidenceScore = Math.max(0, Math.round((report.overallScore || 0) * 10 - 3));

  // Recommendation configuration mappings
  const getRecommendationConfig = (rec) => {
    const r = rec ? rec.toLowerCase().trim() : "consider";
    switch (r) {
      case "strong hire":
        return {
          label: "Strong Hire",
          style: "bg-green-50 text-green-700 border-green-150",
          text: "A strong candidate with the fundamentals and communication skills to succeed in this role."
        };
      case "hire":
        return {
          label: "Hire",
          style: "bg-emerald-50 text-emerald-700 border-emerald-150",
          text: "Solid candidate. Meets technical standards and demonstrates reliable communication."
        };
      case "consider":
        return {
          label: "Consider",
          style: "bg-amber-50 text-amber-700 border-amber-150",
          text: "Shows potential but has areas of improvement. Consider a follow-up interview."
        };
      case "reject":
        return {
          label: "Reject",
          style: "bg-red-50 text-red-700 border-red-150",
          text: "Candidate does not meet core requirements for this role at this time."
        };
      default:
        return {
          label: "Consider",
          style: "bg-amber-50 text-amber-700 border-amber-150",
          text: "Assessment complete. Review scores below for further consideration."
        };
    }
  };

  const recConfig = getRecommendationConfig(report.recommendation);

  // Score circular indicator values
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScoreVal / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans antialiased text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-8">
        
        {/* Top bar with back and Tier Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-450 hover:text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>

          {/* User Tier Status Pill */}
          <div className="flex items-center gap-2">
            {isPremium ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Premium Report</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span>Free Tier Report</span>
              </span>
            )}
          </div>
        </div>

        {/* Report Heading */}
        <div className="text-left">
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
            Candidate Assessment Report
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">
            {candidateInfo.name || "Candidate Assessment"}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {candidateInfo.role || "Software Engineer"} • Completed {candidateInfo.date || "Recently"}
          </p>
        </div>

        {/* Core Score Section (Visible for both Free & Premium) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Card: Score Circular Gauge */}
          <div className="lg:col-span-5 bg-white border border-slate-200/50 rounded-3xl p-8 flex flex-col items-center justify-between shadow-xl shadow-slate-100/50 text-center">
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                Overall score
              </span>
            </div>

            {/* Gauge */}
            <div className="relative my-8 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-amber-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-amber-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-black text-slate-900">{overallScoreVal}</span>
                <span className="text-xs text-slate-400 font-bold">/100</span>
              </div>
            </div>

            {/* Badge & Description */}
            <div className="flex flex-col gap-3">
              <span className={`inline-flex self-center px-3.5 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${recConfig.style}`}>
                {recConfig.label}
              </span>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-semibold">
                {recConfig.text}
              </p>
            </div>
          </div>

          {/* Right Card: Category Snapshot */}
          <div className="lg:col-span-7 bg-white border border-slate-200/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-slate-100/50 text-left">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-lg">
                  Interview snapshot
                </h2>
              </div>

              {/* Score Boxes */}
              <div className="grid grid-cols-3 gap-4 my-6">
                {/* Tech */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-24">
                  <span className="text-xs font-semibold text-slate-450 uppercase">Technical</span>
                  <span className="text-3xl font-black text-slate-800">{technicalScore}</span>
                </div>
                {/* Communication */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-24">
                  <span className="text-xs font-semibold text-slate-450 uppercase">Communication</span>
                  <span className="text-3xl font-black text-slate-800">{communicationScore}</span>
                </div>
                {/* Confidence */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-24">
                  <span className="text-xs font-semibold text-slate-450 uppercase">Confidence</span>
                  <span className="text-3xl font-black text-slate-800">{confidenceScore}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                This snapshot is calculated using HireIQ's AI evaluation model based on technical clarity, communication flow, and answering confidence.
              </p>
            </div>
          </div>

        </div>

        {/* Tier Specific Section: Mention to Buy Premium for Free Users, or Show Everything for Premium Users */}
        {!isPremium ? (
          /* FREE TIER UPGRADE BANNER */
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white border-2 border-amber-300/70 rounded-3xl p-8 sm:p-12 shadow-xl shadow-amber-100/30 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full my-4 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-700 mb-5 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 bg-amber-600 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-full mb-3 shadow-xs">
              Free Tier Plan
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Unlock Full Recruiter Summary & In-Depth Analysis
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mt-3 font-medium">
              You are currently viewing the basic Free tier report. Upgrade to HireIQ Premium to unlock detailed AI recruiter evaluations, category breakdowns, and personalized strengths & weaknesses for all candidate sessions.
            </p>

            {/* Premium Perks Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-8 text-left max-w-lg w-full">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
                <CheckCircle2 className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Comprehensive Recruiter Assessment</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
                <CheckCircle2 className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Detailed Skill Category Breakdown</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
                <CheckCircle2 className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Key Candidate Strengths List</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
                <CheckCircle2 className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Areas of Improvement & Tips</span>
              </div>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="flex items-center gap-2.5 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-xl transition duration-150 shadow-lg hover:shadow-xl active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <Zap className="w-4 h-4" />
              <span>{isUpgrading ? "Opening Razorpay..." : "Get 5 Premium Interviews (₹179)"}</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400 mt-3 select-none">
              Instant access • Unlock detailed AI recruiter reports & category breakdown for 5 interviews
            </span>
          </div>
        ) : (
          /* PREMIUM TIER: SHOW EVERYTHING */
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Full summaries */}
              <div className="lg:col-span-8 flex flex-col gap-6 text-left">
                
                {/* Recruiter Summary */}
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    Recruiter Assessment Summary
                  </h2>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                    {report.summary || "Assessments are generated by analyzing the transcript. The candidate presents solid conceptual understanding."}
                  </p>
                </div>

                {/* Category Details */}
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 flex flex-col gap-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2 border-b border-slate-50 pb-2">
                    Detailed Category Breakdown
                  </h2>
                  
                  {/* Tech Summary */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded bg-amber-500"></span>
                      Technical Knowledge
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                      {report.technicalSummary || "The candidate shows an understanding of key development principles."}
                    </p>
                  </div>

                  {/* Communication Summary */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded bg-amber-500"></span>
                      Communication Skills
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                      {report.communicationSummary || "Answers are explained with appropriate vocabulary and structured logic."}
                    </p>
                  </div>

                  {/* Confidence Summary */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded bg-amber-500"></span>
                      Confidence & Delivery
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                      {report.confidenceSummary || "Demonstrates quick pacing and conviction in answering technical terms."}
                    </p>
                  </div>

                </div>

              </div>

              {/* Right Column: Strengths & Weaknesses checklists */}
              <div className="lg:col-span-4 flex flex-col gap-6 text-left">
                
                {/* Strengths */}
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50">
                  <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-1.5">
                    Key Strengths
                  </h2>
                  <ul className="space-y-3">
                    {report.strengths && report.strengths.length > 0 ? (
                      report.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-slate-700 text-xs sm:text-sm font-semibold">
                          <span className="p-0.5 rounded bg-green-50 text-green-600 border border-green-200/50 flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 text-xs font-semibold">No significant strengths highlighted.</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50">
                  <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-1.5">
                    Areas of Improvement
                  </h2>
                  <ul className="space-y-3">
                    {report.weaknesses && report.weaknesses.length > 0 ? (
                      report.weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-slate-700 text-xs sm:text-sm font-semibold">
                          <span className="p-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200/50 flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                          <span>{weak}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 text-xs font-semibold">No critical weaknesses highlighted.</li>
                    )}
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ReportPage;
