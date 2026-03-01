import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProblems, getSolvedProblems } from "../api/problem.api";
import DifficultyBadge from "./DifficultyBadge";

const DIFFS = ["All", "Easy", "Medium", "Hard"];

export default function ProblemTablePro() {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // solved state
  const [solvedSet, setSolvedSet] = useState(new Set());
  const [solvedLoaded, setSolvedLoaded] = useState(false);

  // UI state
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState("All");
  const [tab, setTab] = useState("All");

  useEffect(() => {
    fetchProblems();
  }, [page]);

  useEffect(() => {
    loadSolved();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getProblems(page, 10);
      setProblems(res.data.problems || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSolved = async () => {
    try {
      const res = await getSolvedProblems();
      // backend returns array of problems: [{_id,title,difficulty,tags}, ...]
      const ids = (res.data || []).map((p) => String(p._id));
      setSolvedSet(new Set(ids));
    } catch (e) {
      // If user not logged in OR cookie missing -> will fail, that's ok
      setSolvedSet(new Set());
    } finally {
      setSolvedLoaded(true);
    }
  };

  const filtered = useMemo(() => {
    let list = [...problems];

    // Difficulty filter
    if (diff !== "All") {
      list = list.filter(
        (p) => (p.difficulty || "").toLowerCase() === diff.toLowerCase()
      );
    }

    // Search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => (p.title || "").toLowerCase().includes(q));
    }

    // Solved/Unsolved tabs
    if (tab === "Solved") {
      list = list.filter((p) => solvedSet.has(String(p._id)));
    }
    if (tab === "Unsolved") {
      list = list.filter((p) => !solvedSet.has(String(p._id)));
    }

    return list;
  }, [problems, diff, query, tab, solvedSet]);

  return (
    <div className="p-4 md:p-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Tabs */}
        <div className="flex w-full md:w-auto items-center rounded-xl border border-white/10 bg-black/20 p-1">
          {["All", "Solved", "Unsolved"].map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-4 py-2 text-sm rounded-lg transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Search + Difficulty */}
        <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full sm:w-72 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/20"
          />

          <div className="flex items-center gap-2">
            {DIFFS.map((d) => {
              const active = diff === d;
              return (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  className={[
                    "rounded-xl px-3 py-2 text-xs border transition",
                    active
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-black/20 text-slate-400 hover:text-slate-200",
                  ].join(" ")}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>
            
      {solvedLoaded && solvedSet.size === 0 && (
        <div className="mt-3 text-xs text-slate-500">
          Solved/Unsolved will work only after login.
        </div>
      )}

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-slate-400 border-b border-white/10">
          <div className="col-span-1"> </div>
          <div className="col-span-6 md:col-span-7">Title</div>
          <div className="col-span-3 md:col-span-2">Difficulty</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading problems...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">
            No problems found for current filter.
          </div>
        ) : (
          filtered.map((p) => {
            const isSolved = solvedSet.has(String(p._id));
            return (
              <div
                key={p._id}
                className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-white/5 hover:bg-white/5 transition"
              >
                {/* Solved tick */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      isSolved ? "bg-green-500" : "bg-slate-600",
                    ].join(" ")}
                    title={isSolved ? "Solved" : "Not solved"}
                  />
                </div>

                <div className="col-span-6 md:col-span-7">
                  <Link
                    to={`/problem/${p._id}`}
                    className="text-sm md:text-[15px] font-medium text-slate-100 hover:text-blue-400"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 text-xs text-slate-500">
                    #{String(p._id).slice(-6)}
                  </div>
                </div>

                <div className="col-span-3 md:col-span-2 flex items-center">
                  <DifficultyBadge level={p.difficulty} />
                </div>

                <div className="col-span-2 flex items-center justify-end">
                  <Link
                    to={`/problem/${p._id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 transition"
                  >
                    Solve →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Page <span className="text-slate-200">{page}</span> of{" "}
          <span className="text-slate-200">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-200 disabled:opacity-40 hover:bg-white/5 transition"
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-200 disabled:opacity-40 hover:bg-white/5 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}