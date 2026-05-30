"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAS = [
  { id: "adelaide-breakfast", name: "Adelaide Breakfast", image: "/images/adelaide-breakfast.png", color: "#C0442A" },
  { id: "sydney-breakfast", name: "Sydney Breakfast", image: "/images/sydney-breakfast.jpg", color: "#1C3A6B" },
  { id: "melbourne-breakfast", name: "Melbourne Breakfast", image: "/images/melbourne-breakfast.jpg", color: "#2A3A2C" },
  { id: "irish-breakfast", name: "Irish Breakfast", image: "/images/irish-breakfast.jpg", color: "#1E4A3A" },
  { id: "singapore-breakfast", name: "Singapore Breakfast", image: "/images/singapore-breakfast.jpg", color: "#6B3FA0" },
  { id: "canberra-breakfast", name: "Canberra Breakfast", image: "/images/canberra-breakfast.png", color: "#E8C030" },
  { id: "brisbane-breakfast", name: "Brisbane Breakfast", image: "/images/brisbane-breakfast.jpg", color: "#E07820" },
  { id: "english-breakfast", name: "English Breakfast", image: "/images/english-breakfast.jpg", color: "#C8202A" },
  { id: "scots-breakfast", name: "Scots Breakfast", image: "/images/scots-breakfast.png", color: "#C85820" },
  { id: "new-zealand-breakfast", name: "New Zealand Breakfast", image: "/images/new-zealand-breakfast.jpg", color: "#7AB028" },
  { id: "new-york-breakfast", name: "New York Breakfast", image: "/images/new-york-breakfast.jpg", color: "#D4A020" },
];

const AXES = [
  {
    id: "strength",
    label: "Strength",
    prompt: "How strong does it feel?",
    scaleLabels: ["Light", "Medium", "Strong"],
  },
  {
    id: "aroma",
    label: "Aroma",
    prompt: "Smell when brewed",
    scaleLabels: ["Weak", "Pleasant", "Rich / strong"],
  },
  {
    id: "smoothness",
    label: "Smoothness",
    prompt: "How easy is it to drink?",
    scaleLabels: ["Harsh", "OK", "Very smooth"],
  },
  {
    id: "bitterness",
    label: "Bitterness",
    prompt: "Bitterness level",
    scaleLabels: ["Low", "Medium", "High"],
  },
] as const;

type Axis = (typeof AXES)[number]["id"];

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

function TeaCard({
  tea,
  rated,
  animating,
  onClick,
}: {
  tea: (typeof TEAS)[number];
  rated: boolean;
  animating: boolean;
  onClick: () => void;
}) {
  const showRated = rated || animating;

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-xl border overflow-hidden border-zinc-200 shadow-sm hover:shadow-md active:scale-95 transition-shadow"
    >
      {/* Photo layer */}
      <div
        className="absolute inset-0"
        style={{
          opacity: showRated ? 0 : 1,
          transform: showRated ? "scale(1.08)" : "scale(1)",
          filter: showRated ? "blur(4px)" : "blur(0px)",
          transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1), filter 0.75s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="33vw" />
      </div>

      {/* Rated colour layer */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: showRated ? 1 : 0,
          transform: showRated ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: tea.color, opacity: 0.5 }} />
        <div className="relative flex flex-col items-center gap-1">
          <span className="text-[9px] font-medium text-white text-center leading-tight px-1 drop-shadow">
            {tea.name}
          </span>
          <span className="text-xs font-semibold tracking-widest uppercase text-white drop-shadow">
            rated
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────

function HomeScreen({
  ratings,
  animatingId,
  onSelectTea,
  onViewLeaderboard,
}: {
  ratings: Map<string, Rating>;
  animatingId: string | null;
  onSelectTea: (id: string) => void;
  onViewLeaderboard: () => void;
}) {
  const tastedCount = ratings.size;
  const progressPct = (tastedCount / 11) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pb-4 text-center" style={{ paddingTop: "58px" }}>
        <h1 className="text-4xl font-bold tracking-tight">Rate my tea</h1>
        {tastedCount === 0 ? (
          <p className="text-sm text-zinc-400 mt-1">pick any of your samples and start rating</p>
        ) : (
          <div className="space-y-2" style={{ marginTop: "28px" }}>
            {/* Progress row */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 rounded-full bg-zinc-100 overflow-hidden" style={{ height: "15px" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                  }}
                />
              </div>
              <span className="text-lg font-bold tabular-nums text-zinc-800 leading-none">
                {tastedCount}/11
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid — pushed down 50px via top padding */}
      <div className="flex-1 overflow-y-auto px-4 pt-[50px] pb-[72px]">
        <div className="grid grid-cols-3 gap-3 pb-4">
          {TEAS.map((tea) => (
              <TeaCard
                key={tea.id}
                tea={tea}
                rated={ratings.has(tea.id)}
                animating={animatingId === tea.id}
                onClick={() => onSelectTea(tea.id)}
              />
            ))}
        </div>
      </div>

      {/* View leaderboard button */}
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
  onUnrate,
  onDismiss,
}: {
  teaId: string;
  existing?: Rating;
  onSubmit: (r: Rating) => void;
  onUnrate: (teaId: string) => void;
  onDismiss: () => void;
}) {
  const tea = TEAS.find((t) => t.id === teaId)!;

  const [axes, setAxes] = useState<Record<Axis, number>>(
    existing?.axes ?? {
      strength: 0,
      aroma: 0,
      smoothness: 0,
      bitterness: 0,
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
      <div className="flex items-center justify-between px-4 pt-12 pb-6">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="32px" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{tea.name}</h1>
        </div>
        <button
          onClick={onDismiss}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-4">
        {/* Axis ratings */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
            Score the basics
          </h2>
          <div className="space-y-5">
            {AXES.map((axis) => (
              <div key={axis.id}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-semibold text-zinc-800">{axis.label}</span>
                  <span className="text-xs text-zinc-400">{axis.prompt}</span>
                </div>
                <DotRating
                  value={axes[axis.id]}
                  onChange={(v) => setAxis(axis.id, v)}
                />
                <div className="flex justify-between mt-1.5">
                  {axis.scaleLabels.map((l, i) => (
                    <span
                      key={i}
                      className={`text-[10px] ${
                        i === 0
                          ? "text-left"
                          : i === axis.scaleLabels.length - 1
                          ? "text-right"
                          : "text-center flex-1"
                      } text-zinc-400 ${i === 0 || i === axis.scaleLabels.length - 1 ? "w-16" : ""}`}
                    >
                      {l}
                    </span>
                  ))}
                </div>
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
      <div className="px-4 py-4 border-t border-zinc-100 space-y-2">
        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-zinc-800 text-white text-sm font-semibold tracking-widest uppercase hover:bg-zinc-700 transition-colors"
        >
          Submit
        </button>
        {existing && (
          <button
            onClick={() => onUnrate(teaId)}
            className="w-full h-10 text-sm text-zinc-400 hover:text-red-500 transition-colors"
          >
            Remove rating
          </button>
        )}
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
  const [tab, setTab] = useState<"top5" | "all">("all");

  const ranked = [...ratings.values()].sort(
    (a, b) => b.buyAgainPct - a.buyAgainPct
  );

  const showTabs = ranked.length >= 6;
  const displayed = showTabs && tab === "top5" ? ranked.slice(0, 3) : ranked;

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

      {/* Tabs — only shown at 6+ ratings */}
      {showTabs && (
        <div className="flex mx-4 mb-2 rounded-xl bg-zinc-100 p-1 gap-1">
          {(["top5", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-8 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white text-zinc-800 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t === "top5" ? "My top 3" : "All"}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {ranked.length === 0 && (
          <div className="text-center text-zinc-400 text-sm pt-12">
            No teas rated yet. Head back and try one!
          </div>
        )}

        {displayed.map((r, i) => {
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
              <div className="relative w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
                <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="28px" />
              </div>
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
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // Slide-up: rate screen sits on top of home
  const rateVisible = screen === "rate";
  const leaderboardVisible = screen === "leaderboard";

  const openRate = (teaId: string) => {
    setActiveTeaId(teaId);
    setScreen("rate");
  };

  const handleUnrate = (teaId: string) => {
    setRatings((prev) => {
      const next = new Map(prev);
      next.delete(teaId);
      return next;
    });
    setScreen("home");
    setActiveTeaId(null);
  };

  const handleSubmit = (rating: Rating) => {
    setRatings((prev) => new Map(prev).set(rating.teaId, rating));
    setScreen("home");
    setActiveTeaId(null);
    // Wait for slide-down to finish, then run the ripple (550ms total)
    const id = rating.teaId;
    setTimeout(() => {
      setAnimatingId(id);
      setTimeout(() => setAnimatingId(null), 550);
    }, 320);
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
            animatingId={animatingId}
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
              onUnrate={handleUnrate}
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
