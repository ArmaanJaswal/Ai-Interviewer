import React, { useState } from "react";
import axios from "axios";

const CandidateForm = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      const response = await axios.post(
        "http://localhost:5000/api/candidate",
        {
          name,
          role,
          skills: skillsArray,
          experience: Number(experience),
        }
      );

      console.log(response.data);

      setName("");
      setRole("");
      setSkills("");
      setExperience("");
    } catch (error) {
      console.log("Error Submitting Form", error);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="w-1/2 bg-white flex flex-col justify-center gap-6 px-16 py-12"
    >
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-slate-800">
          Enter Details
        </h1>
        <h3 className="text-lg text-slate-500 mt-2">
          Start your interview journey
        </h3>
      </div>

      <label className="flex flex-col gap-2 text-slate-700 font-medium">
        Full Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Enter your name"
        />
      </label>

      <label className="flex flex-col gap-2 text-slate-700 font-medium">
        Role Applying For
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Frontend Developer"
        />
      </label>

      <label className="flex flex-col gap-2 text-slate-700 font-medium">
        Skills
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          placeholder="React, Node.js, MongoDB"
        />
      </label>

      <label className="flex flex-col gap-2 text-slate-700 font-medium">
        Experience
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Years of experience"
        />
      </label>

      <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition duration-300">
        Submit
      </button>
    </form>
  );
};

export default CandidateForm;