import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import { initiateRazorpayPayment } from "../utils/razorpay";
import { 
  Sparkles, 
  ArrowRight, 
  Plus, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  CheckCircle2
} from "lucide-react";

const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  // History sessions list
  const [sessions, setSessions] = useState([]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    // Sync with auth status
    refreshUser();

    const fetchUserSessions = async () => {
      if (!user?._id) return;
      
      const userKey = `hireiq_sessions_${user._id}`;
      try {
        const res = await fetch("http://localhost:5000/api/interview/user/history", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setSessions(data);
          localStorage.setItem(userKey, JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn("Could not fetch remote user sessions:", err);
      }

      // Fallback to user-scoped localStorage
      const cached = localStorage.getItem(userKey);
      if (cached) {
        setSessions(JSON.parse(cached));
      } else {
        setSessions([]);
      }
    };

    fetchUserSessions();
  }, [user?._id]);


  // Compute greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    const firstName = user?.name ? user.name.split(" ")[0] : "there";
    if (hr < 12) return `Good morning, ${firstName}`;
    if (hr < 17) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };

  // Trigger Razorpay Payment for ₹179 / 5 Premium Interviews
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setPaymentMessage("");

    await initiateRazorpayPayment({
      user,
      onSuccess: async (data) => {
        setIsUpgrading(false);
        setUpgradeSuccess(true);
        setPaymentMessage(data.message || "Payment successful! 5 Premium interviews unlocked.");
        await refreshUser();
        setTimeout(() => {
          setUpgradeSuccess(false);
          setPaymentMessage("");
        }, 4000);
      },
      onError: (err) => {
        setIsUpgrading(false);
        console.error("Payment error:", err);
        alert(err.message || "Payment could not be completed. Please try again.");
      },
    });
  };

  // Plan and limit metrics
  const isPremium = user?.plan === "premium";
  const currentPlan = isPremium ? "premium" : "free";
  const used = user?.interviewsUsed || 0;
  const allowed = user?.interviewsAllowed || 1;
  const remaining = Math.max(0, allowed - used);
  const limitReached = used >= allowed;

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans antialiased text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-10">
        
        {/* Workspace Greeting */}
        <div className="text-left">
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
            Workspace
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-1 leading-tight">
            {getGreeting()}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Run thoughtful, consistent interviews with less manual work.
          </p>
        </div>

        {/* Payment Success Alert */}
        {upgradeSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-xs animate-fade-in text-left">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">{paymentMessage || "5 Premium Interviews unlocked successfully!"}</p>
              <p className="text-xs text-emerald-700">Detailed AI recruiter evaluation reports are now active for your sessions.</p>
            </div>
          </div>
        )}

        {/* Action Grid (Left Card & Right Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Plan Status Card */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-slate-900 text-lg capitalize">
                  {currentPlan} Plan
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {used} of {allowed} used ({remaining} left)
              </span>
            </div>

            <div className="my-6">
              <p className="text-slate-500 text-sm font-medium text-left">
                {limitReached 
                  ? "You have used all your interview credits. Get 5 more premium interviews for ₹179." 
                  : `You have ${remaining} interview${remaining === 1 ? "" : "s"} remaining with detailed reports.`
                }
              </p>
              
              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full mt-4 overflow-hidden relative border border-slate-250/20">
                <div 
                  className="h-full bg-amber-600 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min((used / allowed) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 items-center">
              {limitReached ? (
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isUpgrading ? "Opening Razorpay..." : "Get 5 Premium Interviews (₹179)"}</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/dashboard/new-interview")}
                  className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>Start New Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              <button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="text-xs text-slate-400 hover:text-amber-600 font-semibold transition cursor-pointer select-none flex items-center gap-1.5 mt-1"
              >
                {isUpgrading ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    Processing Razorpay Checkout...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pay ₹179 for 5 Premium Interviews + Detailed Report</span>
                  </>
                )}
              </button>
            </div>
          </div>


          {/* New Interview Workspace Card */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-slate-100/50 text-left">
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
                Interview workspace
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Ready for your next candidate?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-medium mt-2">
                Add candidate details and let HireIQ guide the conversation.
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  if (limitReached && currentPlan === "free") {
                    alert("Interview limit reached. Please click 'Upgrade to Premium' in the left card to continue testing!");
                  } else {
                    navigate("/dashboard/new-interview");
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-4 bg-[#121212] hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-black/10 active:scale-98 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>New interview</span>
              </button>
            </div>
          </div>

        </div>

        {/* Interview History Card */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="text-left">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Interview history
              </h2>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                Your recent candidate sessions.
              </p>
            </div>
            <Link 
              to="/reports"
              className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-0.5"
            >
              <span>View reports</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-3 sm:px-4">Candidate</th>
                  <th className="py-4 px-3 sm:px-4">Role</th>
                  <th className="py-4 px-3 sm:px-4">Date</th>
                  <th className="py-4 px-3 sm:px-4 text-center">Score</th>
                  <th className="py-4 px-3 sm:px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm font-semibold text-slate-400">
                      No interviews started yet. Click "+ New interview" to begin!
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr 
                      key={session.id} 
                      onClick={() => {
                        if (session.status === "Completed") {
                          navigate(`/reports/${session.id}`);
                        } else {
                          navigate(`/interview/${session.id}`);
                        }
                      }}
                      className="hover:bg-slate-50/50 transition cursor-pointer"
                    >
                      {/* Name */}
                      <td className="py-4 px-3 sm:px-4 text-left">
                        <span className="font-bold text-slate-900 text-sm">
                          {session.name}
                        </span>
                      </td>
                      {/* Role */}
                      <td className="py-4 px-3 sm:px-4 text-left">
                        <span className="text-slate-500 text-sm font-medium">
                          {session.role}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="py-4 px-3 sm:px-4 text-left">
                        <span className="text-slate-400 text-xs font-semibold">
                          {session.date}
                        </span>
                      </td>
                      {/* Score */}
                      <td className="py-4 px-3 sm:px-4 text-center">
                        {session.status === "Completed" ? (
                          <span className="inline-flex items-center justify-center font-extrabold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg text-xs px-2.5 py-1">
                            {Math.round(Number(session.score) > 10 ? Number(session.score) : Number(session.score) * 10)}/100
                          </span>
                        ) : (
                          <span className="text-slate-350 text-sm font-bold">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="py-4 px-3 sm:px-4 text-right">
                        <span 
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            session.status === "Completed" 
                              ? "bg-green-50 text-green-700 border border-green-100" 
                              : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;
