// src/components/header/Header.jsx
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Brand from "./Brand";
import DesktopNav from "./DesktopNav";
import SearchBar from "./SearchBar";
import Actions from "./Actions";
import MobileMenu from "./MobileMenu";
import MobileSearchOverlay from "./MobileSearchOverlay";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setExploreOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // Close explore dropdown if mobile menu opens
  useEffect(() => {
    if (mobileOpen) setExploreOpen(false);
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Background */}
        <div className="absolute inset-0 -z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <Brand />
              <DesktopNav
                exploreOpen={exploreOpen}
                setExploreOpen={setExploreOpen}
              />
            </div>

            {/* Center */}
            <SearchBar />

            {/* Right */}
            <Actions onMobileSearch={() => setMobileSearchOpen(true)} />
          </div>

          <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </div>
      </header>

      <MobileSearchOverlay
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </>
  );
}
