// src/components/header/DesktopNav.jsx
import React from "react";
import { NavLink } from "react-router";
import { ChevronDown, Flame, Trophy, ArrowRight } from "lucide-react";
import useOutsideClick from "./useOutsideClick";
import { NAV_LINKS, EXPLORE_LINKS } from "./navConfig";

const navBase = "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
const navInactive = "text-slate-200/80 hover:text-white hover:bg-white/10";
const navActive = "text-white bg-white/12";

function iconFor(name) {
  if (name === "flame") return <Flame size={18} />;
  if (name === "trophy") return <Trophy size={18} />;
  return <ArrowRight size={18} />;
}

export default function DesktopNav({ exploreOpen, setExploreOpen }) {
  const exploreRef = useOutsideClick(() => setExploreOpen(false));

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            [navBase, isActive ? navActive : navInactive].join(" ")
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
