import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "google_failed" || errorParam === "google_auth_failed") {
        setErrorMsg("Google sign-up was cancelled or failed. Please try again.");
      } else if (errorParam === "github_failed" || errorParam === "github_auth_failed") {
        setErrorMsg("GitHub sign-up was cancelled or failed. Please try again.");
      } else {
        setErrorMsg("Registration error. Please try again.");
      }
    }
  }, [searchParams]);

  const handleGoogleSignup = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleGitHubSignup = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-amber-600/20">
            H
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            HireIQ
          </span>
        </Link>
        
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Get started with automated AI interviews in seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200/60 shadow-xl shadow-slate-100/60 rounded-3xl sm:px-10 flex flex-col gap-5">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200/80 rounded-xl p-3.5 text-xs text-red-600 font-semibold text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Value Props Checklist */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 flex flex-col gap-2 text-left mb-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1 Free Full AI Interview Session</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time voice & speech recognition</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant AI recruiter evaluation scorecard</span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-slate-800 text-sm font-bold shadow-xs transition duration-150 active:scale-98 cursor-pointer group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* GitHub Sign Up Button */}
          <button
            type="button"
            onClick={handleGitHubSignup}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition duration-150 active:scale-98 cursor-pointer group"
          >
            <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Sign up with GitHub</span>
          </button>

          {/* Subtle Security Footnote */}
          <div className="mt-4 pt-5 border-t border-slate-100/80 flex flex-col gap-2 text-center">
            <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
              Fast, secure onboarding with your Google or GitHub account.
            </p>
          </div>
        </div>


        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-amber-600 hover:text-amber-700 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
