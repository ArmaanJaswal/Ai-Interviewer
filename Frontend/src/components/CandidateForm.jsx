import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

const CandidateForm = ({ onSuccessSubmit }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      const response = await axios.post(
        `${API_BASE_URL}/api/candidate`,
        {
          name,
          role,
          skills: skillsArray,
          experience: Number(experience),
        },
        { withCredentials: true }
      );

      setName("");
      setRole("");
      setSkills("");
      setExperience("");

      // Trigger callback if provided
      if (onSuccessSubmit) {
        onSuccessSubmit(response.data);
      }
    } catch (error) {
      console.log("Error Submitting Form", error);
      setErrorMsg("Submission failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="w-full bg-white flex flex-col gap-5 px-2 py-1"
    >
      <div className="text-center mb-1">
        <h3 className="text-3xl font-black text-slate-900 leading-tight">
          Enter Details
        </h3>
        <p className="text-sm text-slate-405 font-medium mt-1">
          Start your interview journey
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm text-left">
        Full Name
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white text-slate-800 font-medium"
          placeholder="Enter your name"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm text-left">
        Role Applying For
        <input
          type="text"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white text-slate-800 font-medium"
          placeholder="Frontend Developer"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm text-left">
        Skills (comma separated)
        <input
          type="text"
          required
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white text-slate-800 font-medium"
          placeholder="React, Node.js, MongoDB"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-slate-700 font-semibold text-sm text-left">
        Experience (Years)
        <input
          type="number"
          required
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm transition bg-white text-slate-800 font-medium"
          placeholder="Years of experience"
        />
      </label>

      {errorMsg && (
        <p className="text-red-500 text-xs font-semibold text-center -mt-1 leading-tight">
          {errorMsg}
        </p>
      )}

      <button 
        disabled={loading}
        className="bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold transition duration-150 mt-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit & Start"}
      </button>
    </form>
  );
};

export default CandidateForm;