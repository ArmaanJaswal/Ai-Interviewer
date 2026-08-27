import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, Plus, X } from "lucide-react";

const NewInterviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState("1-2 years");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Add skill to the tag list
  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput("");
    }
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Map experience text to a numeric value for the database
  const getExperienceNumber = (expStr) => {
    switch (expStr) {
      case "0-1 years":
        return 1;
      case "1-2 years":
        return 2;
      case "3-5 years":
        return 4;
      case "5+ years":
        return 6;
      default:
        return 2;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (skills.length === 0) {
      setErrorMsg("Please add at least one skill.");
      return;
    }

    setLoading(true);

    try {
      const parsedExperience = getExperienceNumber(experience);

      // 1. Create candidate record in database with credentials
      const candidateRes = await fetch("http://localhost:5000/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          skills,
          experience: parsedExperience,
        }),
        credentials: "include",
      });

      if (!candidateRes.ok) {
        const errData = await candidateRes.json();
        throw new Error(errData.message || "Failed to save candidate details.");
      }

      const candidateData = await candidateRes.json();
      const candidateId = candidateData.candidate?._id;

      if (!candidateId) {
        throw new Error("No candidate ID returned from the server.");
      }

      // 2. Initialize interview session using candidateId
      const interviewRes = await fetch("http://localhost:5000/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
        credentials: "include",
      });

      if (!interviewRes.ok) {
        const errData = await interviewRes.json();
        throw new Error(errData.message || "Failed to create interview session. Ensure you have remaining interviews.");
      }

      const interviewData = await interviewRes.json();
      const interviewId = interviewData.interviewId;

      // 3. Save interview session in user-scoped localStorage history
      const userKey = user?._id ? `hireiq_sessions_${user._id}` : "hireiq_sessions";
      const savedSessions = localStorage.getItem(userKey);
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      
      const newSession = {
        id: interviewId,
        name,
        role,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        score: null,
        status: "In Progress",
        skills,
        experience: parsedExperience,
      };

      localStorage.setItem(userKey, JSON.stringify([newSession, ...sessions]));

      // Cache first question details for the session
      localStorage.setItem(
        `hireiq_active_question_${interviewId}`,
        JSON.stringify({
          questionNumber: interviewData.questionNumber,
          maxQuestions: interviewData.maxQuestions,
          questionText: interviewData.questionText,
          topic: interviewData.topic,
          difficulty: interviewData.difficulty,
        })
      );


      // 4. Redirect to interview workspace
      navigate(`/interview/${interviewId}`);
    } catch (error) {
      console.error("Create candidate/interview failed:", error);
      setErrorMsg(error.message || "Something went wrong. Make sure the backend is running at http://localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans antialiased text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 flex flex-col gap-6">
        
        {/* Back Link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-450 hover:text-slate-700 self-start transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </Link>

        {/* Title */}
        <div className="text-left mt-2">
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
            New Interview
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">
            Tell us about the candidate
          </h1>
          <p className="text-slate-500 font-medium mt-1.5">
            These details help HireIQ tailor the interview questions to the role.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#F2F1EC]/40 border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100/30 mt-4 text-left">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="candidate-name" className="text-sm font-bold text-slate-750">
                  Candidate name
                </label>
                <input
                  id="candidate-name"
                  type="text"
                  required
                  placeholder="Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition font-medium"
                />
              </div>

              {/* Target Role */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="target-role" className="text-sm font-bold text-slate-750">
                  Target role
                </label>
                <input
                  id="target-role"
                  type="text"
                  required
                  placeholder="Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition font-medium"
                />
              </div>

            </div>

            {/* Experience Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="years-experience" className="text-sm font-bold text-slate-750">
                Years of experience
              </label>
              <select
                id="years-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition font-semibold text-slate-800"
              >
                <option value="0-1 years">0-1 years</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            {/* Skills Tag Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="skills-input" className="text-sm font-bold text-slate-750">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  id="skills-input"
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-xl transition duration-150 flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Skills Tags Container */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 bg-white/45 p-3 rounded-2xl border border-slate-250/20">
                  {skills.map((skill) => (
                    <span 
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-55 text-amber-900 shadow-sm border border-amber-200/40 select-none animate-fade-in"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-700 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200/50 text-red-600 text-xs font-semibold px-4 py-3.5 rounded-xl text-center leading-tight">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Initializing session...</span>
                  </div>
                ) : (
                  "Start interview"
                )}
              </button>
            </div>

          </form>

        </div>

      </main>
    </div>
  );
};

export default NewInterviewPage;
