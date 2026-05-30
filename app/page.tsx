"use client";

import { useState, useCallback } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAS = [
  { id: "melb-breakfast", name: "Melbourne Breakfast", color: "#c8a97e" },
  { id: "jasmine", name: "Jasmine", color: "#d4e8a0" },
  { id: "earl-grey", name: "Earl Grey", color: "#b8c8e8" },
  { id: "peppermint", name: "Peppermint", color: "#a8dcc8" },
  { id: "sencha", name: "Sencha", color: "#8fc88f" },
  { id: "oolong", name: "Oolong", color: "#c8b490" },
  { id: "chai", name: "Chai", color: "#d4a870" },
  { id: "rooibos", name: "Rooibos", color: "#c87050" },
  { id: "hibiscus", name: "Hibiscus", color: "#d870a0" },
  { id: "chamomile", name: "Chamomile", color: "#e8d870" },
  { id: "lemon-ginger", name: "Lemon Ginger", color: "#e8e070" },
  { id: "darjeeling", name: "Darjeeling", color: "#d4b890" },
];

const AXES = ["Aroma", "Body", "Sweetness", "Bitterness", "Finish"] as const;
type Axis = (typeof AXES)[number];

interface Rating {
  teaId: string;
  axes: Record<Axis, number>;
  buyAgainPct: number;
  note: string;
}

type Screen = "home" | "rate" | "leaderboard";

// ── Sub-components ────────────────────────────────────────────────────────────

function DotRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-7 h-7 rounded-full border-2 transition-colors ${
            n <= value
              ? "bg-zinc-800 border-zinc-800"
              : "bg-white border-zinc-300"
          }`}
          aria-label={`${n} of 5`}
        />
      ))}
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────

function HomeScreen({
  ratings,
  onSelectTea,
  onViewLeaderboard,
}: {
  ratings: Map<string, Rating>;
  onSelectTea: (id: string) => void;
  onViewLeaderboard: () => void;
}) {
  const tastedCount = ratings.size;
  const progressPct = (tastedCount / 12) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Rate my tea</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {tastedCount === 0
            ? "pick whatever sounds good"
            : "keep going, or view the leaderboard"}
        </p>
      </div>

      {/* Progress bar (shown after first rating) */}
      {tastedCount > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-12">tasted</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-800 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 w-8 text-right">
              {tastedCount}/12
            </span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="grid grid-cols-3 gap-3 pb-4">
          {TEAS.map((tea) => {
            const rated = ratings.has(tea.id);
            return (
              <button
                key={tea.id}
                onClick={() => onSelectTea(tea.id)}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 p-2 transition-all active:scale-95 ${
                  rated
                    ? "opacity-40 border-zinc-200 bg-zinc-50"
                    : "border-zinc-200 bg-white shadow-sm hover:shadow-md"
                }`}
              >
                {rated && (
                  <span className="absolute top-1.5 right-1.5 text-xs text-zinc-400 leading-none">
                    ✕
                  </span>
                )}
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: tea.color }}
                />
                <span className="text-[11px] text-center leading-tight text-zinc-700 font-medium">
                  {tea.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View leaderboard CTA */}
      {tastedCount > 0 && (
        <div className="px-4 py-4 border-t border-zinc-100">
          <button
            onClick={onViewLeaderboard}
            className="w-full h-12 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            view leaderboard →
          </button>
        </div>
      )}
    </div>
  );
}

function RateScreen({
  teaId,
  existing,
  onSubmit,
  onDismiss,
}: {
  teaId: string;
  existing?: Rating;
  onSubmit: (r: Rating) => void;
  onDismiss: () => void;
}) {
  const tea = TEAS.find((t) => t.id === teaId)!;

  const [axes, setAxes] = useState<Record<Axis, number>>(
    existing?.axes ?? {
      Aroma: 0,
      Body: 0,
      Sweetness: 0,
      Bitterness: 0,
      Finish: 0,
    }
  );
  const [buyAgainPct, setBuyAgainPct] = useState(existing?.buyAgainPct ?? 50);
  const [note, setNote] = useState(existing?.note ?? "");

  const setAxis = useCallback(
    (axis: Axis, value: number) =>
      setAxes((prev) => ({ ...prev, [axis]: value })),
    []
  );

  const handleSubmit = () => {
    onSubmit({ teaId, axes, buyAgainPct, note });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button
          onClick={onDismiss}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: tea.color }}
          />
          <h1 className="text-xl font-semibold tracking-tight">{tea.name}</h1>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-4">
        {/* Axis ratings */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
            Score the basics
          </h2>
          <div className="space-y-3">
            {AXES.map((axis) => (
              <div key={axis} className="flex items-center justify-between">
                <span className="text-sm text-zinc-700 w-24">{axis}</span>
                <DotRating
                  value={axes[axis]}
                  onChange={(v) => setAxis(axis, v)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Buy-again slider */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Would you buy again?
            </h2>
            <span className="text-lg font-semibold text-zinc-800">
              {buyAgainPct}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={buyAgainPct}
            onChange={(e) => setBuyAgainPct(Number(e.target.value))}
            className="w-full accent-zinc-800"
          />
          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </section>

        {/* Tasting note */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
            Tasting note
          </h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="tasting note (optional)"
            rows={3}
            className="w-full rounded-xl border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
          />
        </section>
      </div>

      {/* Submit */}
      <div className="px-4 py-4 border-t border-zinc-100">
        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-zinc-800 text-white text-sm font-semibold tracking-widest uppercase hover:bg-zinc-700 transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function LeaderboardScreen({
  ratings,
  onEditTea,
  onClose,
}: {
  ratings: Map<string, Rating>;
  onEditTea: (id: string) => void;
  onClose: () => void;
}) {
  const ranked = [...ratings.values()].sort(
    (a, b) => b.buyAgainPct - a.buyAgainPct
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tea board</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            ranked by would-buy-again
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 text-lg"
        >
          ✕
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {ranked.length === 0 && (
          <div className="text-center text-zinc-400 text-sm pt-12">
            No teas rated yet. Head back and try one!
          </div>
        )}

        {ranked.map((r, i) => {
          const tea = TEAS.find((t) => t.id === r.teaId)!;
          return (
            <button
              key={r.teaId}
              onClick={() => onEditTea(r.teaId)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-50 active:scale-[0.98] transition-all"
            >
              <span className="text-sm font-semibold text-zinc-400 w-5 text-right">
                {i + 1}
              </span>
              <div
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{ backgroundColor: tea.color }}
              />
              <span className="flex-1 text-sm font-medium text-zinc-700 text-left">
                {tea.name}
              </span>
              <span className="text-base font-semibold text-zinc-800">
                {r.buyAgainPct}%
              </span>
            </button>
          );
        })}

        {/* Placeholder row */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-200">
          <span className="text-sm text-zinc-300 w-5 text-right">
            {ranked.length + 1}
          </span>
          <div className="w-7 h-7 rounded-full bg-zinc-100 flex-shrink-0" />
          <span className="flex-1 text-sm text-zinc-300">next tea…</span>
        </div>

        <p className="text-center text-xs text-zinc-400 pt-2">
          tap a row to edit its rating
        </p>
      </div>
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTeaId, setActiveTeaId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Map<string, Rating>>(new Map());

  // Slide-up: rate screen sits on top of home
  const rateVisible = screen === "rate";
  const leaderboardVisible = screen === "leaderboard";

  const openRate = (teaId: string) => {
    setActiveTeaId(teaId);
    setScreen("rate");
  };

  const handleSubmit = (rating: Rating) => {
    setRatings((prev) => new Map(prev).set(rating.teaId, rating));
    setScreen("home");
    setActiveTeaId(null);
  };

  const handleDismissRate = () => {
    setScreen("home");
    setActiveTeaId(null);
  };

  const handleEditFromLeaderboard = (teaId: string) => {
    setActiveTeaId(teaId);
    setScreen("rate");
  };

  return (
    // Mobile frame
    <div className="flex items-center justify-center min-h-screen bg-zinc-200 p-4">
      <div className="relative w-full max-w-sm h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-zinc-300">
        {/* Home screen — always mounted underneath */}
        <div className="absolute inset-0">
          <HomeScreen
            ratings={ratings}
            onSelectTea={openRate}
            onViewLeaderboard={() => setScreen("leaderboard")}
          />
        </div>

        {/* Rate screen — slides up */}
        <div
          className="absolute inset-0 bg-white transition-transform duration-300 ease-in-out"
          style={{
            transform: rateVisible ? "translateY(0)" : "translateY(100%)",
          }}
        >
          {activeTeaId && (
            <RateScreen
              key={activeTeaId}
              teaId={activeTeaId}
              existing={ratings.get(activeTeaId)}
              onSubmit={handleSubmit}
              onDismiss={handleDismissRate}
            />
          )}
        </div>

        {/* Leaderboard — slides up as modal sheet */}
        <div
          className="absolute inset-0 bg-white transition-transform duration-300 ease-in-out"
          style={{
            transform: leaderboardVisible ? "translateY(0)" : "translateY(100%)",
          }}
        >
          <LeaderboardScreen
            ratings={ratings}
            onEditTea={handleEditFromLeaderboard}
            onClose={() => setScreen("home")}
          />
        </div>
      </div>
    </div>
  );
}
