"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAS = [
  { id: "adelaide-breakfast",   name: "Adelaide Breakfast",   image: "/images/adelaide-breakfast.png",   color: "#C0442A", t2url: "https://www.t2tea.com/search?q=adelaide+breakfast"    },
  { id: "sydney-breakfast",     name: "Sydney Breakfast",     image: "/images/sydney-breakfast.jpg",     color: "#1C3A6B", t2url: "https://www.t2tea.com/search?q=sydney+breakfast"      },
  { id: "melbourne-breakfast",  name: "Melbourne Breakfast",  image: "/images/melbourne-breakfast.jpg",  color: "#2A3A2C", t2url: "https://www.t2tea.com/search?q=melbourne+breakfast"   },
  { id: "irish-breakfast",      name: "Irish Breakfast",      image: "/images/irish-breakfast.jpg",      color: "#1E4A3A", t2url: "https://www.t2tea.com/search?q=irish+breakfast"       },
  { id: "singapore-breakfast",  name: "Singapore Breakfast",  image: "/images/singapore-breakfast.jpg",  color: "#6B3FA0", t2url: "https://www.t2tea.com/search?q=singapore+breakfast"   },
  { id: "canberra-breakfast",   name: "Canberra Breakfast",   image: "/images/canberra-breakfast.png",   color: "#E8C030", t2url: "https://www.t2tea.com/search?q=canberra+breakfast"    },
  { id: "brisbane-breakfast",   name: "Brisbane Breakfast",   image: "/images/brisbane-breakfast.jpg",   color: "#E07820", t2url: "https://www.t2tea.com/search?q=brisbane+breakfast"    },
  { id: "english-breakfast",    name: "English Breakfast",    image: "/images/english-breakfast.jpg",    color: "#C8202A", t2url: "https://www.t2tea.com/search?q=english+breakfast"     },
  { id: "scots-breakfast",      name: "Scots Breakfast",      image: "/images/scots-breakfast.png",      color: "#C85820", t2url: "https://www.t2tea.com/search?q=scots+breakfast"       },
  { id: "new-zealand-breakfast",name: "New Zealand Breakfast",image: "/images/new-zealand-breakfast.jpg",color: "#7AB028", t2url: "https://www.t2tea.com/search?q=new+zealand+breakfast" },
  { id: "new-york-breakfast",   name: "New York Breakfast",   image: "/images/new-york-breakfast.jpg",   color: "#D4A020", t2url: "https://www.t2tea.com/search?q=new+york+breakfast"    },
];

const AXES = [
  { id: "strength", label: "Strength", prompt: "How strong does it feel?",    scaleLabels: ["Light",  "Medium",   "Bold"]    },
  { id: "aroma",    label: "Aroma",    prompt: "Smell when brewed",            scaleLabels: ["Faint",  "Pleasant", "Intense"] },
  { id: "flavour",  label: "Flavour",  prompt: "Overall taste impression",     scaleLabels: ["Mild",   "Balanced", "Complex"] },
] as const;

type Axis = (typeof AXES)[number]["id"];

interface Rating {
  teaId: string;
  axes: Record<Axis, number>;
  buyAgainPct: number;
  note: string;
}

type Screen = "home" | "rate" | "leaderboard" | "complete";

// ── Sub-components ────────────────────────────────────────────────────────────

function DotRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="relative w-9 h-9 flex items-center justify-center"
          aria-label={`${n} of 5`}
        >
          <span
            className="block w-5 h-5 rounded-full transition-all duration-200"
            style={{
              background: n <= value
                ? "linear-gradient(135deg,#3b82f6,#06b6d4)"
                : "transparent",
              border: n <= value ? "none" : "2px solid #d1d5db",
              transform: n <= value ? "scale(1.1)" : "scale(1)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function Slider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const compute = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    onChange(Math.round(Math.max(0, Math.min(1, (e.clientX - left) / width)) * 100));
  };

  return (
    <div
      ref={trackRef}
      className="relative flex items-center"
      style={{ height: 48, cursor: "pointer" }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); compute(e); }}
      onPointerMove={(e) => { if (e.buttons) compute(e); }}
    >
      {/* Track background */}
      <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "#e5e7eb" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", transition: "width 0.05s" }}
        />
      </div>
      {/* Thumb */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-white"
        style={{
          width: 28, height: 28,
          left: `calc(${value}% - 14px)`,
          boxShadow: "0 2px 8px rgba(59,130,246,0.35), 0 0 0 2px #3b82f6",
          transition: "left 0.05s",
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }} />
      </div>
    </div>
  );
}

function TeaCard({ tea, rated, animating, onClick }: {
  tea: (typeof TEAS)[number]; rated: boolean; animating: boolean; onClick: () => void;
}) {
  const showRated = rated || animating;
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden"
      style={{ borderRadius: 16, aspectRatio: "1", boxShadow: "0 2px 12px rgba(0,0,0,0.10)" }}
    >
      {/* Photo */}
      <div className="absolute inset-0" style={{
        opacity: showRated ? 0 : 1,
        transform: showRated ? "scale(1.08)" : "scale(1)",
        filter: showRated ? "blur(6px)" : "blur(0px)",
        transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1), filter 0.75s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="33vw" />
      </div>

      {/* Rated overlay */}
      <div className="absolute inset-0 flex items-center justify-center" style={{
        opacity: showRated ? 1 : 0,
        transform: showRated ? "scale(1)" : "scale(0.9)",
        transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div className="absolute inset-0" style={{ backgroundColor: tea.color, opacity: 0.45 }} />
        <div className="relative flex flex-col items-center gap-0.5 px-1">
          <span className="text-[9px] font-medium text-white/80 text-center leading-tight">{tea.name}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white">rated</span>
        </div>
      </div>
    </button>
  );
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between px-6 pb-1 select-none" style={{ fontSize: 13, paddingTop: 0 }}>
      <span className="font-semibold" style={{ letterSpacing: -0.3 }}>{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="text-black">
          <rect x="0" y="8" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5"/>
          <rect x="9" y="3" width="3" height="9" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3"/>
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-black">
          <path d="M1 6.5C5.5 2 10.5 0 12 0s6.5 2 11 6.5"/>
          <path d="M4.5 10.5A10.5 10.5 0 0 1 12 8a10.5 10.5 0 0 1 7.5 2.5"/>
          <path d="M8.5 14.5A5 5 0 0 1 12 13a5 5 0 0 1 3.5 1.5"/>
          <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="relative rounded-sm overflow-hidden" style={{ width: 22, height: 11, border: "1.5px solid black" }}>
            <div className="absolute inset-0.5 rounded-sm" style={{ width: "80%", background: "black" }} />
          </div>
          <div className="rounded-sm" style={{ width: 2, height: 5, background: "black", opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────

function HomeScreen({ ratings, animatingId, onSelectTea, onViewLeaderboard }: {
  ratings: Map<string, Rating>; animatingId: string | null;
  onSelectTea: (id: string) => void; onViewLeaderboard: () => void;
}) {
  const tastedCount = ratings.size;
  const progressPct = (tastedCount / 11) * 100;

  return (
    <div className="flex flex-col h-full" style={{ background: "#F7F6F3" }}>
      <StatusBar />

      {/* Header */}
      <div className="px-5 pb-4 text-center" style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 24, color: "#aaa", fontWeight: 500, marginBottom: 4 }}>Hi Kate</p>
        <h1 className="font-bold" style={{ fontSize: 36, letterSpacing: -1, color: "#111" }}>Rate my tea</h1>
        {tastedCount === 0 ? (
          <p className="mt-2" style={{ fontSize: 14, color: "#888" }}>pick any of your samples and start rating</p>
        ) : (
          <div style={{ marginTop: 28 }}>
            <div className="flex items-center gap-3 px-1">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 15, background: "#e2e2e2" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#3b82f6,#06b6d4)" }} />
              </div>
              <span className="font-bold tabular-nums" style={{ fontSize: 18, color: "#111", minWidth: 46 }}>
                {tastedCount}/11
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4" style={{ paddingTop: 20, paddingBottom: 88 }}>
        <div className="grid grid-cols-3 gap-3">
          {TEAS.map((tea) => (
            <TeaCard key={tea.id} tea={tea} rated={ratings.has(tea.id)}
              animating={animatingId === tea.id} onClick={() => onSelectTea(tea.id)} />
          ))}
        </div>
      </div>

      {/* Leaderboard button */}
      {tastedCount > 0 && (
        <div className="absolute bottom-0 inset-x-0 px-5 pb-8 pt-3" style={{ background: "linear-gradient(to top, #F7F6F3 70%, transparent)" }}>
          <button
            onClick={onViewLeaderboard}
            className="w-full flex items-center justify-center gap-2 font-semibold text-white transition-opacity active:opacity-80"
            style={{ height: 52, borderRadius: 16, background: "linear-gradient(135deg,#1a1a1a,#3a3a3a)", fontSize: 15 }}
          >
            View leaderboard
            <span style={{ opacity: 0.6 }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

function RateScreen({ teaId, existing, onSubmit, onUnrate, onDismiss }: {
  teaId: string; existing?: Rating;
  onSubmit: (r: Rating) => void; onUnrate: (id: string) => void; onDismiss: () => void;
}) {
  const tea = TEAS.find((t) => t.id === teaId)!;
  const [axes, setAxes] = useState<Record<Axis, number>>(
    existing?.axes ?? { strength: 0, aroma: 0, flavour: 0 }
  );
  const [buyAgainPct, setBuyAgainPct] = useState(existing?.buyAgainPct ?? 50);
  const [note, setNote] = useState(existing?.note ?? "");

  const setAxis = useCallback(
    (axis: Axis, v: number) => setAxes((p) => ({ ...p, [axis]: v })), []
  );

  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-5" style={{ paddingTop: 14 }}>
        <div className="flex items-center gap-3">
          <div className="relative overflow-hidden" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}>
            <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="44px" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Rating</p>
            <h1 className="font-bold" style={{ fontSize: 18, color: "#111", letterSpacing: -0.4 }}>{tea.name}</h1>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: 18, background: "#f3f4f6", color: "#555", fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-4">

        {/* Axis ratings */}
        <div className="rounded-2xl p-4 space-y-5" style={{ background: "#F7F6F3" }}>
          <p className="font-semibold" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Score the basics</p>
          {AXES.map((axis) => (
            <div key={axis.id}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-semibold" style={{ fontSize: 15, color: "#111" }}>{axis.label}</span>
                <span style={{ fontSize: 12, color: "#aaa" }}>{axis.prompt}</span>
              </div>
              <DotRating value={axes[axis.id]} onChange={(v) => setAxis(axis.id, v)} />
              <div className="flex justify-between mt-1" style={{ fontSize: 11, color: "#bbb" }}>
                <span>{axis.scaleLabels[0]}</span>
                <span>{axis.scaleLabels[1]}</span>
                <span>{axis.scaleLabels[2]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Buy-again slider */}
        <div className="rounded-2xl p-4" style={{ background: "#F7F6F3" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Would you buy this tea?</p>
            <span className="font-bold tabular-nums" style={{ fontSize: 22, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {buyAgainPct}%
            </span>
          </div>
          <Slider value={buyAgainPct} onChange={setBuyAgainPct} />
          <div className="flex justify-between" style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
            <span>Wouldn&apos;t buy</span>
            <span>Definitely buying</span>
          </div>
        </div>

        {/* Tasting note */}
        <div className="rounded-2xl p-4" style={{ background: "#F7F6F3" }}>
          <p className="font-semibold mb-2" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Tasting note</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional — anything you noticed…"
            rows={3}
            className="w-full resize-none focus:outline-none"
            style={{ background: "transparent", fontSize: 14, color: "#333", lineHeight: 1.6 }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-8 pt-3 space-y-2" style={{ borderTop: "1px solid #f0f0f0" }}>
        <button
          onClick={() => onSubmit({ teaId, axes, buyAgainPct, note })}
          className="w-full font-semibold text-white transition-opacity active:opacity-80"
          style={{ height: 52, borderRadius: 16, background: "linear-gradient(135deg,#1a1a1a,#3a3a3a)", fontSize: 15 }}
        >
          Save rating
        </button>
        {existing && (
          <button
            onClick={() => onUnrate(teaId)}
            className="w-full transition-colors"
            style={{ height: 40, fontSize: 14, color: "#bbb" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
          >
            Remove rating
          </button>
        )}
      </div>
    </div>
  );
}

function LeaderboardScreen({ ratings, onEditTea, onClose }: {
  ratings: Map<string, Rating>; onEditTea: (id: string) => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<"top5" | "all">("all");
  const ranked = [...ratings.values()].sort((a, b) => b.buyAgainPct - a.buyAgainPct);
  const showTabs = ranked.length >= 6;
  const displayed = showTabs && tab === "top5" ? ranked.slice(0, 3) : ranked;

  return (
    <div className="flex flex-col h-full" style={{ background: "#F7F6F3" }}>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-4" style={{ paddingTop: 14 }}>
        <div>
          <h1 className="font-bold" style={{ fontSize: 26, color: "#111", letterSpacing: -0.6 }}>Tea board</h1>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 1 }}>ranked by would-buy-again</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: 18, background: "#ebebeb", color: "#555", fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="mx-5 mb-3 flex rounded-2xl p-1 gap-1" style={{ background: "#ebebeb" }}>
          {(["top5", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 font-medium transition-all"
              style={{
                height: 36, borderRadius: 14, fontSize: 14,
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#111" : "#999",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              {t === "top5" ? "My top 3" : "All"}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-2">
        {ranked.length === 0 && (
          <div className="text-center pt-16" style={{ color: "#ccc", fontSize: 14 }}>
            No teas rated yet. Head back and try one!
          </div>
        )}

        {displayed.map((r, i) => {
          const tea = TEAS.find((t) => t.id === r.teaId)!;
          return (
            <button key={r.teaId} onClick={() => onEditTea(r.teaId)}
              className="w-full flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{ background: "#fff", borderRadius: 16, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <span className="font-bold tabular-nums" style={{ fontSize: 13, color: "#ccc", width: 20, textAlign: "right" }}>{i + 1}</span>
              <div className="relative overflow-hidden flex-shrink-0" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="36px" />
              </div>
              <span className="flex-1 text-left font-medium" style={{ fontSize: 14, color: "#111" }}>{tea.name}</span>
              <span className="font-bold tabular-nums" style={{
                fontSize: 17,
                background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{r.buyAgainPct}%</span>
            </button>
          );
        })}

        {/* Placeholder */}
        <div className="flex items-center gap-3" style={{
          background: "transparent", border: "1.5px dashed #e0e0e0",
          borderRadius: 16, padding: "12px 14px",
        }}>
          <span style={{ fontSize: 13, color: "#ddd", width: 20, textAlign: "right" }}>{ranked.length + 1}</span>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0f0f0", flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: "#ccc" }}>next tea…</span>
        </div>

        <p className="text-center" style={{ fontSize: 12, color: "#ccc", paddingTop: 4 }}>tap a row to edit its rating</p>
      </div>
    </div>
  );
}

function CompletionScreen({ ratings, onDone }: {
  ratings: Map<string, Rating>;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [phaseVisible, setPhaseVisible] = useState(false);

  const ranked = [...ratings.values()].sort((a, b) => b.buyAgainPct - a.buyAgainPct);
  const top = TEAS.find((t) => t.id === ranked[0].teaId)!;
  const top3 = ranked.slice(0, 3).map((r) => TEAS.find((t) => t.id === r.teaId)!);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setPhaseVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const goToPhase2 = () => {
    setPhaseVisible(false);
    setTimeout(() => { setPhase(2); setPhaseVisible(true); }, 600);
  };

  const bgColor = phase === 1 ? top.color : "#1a1a1a";

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ background: bgColor, transition: "background 0.8s ease" }}
    >
      <StatusBar />

      {/* Phase 1 — favourite tea */}
      <div
        className="absolute inset-0 flex flex-col items-center px-8 pb-16"
        style={{
          opacity: phase === 1 && phaseVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: phase === 1 ? "auto" : "none",
          paddingTop: 64,
        }}
      >
        <p className="font-semibold text-center" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginTop: -30 }}>
          All done, Kate
        </p>
        <h2 className="font-bold text-center" style={{ color: "#fff", fontSize: 40, letterSpacing: -1, lineHeight: 1.1, marginTop: 41 }}>
          No 1
        </h2>
        <h3 className="font-semibold text-center mt-1" style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, letterSpacing: -0.3, lineHeight: 1.2 }}>
          This is your favourite tea
        </h3>

        <div className="relative mt-8" style={{ width: 180, height: 180, borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
          <Image src={top.image} alt={top.name} fill className="object-cover" sizes="180px" />
        </div>

        <p className="font-bold mt-4 text-center" style={{ color: "#fff", fontSize: 20, letterSpacing: -0.3 }}>
          {top.name}
        </p>
        <p className="mt-1" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          Likely to buy score: {ranked[0].buyAgainPct}%
        </p>

        <a
          href={top.t2url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center font-semibold"
          style={{
            height: 52, borderRadius: 16, paddingInline: 36,
            background: "rgba(255,255,255,0.18)", color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.35)", fontSize: 15,
            backdropFilter: "blur(8px)",
          }}
        >
          Buy from T2 →
        </a>

        <button
          onClick={goToPhase2}
          className="mt-4"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "underline", textUnderlineOffset: 3, marginTop: 50 }}
        >
          See your top 3 →
        </button>
      </div>

      {/* Phase 2 — top 3 */}
      <div
        className="absolute inset-0 flex flex-col px-6 pb-16"
        style={{
          opacity: phase === 2 && phaseVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: phase === 2 ? "auto" : "none",
          paddingTop: 72,
        }}
      >
        <p className="font-semibold" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>
          Kate, your top 3 favourite teas are
        </p>

        <div className="flex gap-3 mt-6">
          {top3.map((tea, i) => (
            <div key={tea.id} className="flex-1 flex flex-col items-center gap-3">
              {/* Rank badge */}
              <div className="flex items-center justify-center font-bold" style={{
                width: 26, height: 26, borderRadius: 13,
                background: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 13,
              }}>
                {i + 1}
              </div>

              {/* Photo */}
              <div className="relative w-full" style={{ aspectRatio: "1", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="33vw" />
              </div>

              {/* Name */}
              <p className="font-semibold text-center leading-tight" style={{ color: "#fff", fontSize: 11 }}>
                {tea.name}
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                {ranked[i].buyAgainPct}%
              </p>

              {/* Buy button */}
              <a
                href={tea.t2url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center font-semibold w-full"
                style={{
                  height: 38, borderRadius: 12, fontSize: 12,
                  background: "rgba(255,255,255,0.15)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                Buy →
              </a>
            </div>
          ))}
        </div>

        <button
          onClick={onDone}
          className="mt-auto w-full font-semibold"
          style={{
            height: 52, borderRadius: 16, fontSize: 15,
            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          Back to results
        </button>
      </div>

      {/* Home bar */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
        <div className="rounded-full" style={{ width: 134, height: 5, background: "rgba(255,255,255,0.25)" }} />
      </div>
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTeaId, setActiveTeaId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Map<string, Rating>>(() => {
    if (typeof window === "undefined") return new Map();
    try {
      const stored = localStorage.getItem("rmt-ratings");
      if (!stored) return new Map();
      return new Map(JSON.parse(stored) as [string, Rating][]);
    } catch { return new Map(); }
  });
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("rmt-ratings", JSON.stringify([...ratings]));
  }, [ratings]);

  const rateVisible = screen === "rate";
  const leaderboardVisible = screen === "leaderboard";

  const openRate = (teaId: string) => { setActiveTeaId(teaId); setScreen("rate"); };

  const handleUnrate = (teaId: string) => {
    setRatings((p) => { const n = new Map(p); n.delete(teaId); return n; });
    setScreen("home"); setActiveTeaId(null);
  };

  const handleSubmit = (rating: Rating) => {
    const newRatings = new Map(ratings).set(rating.teaId, rating);
    setRatings(newRatings);
    setScreen("home"); setActiveTeaId(null);
    const id = rating.teaId;
    setTimeout(() => {
      setAnimatingId(id);
      setTimeout(() => {
        setAnimatingId(null);
        if (newRatings.size === 11) {
          setTimeout(() => setScreen("complete"), 400);
        }
      }, 900);
    }, 320);
  };

  const handleDismissRate = () => { setScreen("home"); setActiveTeaId(null); };
  const handleEditFromLeaderboard = (teaId: string) => { setActiveTeaId(teaId); setScreen("rate"); };

  return (
    <div className="flex items-center justify-center min-h-screen sm:bg-[#d1d5db] bg-[#F7F6F3] sm:p-4">
      <div
        className="relative overflow-hidden w-full h-screen sm:h-[844px] sm:w-[390px] sm:rounded-[50px] sm:shadow-2xl"
        style={{ background: "#F7F6F3" }}
      >

        {/* Home */}
        <div className="absolute inset-0">
          <HomeScreen ratings={ratings} animatingId={animatingId} onSelectTea={openRate} onViewLeaderboard={() => setScreen("leaderboard")} />
        </div>

        {/* Rate — slides up */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out" style={{ transform: rateVisible ? "translateY(0)" : "translateY(100%)", background: "#fff" }}>
          {activeTeaId && (
            <RateScreen key={activeTeaId} teaId={activeTeaId} existing={ratings.get(activeTeaId)}
              onSubmit={handleSubmit} onUnrate={handleUnrate} onDismiss={handleDismissRate} />
          )}
        </div>

        {/* Leaderboard — slides up */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out" style={{ transform: leaderboardVisible ? "translateY(0)" : "translateY(100%)", background: "#F7F6F3" }}>
          <LeaderboardScreen ratings={ratings} onEditTea={handleEditFromLeaderboard} onClose={() => setScreen("home")} />
        </div>

        {/* Completion screen — fades in over everything */}
        <div
          className="absolute inset-0"
          style={{
            opacity: screen === "complete" ? 1 : 0,
            pointerEvents: screen === "complete" ? "auto" : "none",
            transition: "opacity 0.8s ease",
          }}
        >
          {screen === "complete" && (
            <CompletionScreen
              ratings={ratings}
              onDone={() => setScreen("leaderboard")}
            />
          )}
        </div>

        {/* Home indicator bar */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
          <div className="rounded-full" style={{ width: 134, height: 5, background: "rgba(0,0,0,0.2)" }} />
        </div>
      </div>
    </div>
  );
}
