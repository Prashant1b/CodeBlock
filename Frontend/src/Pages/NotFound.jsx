import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white px-4">
      <div className="text-center max-w-xl">

        {/* 404 Number */}
        <h1 className="text-8xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          404
        </h1>

        {/* Emoji */}
        <div className="text-5xl mt-6">🤔</div>

        {/* Heading */}
        <h2 className="text-3xl font-semibold mt-6 text-slate-200">
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p className="text-slate-400 mt-4 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          Even the best coders hit a wrong route sometimes.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-10">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg"
          >
            🏠 Go Home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all duration-200"
          >
            ← Go Back
          </button>
        </div>

      </div>
    </div>
  );
}