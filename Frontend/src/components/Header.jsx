import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileSpreadsheet, 
  LogOut 
} from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get initials from user's name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItemClass = (path) => {
    const active = isActive(path);
    return `flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition duration-150 cursor-pointer ${
      active
        ? "bg-amber-100/70 text-amber-800"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-amber-600/15">
            H
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            HireIQ
          </span>
        </Link>

        {/* Center: Tabs */}
        <nav className="hidden sm:flex items-center gap-3">
          <Link to="/dashboard" className={navItemClass("/dashboard")}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/new-interview" className={navItemClass("/dashboard/new-interview")}>
            <PlusCircle className="w-4 h-4" />
            <span>New interview</span>
          </Link>
          <Link to="/reports" className={navItemClass("/reports")}>
            <FileSpreadsheet className="w-4 h-4" />
            <span>Reports</span>
          </Link>
        </nav>

        {/* Right Side: Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-800 leading-tight">
              {user?.name || "Candidate"}
            </span>
            <span className="text-xs text-slate-400 capitalize font-medium">
              {user?.plan || "free"} plan
            </span>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 bg-amber-100 text-amber-800 border border-amber-200/55 rounded-full flex items-center justify-center font-bold text-xs shadow-sm select-none">
            {getInitials(user?.name)}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="sm:hidden flex items-center justify-around border-t border-slate-100 bg-white py-2 px-2">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isActive("/dashboard") ? "text-amber-700 bg-amber-50" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <Link 
          to="/dashboard/new-interview" 
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isActive("/dashboard/new-interview") ? "text-amber-700 bg-amber-50" : "text-slate-400"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>New</span>
        </Link>
        <Link 
          to="/reports" 
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            location.pathname.startsWith("/reports") ? "text-amber-700 bg-amber-50" : "text-slate-400"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
