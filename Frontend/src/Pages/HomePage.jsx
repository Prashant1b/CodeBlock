// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router";
import Header from "../components/header/Header";

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4">

      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Level Up Your Coding Skills 🚀
      </h1>

      <p className="text-gray-400 max-w-2xl text-center mb-8">
        Practice coding problems, improve your logic, and prepare for
        technical interviews just like LeetCode.
      </p>

      <Link
        to="/problems"
        className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold text-black transition"
      >
        View Problems
      </Link>
    </div>
  );
}