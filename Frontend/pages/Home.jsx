import React from "react";
import CandidateForm from "../components/CandidateForm";
import interviewImage from "../src/assets/vecteezy_3d-male-character-sitting-on-a-sofa-and-working-on-a-laptop_24387852.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        
        <div className="w-1/2 bg-slate-50 flex items-center justify-center p-10">
          <img
            className="w-full max-w-md object-contain"
            src={interviewImage}
            alt="Interview"
          />
        </div>

        <CandidateForm />
      </div>
    </div>
  );
};

export default Home;