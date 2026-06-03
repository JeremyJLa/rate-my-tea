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
  { id: "canberra-breakfast",   name: "Canberra Breakfast",   image: "/images/canberra-breakfast.png",   color: "#2563B0", t2url: "https://www.t2tea.com/search?q=canberra+breakfast"    },
  { id: "brisbane-breakfast",   name: "Brisbane Breakfast",   image: "/images/brisbane-breakfast.jpg",   color: "#E07820", t2url: "https://www.t2tea.com/search?q=brisbane+breakfast"    },
  { id: "english-breakfast",    name: "English Breakfast",    image: "/images/english-breakfast.jpg",    color: "#C8202A", t2url: "https://www.t2tea.com/search?q=english+breakfast"     },
  { id: "scots-breakfast",      name: "Scots Breakfast",      image: "/images/scots-breakfast.png",      color: "#1A4F8A", t2url: "https://www.t2tea.com/search?q=scots+breakfast"       },
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
                ? "#16a34a"
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
          style={{ width: `${value}%`, background: "linear-gradient(90deg,#4ade80,#16a34a)", transition: "width 0.05s" }}
        />
      </div>
      {/* Thumb */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-white"
        style={{
          width: 28, height: 28,
          left: `calc(${value}% - 14px)`,
          boxShadow: "0 2px 8px rgba(22,163,74,0.35), 0 0 0 2px #16a34a",
          transition: "left 0.05s",
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#4ade80,#16a34a)" }} />
      </div>
    </div>
  );
}

function lightenHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * 0.85)},${Math.round(g + (255 - g) * 0.85)},${Math.round(b + (255 - b) * 0.85)})`;
}

function TeaCard({ tea, rated, animating, onClick }: {
  tea: (typeof TEAS)[number]; rated: boolean; animating: boolean; onClick: () => void;
}) {
  const showRated = rated || animating;
  const city = tea.name.replace(/\s+\S+$/, "");

  const hash = tea.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotate = ((hash * 37) % 80) - 40;
  const rad = (Math.abs(rotate) * Math.PI) / 180;
  const minScale = Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)) + 0.15;
  const foilScale = minScale + (hash % 5) * 0.08;
  const tx = ((hash * 13) % 20) - 10;
  const ty = ((hash * 17) % 20) - 10;

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>

      {/* Circle — fades out when rated */}
      <button
        onClick={onClick}
        style={{
          position: "absolute", inset: 0,
          borderRadius: "50%", overflow: "hidden", padding: 0,
          border: "3px solid #fff",
          boxShadow: `0 0 0 3px ${tea.color}, 0 4px 12px rgba(0,0,0,0.13)`,
          opacity: showRated ? 0 : 1,
          transition: "opacity 0.6s ease",
          pointerEvents: showRated ? "none" : "auto",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundColor: tea.color }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/foil-texture.png" alt="" aria-hidden style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          filter: "grayscale(1) contrast(2.2) brightness(0.8)", opacity: 0.65, mixBlendMode: "overlay",
          transform: `rotate(${rotate}deg) scale(${foilScale}) translate(${tx}px,${ty}px)`,
          transformOrigin: "center center", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 3, paddingInline: 8,
        }}>
          <span style={{ fontWeight: 700, color: "#fff", fontSize: 15, letterSpacing: -0.3, textShadow: "0 1px 8px rgba(0,0,0,0.55)", textAlign: "center", lineHeight: 1.1 }}>{city}</span>
          <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.4)", textAlign: "center" }}>Breakfast</span>
        </div>
      </button>

      {/* Tea tag — fades in when rated */}
      <button
        onClick={onClick}
        style={{
          position: "absolute", inset: 0, padding: 0, background: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: showRated ? 1 : 0,
          transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: showRated ? "auto" : "none",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Teatag shape via CSS mask, filled with lightened tea colour */}
          <div style={{
            position: "absolute", width: "100%", height: "100%",
            backgroundColor: lightenHex(tea.color),
            WebkitMaskImage: "url(/images/teatag.png)",
            maskImage: "url(/images/teatag.png)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          } as React.CSSProperties} />
          {/* Content */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, pointerEvents: "none" }}>
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path d="M2 8L7.5 14L18 2" stroke="#111" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.5, color: "#111", textTransform: "uppercase" }}>Rated</span>
            <span style={{ fontSize: 10, fontWeight: 400, color: "#333", textAlign: "center", lineHeight: 1.4, marginTop: 1 }}>{city}<br/>Breakfast</span>
          </div>
        </div>
      </button>

    </div>
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

function HomeScreen({ ratings, animatingId, onSelectTea, onViewLeaderboard, splashDone }: {
  ratings: Map<string, Rating>; animatingId: string | null;
  onSelectTea: (id: string) => void; onViewLeaderboard: () => void;
  splashDone: boolean;
}) {
  const tastedCount = ratings.size;
  const progressPct = (tastedCount / 11) * 100;
  const [cardsIn, setCardsIn] = useState(false);
  useEffect(() => {
    if (!splashDone) return;
    const t = setTimeout(() => setCardsIn(true), 80);
    return () => clearTimeout(t);
  }, [splashDone]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#F7F6F3" }}>
      <StatusBar />

      {/* Header */}
      <div className="px-5 pb-4 text-center" style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 24, color: "#aaa", fontWeight: 500, marginBottom: 0 }}>Hi Kate</p>
        <h1 className="font-bold" style={{ fontSize: 36, letterSpacing: -1, color: "#111" }}>Rate Your Tea</h1>
        {tastedCount === 0 ? (
          <p style={{ fontSize: 14, color: "#888" }}>pick any of your samples and start rating</p>
        ) : (
          <div style={{ marginTop: 28 }}>
            <div className="flex items-center gap-3 px-1">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 15, background: "#e2e2e2" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#4ade80,#16a34a)" }} />
              </div>
              <span className="font-bold tabular-nums" style={{ fontSize: 18, color: "#111", minWidth: 46 }}>
                {tastedCount}/11
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="grid grid-cols-3" style={{ columnGap: 12, rowGap: 14 }}>
          {TEAS.map((tea, i) => (
            <div key={tea.id} style={{
              opacity: cardsIn ? 1 : 0,
              transform: cardsIn ? "translateY(0)" : "translateY(-24px)",
              transition: `opacity 0.4s ease ${i * 55}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 55}ms`,
            }}>
              <TeaCard tea={tea} rated={ratings.has(tea.id)}
                animating={animatingId === tea.id} onClick={() => onSelectTea(tea.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard button */}
      {tastedCount > 0 && (
        <div className="absolute bottom-0 inset-x-0 flex justify-center pb-8 pt-6 pointer-events-none">
          <button
            onClick={onViewLeaderboard}
            className="flex items-center justify-center gap-2 font-semibold text-white transition-opacity active:opacity-80 pointer-events-auto"
            style={{
              height: 52, paddingInline: 32, borderRadius: 9999,
              background: "rgba(26,26,26,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              fontSize: 15,
            }}
          >
            View leaderboard
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}><path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

function RateScreen({ teaId, existing, fromLeaderboard, onSubmit, onUnrate, onDismiss }: {
  teaId: string; existing?: Rating; fromLeaderboard?: boolean;
  onSubmit: (r: Rating) => void; onUnrate: (id: string) => void; onDismiss: () => void;
}) {
  const tea = TEAS.find((t) => t.id === teaId)!;
  const [axes, setAxes] = useState<Record<Axis, number>>(
    existing?.axes ?? { strength: 0, aroma: 0, flavour: 0 }
  );
  const [buyAgainPct, setBuyAgainPct] = useState(existing?.buyAgainPct ?? 50);
  const [note, setNote] = useState(existing?.note ?? "");

  const [shareOpen, setShareOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const COLLAPSE = 70; // px of scroll to fully collapse
  const p = Math.min(scrollY / COLLAPSE, 1); // 0 = expanded, 1 = collapsed

  // Interpolated header values
  const imgSize    = Math.round(64 - p * 34);          // 64 → 30
  const titleSize  = Math.round(30 - p * 14);          // 30 → 16
  const collapsedSize = titleSize;                      // breakfast matches city when collapsed
  const subSize    = p < 0.5 ? Math.round(19 - p * 6) : collapsedSize;
  const headerPb   = Math.round(20 - p * 8);           // padding-bottom 20 → 12
  const inline     = p > 0.55;                         // switch to same-line layout

  const setAxis = useCallback(
    (axis: Axis, v: number) => setAxes((p) => ({ ...p, [axis]: v })), []
  );

  const sharePayload = () => btoa(JSON.stringify({ teaId, axes, buyAgainPct, note }));
  const shareUrl = () => `${window.location.origin}/?share=${sharePayload()}`;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>

      {/* ── Fixed header ───────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: "#fff", zIndex: 20 }}>
        <StatusBar />
        <div className={`flex items-center px-5 ${fromLeaderboard ? "" : "justify-between"}`} style={{ paddingTop: 14, paddingBottom: headerPb, transition: "padding-bottom 0.1s", gap: fromLeaderboard ? 20 : 0 }}>
          {/* Back chevron (leaderboard) or tea info (home) on left */}
          {fromLeaderboard ? (
            <button onClick={onDismiss} className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, color: "#111", flexShrink: 0 }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          ) : null}

          {/* Tea image + name — always shown */}
          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden" style={{ width: imgSize, height: imgSize, borderRadius: 14 - p * 4, flexShrink: 0, transition: "width 0.1s, height 0.1s, border-radius 0.1s" }}>
              <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="64px" style={{ transform: "scale(1.35)", transformOrigin: "center center" }} />
            </div>
            <h1 className="font-bold" style={{ color: "#111", letterSpacing: -0.4, display: "flex", flexDirection: inline ? "row" : "column", alignItems: inline ? "baseline" : "flex-start", gap: inline ? 5 : 0 }}>
              <span style={{ fontSize: titleSize, lineHeight: 1.15, transition: "font-size 0.1s" }}>{tea.name.replace(/\s+\S+$/, "")}</span>
              <span style={{ fontSize: subSize, fontWeight: 500, color: inline ? "#111" : "#888", lineHeight: 1.15, transition: "font-size 0.1s, color 0.15s" }}>{tea.name.split(" ").pop()}</span>
            </h1>
          </div>

          {/* Share + X (home only) */}
          {!fromLeaderboard && (
            <div className="flex items-center" style={{ gap: 10 }}>
              {existing && (
                <button onClick={() => setShareOpen(true)} className="flex items-center justify-center active:opacity-60 transition-opacity" style={{ width: 35, height: 35, borderRadius: 8, background: "#f3f4f6", color: "#555", lineHeight: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </button>
              )}
              <button onClick={onDismiss} className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, color: "#111" }}>
                <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div
        onScroll={(e) => setScrollY((e.currentTarget as HTMLDivElement).scrollTop)}
        style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="px-5 space-y-6 py-4">
          <div className="rounded-2xl p-4 space-y-5" style={{ background: "#F7F6F3" }}>
            <p className="font-semibold" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Score the basics</p>
            {AXES.map((axis) => (
              <div key={axis.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-semibold" style={{ fontSize: 15, color: "#111" }}>{axis.label}</span>
                  <span style={{ fontSize: 12, color: "#aaa" }}>{axis.prompt}</span>
                </div>
                <DotRating value={axes[axis.id]} onChange={(v) => setAxis(axis.id, v)} />
                <div className="flex gap-2.5 mt-1" style={{ fontSize: 15, color: "#888" }}>
                  <span className="w-9 shrink-0 text-center">{axis.scaleLabels[0]}</span>
                  <span className="w-9 shrink-0" />
                  <span className="w-9 shrink-0 text-center" style={{ marginLeft: -5 }}>{axis.scaleLabels[1]}</span>
                  <span className="w-9 shrink-0" />
                  <span className="w-9 shrink-0 text-center">{axis.scaleLabels[2]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#F7F6F3" }}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Would you buy this tea?</p>
              <span className="font-bold tabular-nums" style={{ fontSize: 22, color: "#16a34a" }}>
                {buyAgainPct}%
              </span>
            </div>
            <Slider value={buyAgainPct} onChange={setBuyAgainPct} />
            <div className="flex justify-between" style={{ fontSize: 11, color: "#ffffff", marginTop: 2 }}>
              <span>Wouldn&apos;t buy</span>
              <span>Definitely buying</span>
            </div>
          </div>

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
      </div>

      {/* ── Fixed footer ───────────────────────────────────────────────── */}
      <div className="pt-3 pb-8 px-5" style={{ flexShrink: 0, background: "#fff", borderTop: "1px solid #f0f0f0", zIndex: 20 }}>
        {existing ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSubmit({ teaId, axes, buyAgainPct, note })}
              className="font-semibold text-white transition-opacity active:opacity-80 shrink-0"
              style={{ height: 52, width: 220, borderRadius: 16, background: "linear-gradient(135deg,#1a1a1a,#3a3a3a)", fontSize: 15 }}
            >
              Save rating
            </button>
            <button
              onClick={() => onUnrate(teaId)}
              className="transition-colors flex-1 text-center"
              style={{ fontSize: 14, color: "#bbb", background: "none", border: "none", padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
            >
              Remove rating
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => onSubmit({ teaId, axes, buyAgainPct, note })}
              className="flex items-center justify-center font-semibold text-white transition-opacity active:opacity-80"
              style={{ height: 52, paddingInline: 56, borderRadius: 9999, background: "linear-gradient(135deg,#1a1a1a,#3a3a3a)", fontSize: 15 }}
            >
              Save rating
            </button>
          </div>
        )}
      </div>

      {/* ── Share drawer — absolute siblings, anchored to outer container ─ */}

      {/* ── Share drawer — outside scroll, anchors to screen ───────────── */}
      <div
        onClick={() => setShareOpen(false)}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.4)", opacity: shareOpen ? 1 : 0, pointerEvents: shareOpen ? "auto" : "none", transition: "opacity 0.25s ease", zIndex: 40 }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "12px 20px 40px", zIndex: 50, transform: shareOpen ? "translateY(0)" : "translateY(100%)", transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="flex justify-center mb-5">
          <div className="rounded-full" style={{ width: 36, height: 4, background: "#e0e0e0" }} />
        </div>
        <p className="font-semibold mb-1" style={{ fontSize: 16, color: "#111" }}>Share Kate&apos;s rating</p>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>{tea.name} · {buyAgainPct}% likely to buy</p>
        <button
          onClick={() => {
            const url = shareUrl();
            if (navigator.share) {
              navigator.share({ title: `Kate rated ${tea.name}`, text: `Kate tried ${tea.name} and gave it a ${buyAgainPct}% likely-to-buy score. See her full rating:`, url });
            }
            setShareOpen(false);
          }}
          className="w-full flex items-center gap-4 active:opacity-70 transition-opacity"
          style={{ height: 56, borderRadius: 16, background: "#f3f4f6", paddingLeft: 18, paddingRight: 18, marginBottom: 10 }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
          <div className="text-left">
            <p className="font-medium" style={{ fontSize: 15, color: "#111" }}>Send via Messages</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>Share with a friend</p>
          </div>
          <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(shareUrl()).then(() => setShareOpen(false)); }}
          className="w-full flex items-center gap-4 active:opacity-70 transition-opacity"
          style={{ height: 56, borderRadius: 16, background: "#f3f4f6", paddingLeft: 18, paddingRight: 18 }}
        >
          <span style={{ fontSize: 22 }}>🔗</span>
          <div className="text-left">
            <p className="font-medium" style={{ fontSize: 15, color: "#111" }}>Copy link</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>Paste anywhere</p>
          </div>
          <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
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
        <div className="flex-1 text-center">
          <h1 className="font-bold" style={{ fontSize: 26, color: "#111", letterSpacing: -0.6 }}>Leaderboard</h1>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 1 }}>ranked by would-buy-again</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 20, color: "#111" }}
        >
          <svg width="30" height="30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
          </svg>
        </button>
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="flex justify-center mx-5 mb-4 gap-2" style={{ marginTop: 10 }}>
          {(["top5", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="font-semibold transition-all duration-200"
              style={{
                width: 120, height: 34, borderRadius: 999,
                fontSize: 13,
                background: tab === t ? "#111" : "transparent",
                color: tab === t ? "#fff" : "#999",
                border: tab === t ? "none" : "1.5px solid #e0e0e0",
                letterSpacing: 0.1,
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

        <p className="text-center" style={{ fontSize: 12, color: "#000000", paddingTop: 4 }}>tap a row to edit its rating</p>
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
          <Image src={top.image} alt={top.name} fill className="object-cover" sizes="180px" style={{ transform: "scale(1.35)", transformOrigin: "center center" }} />
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
          style={{ fontSize: 17, color: "#ffffff", textDecoration: "none", marginTop: 50, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          See your top 3 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3.5L10.5 8L6 12.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        <p className="font-semibold" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: 0.3 }}>
          Kate, your top 3 favourite teas are
        </p>

        <div className="flex gap-3 mt-6">
          {top3.map((tea, i) => (
            <div key={tea.id} className="flex-1 flex flex-col items-center">
              {/* Rank badge */}
              <div className="flex items-center justify-center font-bold" style={{
                width: 26, height: 26, borderRadius: 13,
                background: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 13,
              }}>
                {i + 1}
              </div>

              {/* Photo */}
              <div className="relative w-full mt-3" style={{ aspectRatio: "1", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="33vw" style={{ transform: "scale(1.35)", transformOrigin: "center center" }} />
              </div>

              {/* Name + score */}
              <p className="font-semibold text-center leading-tight mt-3" style={{ color: "#fff", fontSize: 11 }}>
                {tea.name}
              </p>
              <p className="mt-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                {ranked[i].buyAgainPct}%
              </p>

              {/* Buy button — pushed to bottom so all three align */}
              <a
                href={tea.t2url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center font-semibold w-full mt-auto"
                style={{
                  height: 38, borderRadius: 12, fontSize: 12, marginTop: 12,
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

// ── Shared rating view ────────────────────────────────────────────────────────

function SharedRatingView({ rating, onClose }: { rating: Rating; onClose: () => void }) {
  const tea = TEAS.find((t) => t.id === rating.teaId);
  if (!tea) return null;
  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>
      <StatusBar />
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-5 shrink-0" style={{ paddingTop: 14, background: "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="relative overflow-hidden" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}>
            <Image src={tea.image} alt={tea.name} fill className="object-cover" sizes="44px" style={{ transform: "scale(1.35)", transformOrigin: "center center" }} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Kate rated this</p>
            <h1 className="font-bold" style={{ fontSize: 22, color: "#111", letterSpacing: -0.4 }}>{tea.name}</h1>
          </div>
        </div>
        <button onClick={onClose} className="flex items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: 18, background: "#f3f4f6", color: "#555", fontSize: 16 }}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-8">
        {/* Axes */}
        <div className="rounded-2xl p-4 space-y-5" style={{ background: "#F7F6F3" }}>
          <p className="font-semibold" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Score the basics</p>
          {AXES.map((axis) => (
            <div key={axis.id}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-semibold" style={{ fontSize: 15, color: "#111" }}>{axis.label}</span>
              </div>
              {/* Read-only dots */}
              <div className="flex gap-2.5">
                {[1,2,3,4,5].map((n) => (
                  <div key={n} className="w-9 h-9 flex items-center justify-center">
                    <span className="block w-5 h-5 rounded-full" style={{
                      background: n <= rating.axes[axis.id] ? "linear-gradient(135deg,#4ade80,#16a34a)" : "transparent",
                      border: n <= rating.axes[axis.id] ? "none" : "2px solid #d1d5db",
                      transform: n <= rating.axes[axis.id] ? "scale(1.1)" : "scale(1)",
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 mt-1" style={{ fontSize: 15, color: "#888" }}>
                <span className="w-9 shrink-0 text-center">{axis.scaleLabels[0]}</span>
                <span className="w-9 shrink-0" />
                <span className="w-9 shrink-0 text-center" style={{ marginLeft: -5 }}>{axis.scaleLabels[1]}</span>
                <span className="w-9 shrink-0" />
                <span className="w-9 shrink-0 text-center">{axis.scaleLabels[2]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Buy-again */}
        <div className="rounded-2xl p-4" style={{ background: "#F7F6F3" }}>
          <div className="flex items-center justify-between">
            <p className="font-semibold" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Would you buy this tea?</p>
            <span className="font-bold tabular-nums" style={{ fontSize: 22, background: "linear-gradient(135deg,#4ade80,#16a34a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {rating.buyAgainPct}%
            </span>
          </div>
          {/* Read-only track */}
          <div className="w-full rounded-full overflow-hidden mt-3" style={{ height: 8, background: "#e5e7eb" }}>
            <div className="h-full rounded-full" style={{ width: `${rating.buyAgainPct}%`, background: "linear-gradient(90deg,#4ade80,#16a34a)" }} />
          </div>
          <div className="flex justify-between mt-1" style={{ fontSize: 11, color: "#bbb" }}>
            <span>Wouldn&apos;t buy</span><span>Definitely buying</span>
          </div>
        </div>

        {/* Note */}
        {rating.note ? (
          <div className="rounded-2xl p-4" style={{ background: "#F7F6F3" }}>
            <p className="font-semibold mb-2" style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>Tasting note</p>
            <p style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{rating.note}</p>
          </div>
        ) : null}

        {/* CTA */}
        <a href={tea.t2url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center font-semibold text-white w-full"
          style={{ height: 52, borderRadius: 16, background: "linear-gradient(135deg,#1a1a1a,#3a3a3a)", fontSize: 15, textDecoration: "none" }}>
          Buy {tea.name} from T2 →
        </a>
      </div>
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────

// ── Splash Screen ─────────────────────────────────────────────────────────────

const TEA_GREEN = "#3dba6e";
const LOGO_WHITE_FILTER = "drop-shadow(0 2px 8px rgba(0,0,0,0.5))";

function SplashScreen({ onDismiss }: { onDismiss: () => void }) {
  const [hiKate,      setHiKate]      = useState(false);
  const [hiKateOut,   setHiKateOut]   = useState(false);
  const [cupVisible,  setCupVisible]  = useState(false);
  const [greenFlood,  setGreenFlood]  = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [logoOut,     setLogoOut]     = useState(false);
  const [irisGrow,    setIrisGrow]    = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setHiKate(true),       150),
      setTimeout(() => setHiKateOut(true),   1600),
      setTimeout(() => setCupVisible(true),  1900),  // cup spins in
      setTimeout(() => setGreenFlood(true),  3600),  // green flood after cup fully visible
      setTimeout(() => setLogoVisible(true), 4000),  // white logo scales in over green
      setTimeout(() => setLogoOut(true),     4900),  // logo scales to 0 once green is full
      setTimeout(() => setIrisGrow(true),    5400),  // white iris wipe
      setTimeout(() => onDismiss(),          7200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDismiss]);

  const logoTransform   = logoOut ? "scale(0)" : logoVisible ? "scale(1)" : "scale(0.3)";
  const logoOpacity     = logoVisible ? 1 : 0;
  const logoTransition  = logoOut
    ? "transform 0.5s cubic-bezier(0.55,0,1,0.45)"
    : "transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease-out";

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      backgroundColor: "#fff",
      overflow: "hidden",
    }}>

      {/* Hi Kate — fades in then out on white background */}
      <p style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: 0, fontSize: 28, fontWeight: 400,
        color: "#aaa", letterSpacing: 0.2,
        opacity: hiKate && !hiKateOut ? 1 : 0,
        transition: hiKateOut ? "opacity 0.5s ease-in" : "opacity 0.6s ease-out",
        zIndex: 1,
        pointerEvents: "none",
      }}>Hi Kate</p>

      {/* Layer 1 — Cup photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/teahcup4.png"
        alt=""
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          opacity: cupVisible ? 1 : 0,
          transform: cupVisible ? "scale(1.30) rotate(0deg)" : "scale(2.2) rotate(180deg)",
          transition: cupVisible ? "opacity 1.0s ease-out, transform 1.6s cubic-bezier(0.22,1,0.36,1)" : "none",
          willChange: "opacity, transform",
        }}
      />

      {/* Layer 2 — Green flood circle (expands to cover cup) */}
      <div style={{
        position: "absolute",
        width: 80, height: 80,
        borderRadius: "50%",
        top: "calc(43% - 40px)",
        left: "calc(50% - 40px)",
        background: TEA_GREEN,
        mixBlendMode: "hard-light",
        transform: greenFlood ? "scale(30)" : "scale(0)",
        transition: greenFlood ? "transform 0.8s cubic-bezier(0.4,0,0.6,1)" : "none",
        willChange: "transform",
        zIndex: 2,
      }} />

      {/* Layer 3 — Logo: scales in over green, then shrinks to 0 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/splash-text.svg"
        alt="Rate your Tea"
        style={{
          position: "absolute",
          top: "42%", left: "50%",
          transform: `translate(-50%, -50%) ${logoTransform}`,
          width: "62%", maxWidth: 240,
          opacity: logoOpacity,
          filter: LOGO_WHITE_FILTER,
          transition: logoTransition,
          willChange: "transform, opacity",
          transformOrigin: "center center",
          zIndex: 6,
        }}
      />

      {/* Layer 4 — White iris (grows over green to reveal home) */}
      <div style={{
        position: "absolute",
        width: 80, height: 80,
        borderRadius: "50%",
        top: "calc(43% - 40px)",
        left: "calc(50% - 40px)",
        background: "#fff",
        transform: irisGrow ? "scale(30)" : "scale(0)",
        transition: irisGrow ? "transform 2s cubic-bezier(0.25,0.1,0.25,1)" : "none",
        willChange: "transform",
        zIndex: 5,  // logo slices are z:6, above iris
      }} />

    </div>
  );
}

// ── Splash Screen B — dot expand → cup cycle with teabag dip ─────────────────

const CUP_SEQUENCE = [
  { cup: "/images/new-cup-purple.png", color: "#A45EA2" },
  { cup: "/images/new-cup-green.png",  color: "#4caf50" },
  { cup: "/images/new-cup-yellow.png", color: "#c8b400" },
  { cup: "/images/new-cup-brown.png",  color: "#5c2d0a" },
];

function SplashScreenB({ onDismiss }: { onDismiss: () => void }) {
  const [dotGrow,    setDotGrow]    = useState(false);
  const [dotOut,     setDotOut]     = useState(false);
  const [cupIdx,     setCupIdx]     = useState(0);
  const [cupVisible, setCupVisible] = useState(false);
  const [bagDown,    setBagDown]    = useState(false);
  const [logoIn,     setLogoIn]     = useState(false);
  const [fading,     setFading]     = useState(false);

  useEffect(() => {
    // dot expands → cup fades in → teabag cycles down/up per cup → logo → fade out
    const ts: ReturnType<typeof setTimeout>[] = [];
    let t = 0;

    const after = (ms: number, fn: () => void) => { t += ms; ts.push(setTimeout(fn, t)); };

    after(100,  () => setDotGrow(true));       // dot expands to fill screen
    after(900,  () => { setCupVisible(true); setDotOut(true); }); // cup fades in, dot fades out
    after(500,  () => setBagDown(true));        // teabag dips in
    after(700,  () => setBagDown(false));       // teabag lifts
    after(400,  () => setLogoIn(true));         // logo appears

    // cycle through remaining cups — colour fades in as bag dips down
    for (let i = 1; i < CUP_SEQUENCE.length; i++) {
      const idx = i;
      after(800,  () => { setBagDown(true); setCupIdx(idx); }); // bag dips, colour blends in
      after(700,  () => setBagDown(false));                      // bag lifts
      after(600,  () => setBagDown(true));                       // second dip
      after(700,  () => setBagDown(false));
    }

    after(800,  () => setFading(true));
    after(600,  () => onDismiss());

    return () => ts.forEach(clearTimeout);
  }, [onDismiss]);

  const { cup, color } = CUP_SEQUENCE[cupIdx];

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      backgroundColor: "#fff",
      overflow: "hidden",
      opacity: fading ? 0 : 1,
      transition: fading ? "opacity 0.6s ease" : "none",
    }}>

      {/* Expanding colour dot */}
      <div style={{
        position: "absolute",
        width: 16, height: 16, borderRadius: "50%",
        top: "calc(50% - 8px)", left: "calc(50% - 8px)",
        background: color,
        transform: dotGrow ? "scale(80)" : "scale(1)",
        opacity: dotOut ? 0 : 1,
        transition: `transform 0.9s cubic-bezier(0.22,1,0.36,1), background 0.6s ease, opacity 0.9s ease`,
        willChange: "transform",
        zIndex: 1,
      }} />

      {/* Cup image — crossfades on cup change */}
      {CUP_SEQUENCE.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s.cup} src={s.cup} alt="" aria-hidden style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          opacity: cupVisible && cupIdx === i ? 1 : 0,
          transition: `opacity ${i === 0 ? "1.6s" : "0.7s"} ease`,
          zIndex: 2,
        }} />
      ))}

      {/* Teabag — slides down into cup and back up */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/teabagdip.png" alt="" aria-hidden style={{
        position: "absolute",
        top: 0, left: "50%",
        transform: `translateX(-50%) translateY(${bagDown ? "-30%" : "-60%"})`,
        width: "55%", maxWidth: 220,
        opacity: cupVisible ? 1 : 0,
        transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
        willChange: "transform",
        zIndex: 3,
      }} />

    </div>
  );
}

// ── Splash Screen C — glass cup + real teabag dip, tea colour changes ─────────

// Amber → green gradient across dips
const TEA_DIP_COLOURS = [
  "rgba(0,0,0,0)",      // dip 1 — no tint yet, pure amber tea
  "rgba(80,160,60,0.18)",  // dip 2 — hint of green
  "rgba(60,150,50,0.38)",  // dip 3 — greener
  "rgba(40,140,40,0.58)",  // dip 4 — clearly green tea
];

const CUP_IMAGES = [
  "/images/glass-teacuop.png",
  "/images/glass-teacuop-2.png",
  "/images/glass-teacuop3.png",
];

function SplashScreenC({ onDismiss }: { onDismiss: () => void }) {
  const [cupIn,        setCupIn]        = useState(false);
  const [cupImgIdx,    setCupImgIdx]    = useState(0);
  const [bagDown,      setBagDown]      = useState(false);
  const [bagShortDown, setBagShortDown] = useState(false);
  const [bagOut,       setBagOut]       = useState(false);
  const [greenFill, setGreenFill] = useState(false);
  const [colourIdx, setColourIdx] = useState(0);
  const [logoIn,    setLogoIn]    = useState(false);
  const [fading,    setFading]    = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    const after = (ms: number, fn: () => void) => { t += ms; ts.push(setTimeout(fn, t)); };

    after(200,  () => setCupIn(true));
    after(1000, () => setLogoIn(true));

    // dip 1 — short
    after(900, () => setBagShortDown(true));
    after(350, () => setColourIdx(0));
    after(300, () => setBagShortDown(false));

    // dip 2 — short, blend to cup 2, then pause 2s with bag up
    after(700, () => setBagShortDown(true));
    after(350, () => { setColourIdx(1); setCupImgIdx(1); });
    after(300, () => setBagShortDown(false));

    // pause 2 seconds while cup 2 is visible
    after(2000, () => { /* bag stays up */ });

    // 3 short dips — gradually blend to cup 3 across them
    after(0,   () => { setBagShortDown(true); setCupImgIdx(2); }); // start blend to cup 3
    after(350, () => setBagShortDown(false));

    after(500, () => setBagShortDown(true));
    after(350, () => setBagShortDown(false));

    after(500, () => setBagShortDown(true));
    after(350, () => { setColourIdx(2); setBagShortDown(false); });

    // bag flies up off screen, green floods in, then home
    after(800,  () => setBagOut(true));
    after(600,  () => setGreenFill(true));
    after(1200, () => setFading(true));
    after(800,  () => onDismiss());

    return () => ts.forEach(clearTimeout);
  }, [onDismiss]);

  const teaColour = TEA_DIP_COLOURS[colourIdx];

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      backgroundColor: "#fff",
      overflow: "hidden",
      opacity: fading ? 0 : 1,
      transition: fading ? "opacity 0.8s ease" : "none",
    }}>
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>

      {/* Glass cup — vh-based height so it's consistent across all screen sizes */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "58vh",
        opacity: cupIn ? 1 : 0,
        transform: `translateY(${cupIn ? "0" : "60vh"})`,
        transition: "transform 1s cubic-bezier(0.22,1,0.36,1), opacity 0.8s ease",
        zIndex: 2,
        overflow: "hidden",
      }}>
        {CUP_IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" aria-hidden style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center bottom",
            opacity: cupImgIdx === i ? 1 : 0,
            transition: "opacity 2.5s ease",
          }} />
        ))}
      </div>

      {/* Floating black logo inside the tea */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/splash-text.svg" alt="Rate your Tea" style={{
        position: "absolute",
        bottom: "calc(10vh + 35px)", left: "50%",
        width: "34%", maxWidth: 140,
        opacity: cupIn ? 0.8 : 0,
        filter: "brightness(0)",
        animation: cupIn ? "floatLogo 3s ease-in-out infinite" : "none",
        transition: "opacity 0.8s ease",
        zIndex: 4,
      }} />

      {/* Real teabag — vh units so dip distance is same on all devices */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/real-teabag.png" alt="" aria-hidden style={{
        position: "absolute",
        top: 0, left: "50%",
        transform: `translateX(-50%) translateY(${bagOut ? "-120vh" : bagShortDown ? "-8vh" : bagDown ? "8vh" : cupIn ? "calc(-18vh - 20px)" : "-40vh"})`,
        width: "62%", maxWidth: 252,
        opacity: cupIn ? 1 : 0,
        mixBlendMode: "multiply",
        transition: bagOut ? "transform 0.7s cubic-bezier(0.55,0,1,0.45)" : "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease",
        willChange: "transform",
        zIndex: 5,
      }} />

      {/* Green flood — expands from centre after bag exits */}
      <div style={{
        position: "absolute",
        width: 80, height: 80, borderRadius: "50%",
        top: "calc(50% - 40px)", left: "calc(50% - 40px)",
        background: "#3dba6e",
        transform: greenFill ? "scale(30)" : "scale(0)",
        transition: greenFill ? "transform 1s cubic-bezier(0.4,0,0.6,1)" : "none",
        willChange: "transform",
        zIndex: 6,
      }} />

    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTeaId, setActiveTeaId] = useState<string | null>(null);
  const [sharedRating, setSharedRating] = useState<Rating | null>(null);
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

  // Detect shared rating in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("share");
    if (encoded) {
      try {
        const rating = JSON.parse(atob(encoded)) as Rating;
        setSharedRating(rating);
      } catch { /* ignore malformed */ }
    }
  }, []);

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
    setScreen("home");
    setTimeout(() => setActiveTeaId(null), 320);
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

  const [rateSlideDir, setRateSlideDir] = useState<"up" | "right">("up");
  const rateSlideDirRef = useRef<"up" | "right">("up");
  const [rateTransition, setRateTransition] = useState(true);

  const handleDismissRate = () => {
    setScreen(rateSlideDirRef.current === "right" ? "leaderboard" : "home");
    // Delay clearing so the slide-out animation completes before unmounting
    setTimeout(() => setActiveTeaId(null), 320);
  };
  const handleEditFromLeaderboard = (teaId: string) => {
    rateSlideDirRef.current = "right";
    // Snap to off-screen-right instantly (no transition while repositioning)
    setRateTransition(false);
    setRateSlideDir("right");
    setActiveTeaId(teaId);
    // After the snap paint, re-enable transition and slide in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setRateTransition(true);
      setScreen("rate");
    }));
  };
  const handleOpenFromHome = (teaId: string) => {
    rateSlideDirRef.current = "up";
    setRateSlideDir("up");
    openRate(teaId);
  };

  return (
    <div className="flex items-center justify-center sm:bg-[#d1d5db] bg-[#F7F6F3] sm:p-4" style={{ minHeight: "100dvh" }}>
      <div
        className="relative overflow-hidden w-full sm:h-[844px] sm:w-[390px] sm:rounded-[50px] sm:shadow-2xl"
        style={{ height: "100dvh", background: "#F7F6F3" } as React.CSSProperties}
      >

        {/* Home */}
        <div className="absolute inset-0">
          <HomeScreen ratings={ratings} animatingId={animatingId} onSelectTea={handleOpenFromHome} onViewLeaderboard={() => setScreen("leaderboard")} splashDone={!showSplash} />
        </div>

        {/* Leaderboard — slides up, stays put when rate slides over it from right */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out" style={{ transform: (leaderboardVisible || (rateVisible && rateSlideDir === "right")) ? "translateY(0)" : "translateY(100%)", background: "#F7F6F3" }}>
          <LeaderboardScreen ratings={ratings} onEditTea={handleEditFromLeaderboard} onClose={() => setScreen("home")} />
        </div>

        {/* Rate — slides up from home, slides in from right over leaderboard */}
        <div className="absolute inset-0" style={{
          transform: rateVisible ? "translate(0,0)" : rateSlideDir === "right" ? "translateX(100%)" : "translateY(100%)",
          transition: rateTransition ? "transform 0.3s ease-in-out" : "none",
          background: "#fff",
          zIndex: rateSlideDir === "right" ? 10 : "auto",
        }}>
          {activeTeaId && (
            <RateScreen key={activeTeaId} teaId={activeTeaId} existing={ratings.get(activeTeaId)}
              fromLeaderboard={rateSlideDir === "right"}
              onSubmit={handleSubmit} onUnrate={handleUnrate} onDismiss={handleDismissRate} />
          )}
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

        {/* Shared rating overlay — slides up when opened via link */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out" style={{ transform: sharedRating ? "translateY(0)" : "translateY(100%)", background: "#fff", zIndex: 50 }}>
          {sharedRating && <SharedRatingView rating={sharedRating} onClose={() => setSharedRating(null)} />}
        </div>

        {/* Home indicator bar */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
          <div className="rounded-full" style={{ width: 134, height: 5, background: "rgba(0,0,0,0.2)" }} />
        </div>

        {/* Splash screen */}
        {showSplash && <SplashScreenC onDismiss={() => setShowSplash(false)} />}
      </div>
    </div>
  );
}
