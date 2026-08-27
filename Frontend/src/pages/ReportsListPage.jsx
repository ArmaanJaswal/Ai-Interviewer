import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { FileText, Search, ChevronRight, Sparkles } from "lucide-react";

const ReportsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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


  // Filter sessions based on search (candidate name or role)
  const filteredSessions = sessions.filter((session) => {
    const q = searchQuery.toLowerCase();
    return (
      session.name.toLowerCase().includes(q) ||
      session.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans antialiased text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-8">
        
        {/* Title */}
        <div className="text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
              Report Archive
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">
              Candidate Assessments
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Review and manage all completed candidate sessions.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-xs sm:text-sm transition font-medium"
            />
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-slate-200/50 rounded-3xl shadow-xl shadow-slate-100/50 p-6 sm:p-8 text-left">
          {filteredSessions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4 border border-dashed border-slate-250">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-slate-450 font-bold text-base">No assessments found</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                {searchQuery 
                  ? "Try refining your search terms or filters." 
                  : "Start a new candidate interview to generate evaluation reports."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    if (session.status === "Completed") {
                      navigate(`/reports/${session.id}`);
                    } else {
                      navigate(`/interview/${session.id}`);
                    }
                  }}
                  className="group bg-slate-50/20 hover:bg-slate-50/60 border border-slate-200/50 hover:border-amber-200/40 rounded-2xl p-5 cursor-pointer transition duration-200 flex flex-col justify-between h-48 hover:shadow-md"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-slate-900 group-hover:text-amber-700 transition text-base">
                        {session.name}
                      </span>
                      {session.status === "Completed" ? (
                        <span className="inline-flex items-center text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5">
                          {Math.round(Number(session.score) > 10 ? Number(session.score) : Number(session.score) * 10)}/100
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5 animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 font-medium text-xs sm:text-sm">
                      {session.role}
                    </span>
                  </div>

                  <div className="border-t border-slate-100/80 pt-4 flex justify-between items-center text-xs font-semibold text-slate-400">
                    <span>{session.date}</span>
                    <span className="text-amber-600 group-hover:translate-x-1.5 transition duration-200 flex items-center gap-0.5">
                      <span>{session.status === "Completed" ? "View report" : "Resume"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ReportsListPage;
