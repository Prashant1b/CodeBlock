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

      {/* Explore dropdown */}
      <div className="relative" ref={exploreRef}>
        <button
          onClick={() => setExploreOpen((s) => !s)}
          className={[navBase, navInactive, "inline-flex items-center gap-1.5"].join(
            " "
          )}
        >
          Explore <ChevronDown size={16} className="opacity-80" />
        </button>

        {exploreOpen && (
          <div className="absolute left-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="p-2">
              {EXPLORE_LINKS.map((x) => (
                <NavLink
                  key={x.to}
                  to={x.to}
                  onClick={() => setExploreOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                      isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10",
                    ].join(" ")
                  }
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    {iconFor(x.icon)}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate">{x.title}</div>
                    {x.desc ? (
                      <div className="text-xs text-slate-300/70 truncate">{x.desc}</div>
                    ) : null}
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
