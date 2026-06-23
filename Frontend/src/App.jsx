import React, { useState } from "react";

const App = () => {

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [skills, setSkills] = useState("")
  const [experience, setExperience] = useState("")

  const submitHandler=(e)=>{
    e.preventDefault();
    setName("");
    setRole("");
    setSkills("");
    setExperience("");
    console.log(name,role,skills,experience)
  }
  
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        
        {/* Left Side */}
        <div className="w-1/2 bg-slate-50 flex items-center justify-center p-10">
          <img
            className="w-full max-w-md object-contain"
            src="../src/assets/vecteezy_3d-male-character-sitting-on-a-sofa-and-working-on-a-laptop_24387852.png"
            alt=""
          />
        </div>

        {/* Right Side */}
        <form onSubmit={submitHandler} className="w-1/2 bg-white flex flex-col justify-center gap-6 px-16 py-12">
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
              onChange={e=> setName(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          </label>

          <label className="flex flex-col gap-2 text-slate-700 font-medium">
            Role Applying For
            <input
              type="text"
              value={role}
              onChange={e=> setRole(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Frontend Developer"
            />
          </label>

          <label className="flex flex-col gap-2 text-slate-700 font-medium">
            Skills
            <input
              type="text"
              value={skills}
              onChange={e=> setSkills(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="React, Node.js, MongoDB"
            />
          </label>

          <label className="flex flex-col gap-2 text-slate-700 font-medium">
            Experience
            <input
              type="text"
              value={experience}
              onChange={e=> setExperience(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="0-2 Years"
            />
          </label>

          <button  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition duration-300">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;