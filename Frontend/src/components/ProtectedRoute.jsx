import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 select-none">
        {/* Premium Minimalist Pulsing Loader */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-amber-500/10 rounded-full"></div>
          <div className="absolute w-16 h-16 border-t-2 border-amber-600 rounded-full animate-spin"></div>
          <span className="absolute text-[11px] font-bold tracking-widest text-slate-800 uppercase animate-pulse">
            IQ
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-6 animate-pulse">
          Securing session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
