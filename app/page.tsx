"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAS = [
  { id: "adelaide-breakfast",   name: "Adelaide Breakfast",   image: "/images/adelaide-breakfast.png",   color: "#C0442A", t2url: "https://www.t2tea.com/search?q=adelaide+breakfast",    description: "A bold, full-bodied South Australian blend with a rich malty character and deep amber brew. Its robust strength makes it the perfect wake-up cup — best enjoyed with a splash of milk." },
  { id: "sydney-breakfast",     name: "Sydney Breakfast",     image: "/images/sydney-breakfast.jpg",     color: "#1C3A6B", t2url: "https://www.t2tea.com/search?q=sydney+breakfast",      description: "Bright and smooth like a harbour morning, this blend balances clean Assam notes with a gentle brightness. Effortlessly drinkable, it pairs beautifully with or without milk." },
  { id: "melbourne-breakfast",  name: "Melbourne Breakfast",  image: "/images/melbourne-breakfast.jpg",  color: "#2A3A2C", t2url: "https://www.t2tea.com/search?q=melbourne+breakfast",   description: "Complex and layered like the city itself, Melbourne Breakfast brings together earthy depth and a smooth finish. A sophisticated brew for those who take their tea seriously." },
  { id: "irish-breakfast",      name: "Irish Breakfast",      image: "/images/irish-breakfast.jpg",      color: "#1E4A3A", t2url: "https://www.t2tea.com/search?q=irish+breakfast",       description: "A hearty, full-strength blend of fine Assam teas, Irish Breakfast is bold, malty and built to stand up to milk. The ideal companion for a proper sit-down breakfast." },
  { id: "singapore-breakfast",  name: "Singapore Breakfast",  image: "/images/singapore-breakfast.jpg",  color: "#6B3FA0", t2url: "https://www.t2tea.com/search?q=singapore+breakfast",   description: "Aromatic and silky with subtle floral notes, this Southeast Asian-inspired blend is smooth and fragrant. A refined morning cup that transports you straight to the tropics." },
  { id: "canberra-breakfast",   name: "Canberra Breakfast",   image: "/images/canberra-breakfast.png",   color: "#2563B0", t2url: "https://www.t2tea.com/search?q=canberra+breakfast",    description: "Crisp, clean and precisely balanced — much like the capital itself. This refined blend has a delicate character that reveals more with every sip. Understated excellence." },
  { id: "brisbane-breakfast",   name: "Brisbane Breakfast",   image: "/images/brisbane-breakfast.jpg",   color: "#E07820", t2url: "https://www.t2tea.com/search?q=brisbane+breakfast",    description: "Warm, sunny and effortlessly uplifting, Brisbane Breakfast has golden notes and a smooth, easy-drinking finish. The kind of tea that makes mornings feel like a good idea." },
  { id: "english-breakfast",    name: "English Breakfast",    image: "/images/english-breakfast.jpg",    color: "#C8202A", t2url: "https://www.t2tea.com/search?q=english+breakfast",     description: "The timeless classic. A well-rounded blend of Assam, Ceylon and Kenyan teas delivering a full-bodied, brisk cup. Strong enough for milk, smooth enough on its own." },
  { id: "scots-breakfast",      name: "Scots Breakfast",      image: "/images/scots-breakfast.png",      color: "#1A4F8A", t2url: "https://www.t2tea.com/search?q=scots+breakfast",       description: "Bold and unapologetically strong, Scots Breakfast is a hearty highland-inspired blend with a robust, warming character. Not for the faint-hearted — and all the better for it." },
  { id: "new-zealand-breakfast",name: "New Zealand Breakfast",image: "/images/new-zealand-breakfast.jpg",color: "#7AB028", t2url: "https://www.t2tea.com/search?q=new+zealand+breakfast", description: "Fresh, clean and naturally light with a gentle grassy sweetness. New Zealand Breakfast reflects the country's pure landscapes — a bright, uncomplicated cup to start the day." },
  { id: "new-york-breakfast",   name: "New York Breakfast",   image: "/images/new-york-breakfast.jpg",   color: "#D4A020", t2url: "https://www.t2tea.com/search?q=new+york+breakfast",    description: "Bold, energising and built for pace — just like the city. New York Breakfast hits hard with a robust, full-strength brew that powers you through whatever the day throws at you." },
];

// ── Taste DNA data ────────────────────────────────────────────────────────────

const TEA_INGREDIENT_MAP: Record<string, string[]> = {
  "adelaide-breakfast":    ["malt", "cinnamon", "assam"],
  "sydney-breakfast":      ["malt", "assam", "bergamot"],
  "melbourne-breakfast":   ["vanilla", "cacao-husk", "malt"],
  "irish-breakfast":       ["malt", "assam", "oat-flakes"],
  "singapore-breakfast":   ["rose-petals", "vanilla", "coconut"],
  "canberra-breakfast":    ["cinnamon", "coconut", "rose-petals", "oat-flakes"],
  "brisbane-breakfast":    ["coconut", "vanilla", "malt"],
  "english-breakfast":     ["malt", "assam", "bergamot"],
  "scots-breakfast":       ["cinnamon", "cacao-husk", "oat-flakes"],
  "new-zealand-breakfast": ["malt", "bergamot", "vanilla"],
  "new-york-breakfast":    ["cinnamon", "vanilla", "malt"],
};

const ALL_INGREDIENTS = [
  { id: "malt",        name: "Malt",        desc: "Rich & roasted",  color: "#B0603A" },
  { id: "cinnamon",    name: "Cinnamon",    desc: "Spice & warmth",  color: "#C0813A" },
  { id: "vanilla",     name: "Vanilla",     desc: "Sweet & creamy",  color: "#C89B4A" },
  { id: "cacao-husk",  name: "Cacao husk",  desc: "Chocolate",       color: "#7A4E2E" },
  { id: "oat-flakes",  name: "Oat flakes",  desc: "Toasty grain",    color: "#A98A5E" },
  { id: "coconut",     name: "Coconut",     desc: "Dessert",         color: "#B9A98C" },
  { id: "rose-petals", name: "Rose petals", desc: "Floral",          color: "#BE8A86" },
  { id: "assam",       name: "Assam leaf",  desc: "Bold & brisk",    color: "#8B5E3C" },
  { id: "bergamot",    name: "Bergamot",    desc: "Citrus & floral", color: "#7A8A5A" },
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

type Screen = "home" | "rate" | "leaderboard" | "complete" | "tasteDNA";

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
                ? "#3EC4C3"
                : "transparent",
              border: n <= value ? "none" : "2px solid #E5E5EA",
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
          style={{ width: `${value}%`, background: "#3EC4C3", transition: "width 0.05s" }}
        />
      </div>
      {/* Thumb */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-white"
        style={{
          width: 28, height: 28,
          left: `calc(${value}% - 14px)`,
          boxShadow: "0 2px 8px rgba(48,209,88,0.35), 0 0 0 2px #3EC4C3",
          transition: "left 0.05s",
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "#3EC4C3" }} />
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

function TeaThumb({ tea, size = 40, noRing = false }: { tea: (typeof TEAS)[number]; size?: number; noRing?: boolean }) {
  const hash = tea.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotate = ((hash * 37) % 80) - 40;
  const rad = (Math.abs(rotate) * Math.PI) / 180;
  const minScale = Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)) + 0.15;
  const foilScale = minScale + (hash % 5) * 0.08;
  const tx = ((hash * 13) % 20) - 10;
  const ty = ((hash * 17) % 20) - 10;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      backgroundColor: tea.color,
      border: noRing ? "none" : "2.5px solid #fff",
      boxShadow: noRing ? "none" : `0 0 0 2.5px ${tea.color}, 0 3px 10px rgba(0,0,0,0.15)`,
      position: "relative",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/foil-texture.png" alt="" aria-hidden style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: "grayscale(1) contrast(2.2) brightness(0.8)", opacity: 0.65, mixBlendMode: "overlay",
        transform: `rotate(${rotate}deg) scale(${foilScale}) translate(${tx}px,${ty}px)`,
        transformOrigin: "center center",
      }} />
    </div>
  );
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
              <path d="M2 8L7.5 14L18 2" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.5, color: "#1A1A2E", textTransform: "uppercase" }}>Rated</span>
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

function DecideModal({ unrated, onRate, onClose }: {
  unrated: (typeof TEAS)[number][];
  onRate: (id: string) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 350); };

  const prev = () => setIdx(i => (i - 1 + unrated.length) % unrated.length);
  const next = () => setIdx(i => (i + 1) % unrated.length);

  if (!unrated.length) return null;
  const tea = unrated[idx];

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "flex-end",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          background: "#FAFAFA",
          borderRadius: "28px 28px 0 0",
          paddingBottom: 40,
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          overflow: "hidden",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, background: "#ddd" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <p style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>
            Teas to try
          </p>
          <button onClick={close} style={{ width: 32, height: 32, borderRadius: 16, background: "#FAFAFA", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 16 }}>✕</button>
        </div>

        {/* Card */}
        <div
          style={{ paddingInline: 20 }}
          onPointerDown={e => { startX.current = e.clientX; }}
          onPointerUp={e => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            if (dx < -40) next();
            else if (dx > 40) prev();
            startX.current = null;
          }}
        >
          <div style={{
            background: "#fff",
            borderRadius: 24,
            padding: "28px 24px 24px",
            border: "1px solid #F0F0F0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            minHeight: 320,
          }}>
            <TeaThumb tea={tea} size={72} />
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", letterSpacing: -0.4, marginBottom: 10 }}>
                {tea.name}
              </h2>
              <p style={{ fontSize: 15, color: "#666", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
                {tea.description}
              </p>
            </div>
            <button
              onClick={() => { onRate(tea.id); close(); }}
              style={{
                marginTop: 8, height: 50, paddingInline: 32, borderRadius: 999, border: "none",
                background: "#3EC4C3",
                color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(62,196,195,0.35)",
                width: "100%",
              }}
            >
              Rate this tea
            </button>
          </div>
        </div>

        {/* Dots + arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 20, paddingInline: 20 }}>
          <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#9CA3AF" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {unrated.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 18 : 7, height: 7, borderRadius: 9999, border: "none", cursor: "pointer",
                background: i === idx ? "#3EC4C3" : "#ddd",
                transition: "width 0.2s ease, background 0.2s ease", padding: 0,
              }} />
            ))}
          </div>
          <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#9CA3AF" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Count */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 8 }}>
          {idx + 1} of {unrated.length} unrated
        </p>
      </div>
    </div>
  );
}

function HomeScreen({ ratings, animatingId, onSelectTea, onViewLeaderboard, onViewTasteDNA, splashDone }: {
  ratings: Map<string, Rating>; animatingId: string | null;
  onSelectTea: (id: string) => void; onViewLeaderboard: () => void;
  onViewTasteDNA: () => void; splashDone: boolean;
}) {
  const tastedCount = ratings.size;
  const progressPct = (tastedCount / 11) * 100;
  const [cardsIn, setCardsIn] = useState(false);
  const [decideOpen, setDecideOpen] = useState(false);
  const unrated = TEAS.filter(t => !ratings.has(t.id));

  useEffect(() => {
    if (!splashDone) return;
    const t = setTimeout(() => setCardsIn(true), 80);
    return () => clearTimeout(t);
  }, [splashDone]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "transparent" }}>
      <StatusBar />

      {/* Header */}
      <div className="px-5 pb-4 text-center" style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 17, color: "#9CA3AF", fontWeight: 400, marginBottom: 2, letterSpacing: 0.1 }}>Hi Kate</p>
        <img src="/images/tea-logo-horiz.svg" alt="Rate your Tea" style={{ width: 200, maxWidth: "70%", margin: "4px auto 0", display: "block" }} />
        {tastedCount === 0 ? (
          <p style={{ fontSize: 14, color: "#9CA3AF" }}>Pick any of your samples and start rating</p>
        ) : (
          <div style={{ marginTop: 20 }}>
            <div className="flex items-center gap-3 px-1">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#E5E5EA" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: "#3EC4C3" }} />
              </div>
              <span className="font-semibold tabular-nums" style={{ fontSize: 15, color: "#1A1A2E", minWidth: 40 }}>
                {tastedCount}/11
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Can't decide link */}
      {unrated.length > 0 && (
        <div style={{ textAlign: "center", paddingBottom: 16 }}>
          <button
            onClick={() => setDecideOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#3EC4C3", textDecoration: "none", padding: 0 }}
          >
            Can't decide which tea to try next?
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="px-4" style={{ paddingTop: 4, paddingBottom: 110 }}>
        <div className="grid grid-cols-3" style={{ columnGap: 12, rowGap: 24 }}>
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
          {/* Taste DNA icon — fills the empty 12th cell */}
          <div style={{
            opacity: cardsIn ? 1 : 0,
            transform: cardsIn ? "translateY(0)" : "translateY(-24px)",
            transition: `opacity 0.4s ease ${TEAS.length * 55}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${TEAS.length * 55}ms`,
            width: "100%", aspectRatio: "1",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <button
              onClick={onViewTasteDNA}
              aria-label="Taste DNA"
              style={{
                width: 35, height: 35, borderRadius: 8,
                background: "#fff",
                border: "1px solid #d1d1d1",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0,
              }}
            >
              <img src="/images/graphicon.svg" alt="" aria-hidden style={{ width: 22, height: 22 }} />
            </button>
          </div>
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
              background: "#3EC4C3",
              boxShadow: "0 4px 20px rgba(62,196,195,0.35)",
              fontSize: 15,
            }}
          >
            View leaderboard
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}><path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {/* Decide modal */}
      {decideOpen && (
        <DecideModal
          unrated={unrated}
          onRate={onSelectTea}
          onClose={() => setDecideOpen(false)}
        />
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
            <button onClick={onDismiss} className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, color: "#1A1A2E", flexShrink: 0 }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          ) : null}

          {/* Tea image + name — always shown */}
          <div className="flex items-center gap-3">
            <TeaThumb tea={tea} size={imgSize} />
            <h1 className="font-bold" style={{ color: "#1A1A2E", letterSpacing: -0.4, display: "flex", flexDirection: inline ? "row" : "column", alignItems: inline ? "baseline" : "flex-start", gap: inline ? 5 : 0 }}>
              <span style={{ fontSize: titleSize, lineHeight: 1.15, transition: "font-size 0.1s" }}>{tea.name.replace(/\s+\S+$/, "")}</span>
              <span style={{ fontSize: subSize, fontWeight: 500, color: inline ? "#1A1A2E" : "#9CA3AF", lineHeight: 1.15, transition: "font-size 0.1s, color 0.15s" }}>{tea.name.split(" ").pop()}</span>
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
              <button onClick={onDismiss} className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, color: "#1A1A2E" }}>
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
          <div className="rounded-2xl p-4 space-y-5" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
            <p className="font-semibold" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Score the basics</p>
            {AXES.map((axis) => (
              <div key={axis.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-semibold" style={{ fontSize: 15, color: "#1A1A2E" }}>{axis.label}</span>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{axis.prompt}</span>
                </div>
                <DotRating value={axes[axis.id]} onChange={(v) => setAxis(axis.id, v)} />
                <div className="flex gap-2.5 mt-1" style={{ fontSize: 15, color: "#9CA3AF" }}>
                  <span className="w-9 shrink-0 text-center">{axis.scaleLabels[0]}</span>
                  <span className="w-9 shrink-0" />
                  <span className="w-9 shrink-0 text-center" style={{ marginLeft: -5 }}>{axis.scaleLabels[1]}</span>
                  <span className="w-9 shrink-0" />
                  <span className="w-9 shrink-0 text-center">{axis.scaleLabels[2]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Would you buy this tea?</p>
              <span className="font-bold tabular-nums" style={{ fontSize: 22, color: "#F28B6A" }}>
                {buyAgainPct}%
              </span>
            </div>
            <Slider value={buyAgainPct} onChange={setBuyAgainPct} />
            <div className="flex justify-between" style={{ fontSize: 11, color: "#ffffff", marginTop: 2 }}>
              <span>Wouldn&apos;t buy</span>
              <span>Definitely buying</span>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
            <p className="font-semibold mb-2" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Tasting note</p>
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
      <div className="pt-3 pb-8 px-5" style={{ flexShrink: 0, background: "#fff", borderTop: "1px solid #FAFAFA", zIndex: 20 }}>
        {existing ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSubmit({ teaId, axes, buyAgainPct, note })}
              className="font-semibold text-white transition-opacity active:opacity-80 shrink-0"
              style={{ height: 52, width: 220, borderRadius: 999, background: "#3EC4C3", fontSize: 15 }}
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
          <div className="rounded-full" style={{ width: 36, height: 4, background: "#E5E5EA" }} />
        </div>
        <p className="font-semibold mb-1" style={{ fontSize: 16, color: "#1A1A2E" }}>Share Kate&apos;s rating</p>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>{tea.name} · {buyAgainPct}% likely to buy</p>
        <button
          onClick={() => {
            const url = shareUrl();
            if (navigator.share) {
              navigator.share({ title: `Kate rated ${tea.name}`, text: `Kate tried ${tea.name} and gave it a ${buyAgainPct}% likely-to-buy score. See her full rating:`, url });
            }
            setShareOpen(false);
          }}
          className="w-full flex items-center gap-4 active:opacity-70 transition-opacity"
          style={{ height: 56, borderRadius: 20, background: "#fff", border: "1px solid #F0F0F0", paddingLeft: 18, paddingRight: 18, marginBottom: 10 }}
        >
          <span style={{ fontSize: 22 }}>💬</span>
          <div className="text-left">
            <p className="font-medium" style={{ fontSize: 15, color: "#1A1A2E" }}>Send via Messages</p>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>Share with a friend</p>
          </div>
          <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(shareUrl()).then(() => setShareOpen(false)); }}
          className="w-full flex items-center gap-4 active:opacity-70 transition-opacity"
          style={{ height: 56, borderRadius: 20, background: "#fff", border: "1px solid #F0F0F0", paddingLeft: 18, paddingRight: 18 }}
        >
          <span style={{ fontSize: 22 }}>🔗</span>
          <div className="text-left">
            <p className="font-medium" style={{ fontSize: 15, color: "#1A1A2E" }}>Copy link</p>
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>Paste anywhere</p>
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
    <div className="flex flex-col h-full" style={{ background: "transparent" }}>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-4" style={{ paddingTop: 14 }}>
        <div className="flex-1 text-center">
          <h1 className="font-bold" style={{ fontSize: 26, color: "#1A1A2E", letterSpacing: -0.6 }}>Leaderboard</h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 1 }}>ranked by would-buy-again</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 20, color: "#1A1A2E" }}
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
                background: tab === t ? "#3EC4C3" : "transparent",
                color: tab === t ? "#fff" : "#9CA3AF",
                border: tab === t ? "none" : "1.5px solid #F0F0F0",
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
              style={{ background: "#fff", borderRadius: 20, padding: "12px 14px", border: "1px solid #F0F0F0" }}
            >
              <span className="font-bold tabular-nums" style={{ fontSize: 13, color: "#ccc", width: 20, textAlign: "right" }}>{i + 1}</span>
              <TeaThumb tea={tea} size={36} />
              <span className="flex-1 text-left font-medium" style={{ fontSize: 14, color: "#1A1A2E" }}>{tea.name}</span>
              <span className="font-bold tabular-nums" style={{
                fontSize: 17,
                color: "#F28B6A",
              }}>{r.buyAgainPct}%</span>
            </button>
          );
        })}

        {/* Placeholder */}
        <div className="flex items-center gap-3" style={{
          background: "transparent", border: "1.5px dashed #E5E5EA",
          borderRadius: 20, padding: "12px 14px",
        }}>
          <span style={{ fontSize: 13, color: "#ddd", width: 20, textAlign: "right" }}>{ranked.length + 1}</span>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FAFAFA", flexShrink: 0 }} />
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

// ── Taste DNA screen ──────────────────────────────────────────────────────────

function TasteDNAScreen({ ratings, onClose }: { ratings: Map<string, Rating>; onClose: () => void }) {
  const [pinned, setPinned] = useState<string | null>(null);

  // Compute top 5 teas by composite score
  const scored = Array.from(ratings.entries())
    .map(([id, r]) => ({
      id,
      tea: TEAS.find(t => t.id === id)!,
      score: r.axes.strength + r.axes.aroma + r.axes.flavour + r.buyAgainPct / 100,
    }))
    .filter(x => x.tea)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topN = scored.length;

  // Compute ingredient frequency across top teas
  const ingredientRows = ALL_INGREDIENTS.map(ing => {
    const teaIds = scored.filter(s => (TEA_INGREDIENT_MAP[s.id] ?? []).includes(ing.id)).map(s => s.id);
    return { ...ing, count: teaIds.length, teaIds };
  }).filter(r => r.count > 0).sort((a, b) => b.count - a.count);

  const active = ingredientRows.find(r => r.name === pinned) ?? null;
  const chipState = (id: string) => {
    if (!active) return "";
    return active.teaIds.includes(id) ? "on" : "off";
  };

  const teal    = "#3EC4C3";
  const orange  = "#F28B6A";
  const ink     = "#1A1A2E";
  const soft    = "#9CA3AF";
  const pageBg  = "#FAFAFA";
  const card    = "#FFFFFF";
  const cardShadow = "none";
  const cardBorder = "1px solid #F0F0F0";

  return (
    <div className="flex flex-col h-full" style={{ background: pageBg, fontFamily: "-apple-system, 'Inter', sans-serif" }}>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center" style={{ padding: "14px 20px 8px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: card, border: cardBorder, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ink, flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 700, color: ink, letterSpacing: -0.2, margin: "0 36px 0 0" }}>Taste DNA</h1>
      </div>

      {topN === 0 ? (
        <div className="flex-1 flex items-center justify-center px-8 text-center">
          <p style={{ fontSize: 15, color: soft, lineHeight: 1.7 }}>Rate some teas first — your flavour profile will appear here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 40px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: ink, letterSpacing: -0.6, margin: "0 0 4px" }}>Your Flavour</h2>
            <p style={{ fontSize: 14, color: soft, margin: 0 }}>Based on your top {topN} rated {topN === 1 ? "tea" : "teas"}</p>
          </div>

          {/* Top teas chips */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: teal, margin: "0 0 10px 2px" }}>Top teas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {scored.map(({ id, tea }) => {
                const state = chipState(id);
                return (
                  <span key={id} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 999,
                    fontSize: 13, fontWeight: 600,
                    background: state === "on" ? `rgba(62,196,195,0.12)` : "#fff",
                    border: `1.5px solid ${state === "on" ? teal : "#F0F0F0"}`,
                    color: state === "on" ? teal : ink,
                    opacity: state === "off" ? 0.28 : 1,
                    transition: "all .18s ease",
                  }}>
                    <TeaThumb tea={tea} size={16} noRing />
                    {tea.name.replace(" Breakfast", "")}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Section label */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: soft, margin: "0 0 12px 4px" }}>Flavour breakdown</p>

          {/* Ingredient cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ingredientRows.map(ing => {
              const isActive = pinned === ing.name;
              const pct = Math.round((ing.count / topN) * 100);
              return (
                <button
                  key={ing.name}
                  onClick={() => setPinned(isActive ? null : ing.name)}
                  style={{
                    background: card,
                    borderRadius: 20,
                    padding: "16px 16px 14px",
                    boxShadow: "none",
                    border: `1.5px solid ${isActive ? teal : "#F0F0F0"}`,
                    display: "block", width: "100%", textAlign: "left",
                    cursor: "pointer", transition: "all .18s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    {/* Left: name + descriptor */}
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: ink, margin: "0 0 3px", letterSpacing: -0.2 }}>{ing.name}</p>
                      <p style={{ fontSize: 12, fontWeight: 500, color: isActive ? teal : soft, margin: 0, letterSpacing: 0.1 }}>{ing.desc}</p>
                    </div>
                    {/* Right: circular badge */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                      background: isActive ? `rgba(242,139,106,0.12)` : "#F3F4F6",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: isActive ? orange : soft, lineHeight: 1 }}>{ing.count}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? orange : soft, opacity: 0.8 }}>of {topN}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, borderRadius: 99, background: "#F3F4F6", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${pct}%`,
                      background: isActive ? `linear-gradient(90deg, ${teal}, ${orange})` : teal,
                      transition: "width .3s ease, background .18s ease",
                    }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          <p style={{ textAlign: "center", fontSize: 12, color: soft, marginTop: 20 }}>Tap a row to highlight which teas share that ingredient</p>
        </div>
      )}
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
          <TeaThumb tea={tea} size={44} />
          <div>
            <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Kate rated this</p>
            <h1 className="font-bold" style={{ fontSize: 22, color: "#1A1A2E", letterSpacing: -0.4 }}>{tea.name}</h1>
          </div>
        </div>
        <button onClick={onClose} className="flex items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: 18, background: "#f3f4f6", color: "#555", fontSize: 16 }}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-8">
        {/* Axes */}
        <div className="rounded-2xl p-4 space-y-5" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
          <p className="font-semibold" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Score the basics</p>
          {AXES.map((axis) => (
            <div key={axis.id}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-semibold" style={{ fontSize: 15, color: "#1A1A2E" }}>{axis.label}</span>
              </div>
              {/* Read-only dots */}
              <div className="flex gap-2.5">
                {[1,2,3,4,5].map((n) => (
                  <div key={n} className="w-9 h-9 flex items-center justify-center">
                    <span className="block w-5 h-5 rounded-full" style={{
                      background: n <= rating.axes[axis.id] ? "#3EC4C3" : "transparent",
                      border: n <= rating.axes[axis.id] ? "none" : "2px solid #E5E5EA",
                      transform: n <= rating.axes[axis.id] ? "scale(1.1)" : "scale(1)",
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 mt-1" style={{ fontSize: 15, color: "#9CA3AF" }}>
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
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
          <div className="flex items-center justify-between">
            <p className="font-semibold" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Would you buy this tea?</p>
            <span className="font-bold tabular-nums" style={{ fontSize: 22, color: "#3EC4C3" }}>
              {rating.buyAgainPct}%
            </span>
          </div>
          {/* Read-only track */}
          <div className="w-full rounded-full overflow-hidden mt-3" style={{ height: 8, background: "#e5e7eb" }}>
            <div className="h-full rounded-full" style={{ width: `${rating.buyAgainPct}%`, background: "#3EC4C3" }} />
          </div>
          <div className="flex justify-between mt-1" style={{ fontSize: 11, color: "#bbb" }}>
            <span>Wouldn&apos;t buy</span><span>Definitely buying</span>
          </div>
        </div>

        {/* Note */}
        {rating.note ? (
          <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #F0F0F0" }}>
            <p className="font-semibold mb-2" style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Tasting note</p>
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
        color: "#9CA3AF", letterSpacing: 0.2,
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

// ── Splash V1 — logo grow → teahcup5 overhead → white iris wipe ──────────────

function SplashScreenV1({ onDismiss }: { onDismiss: () => void }) {
  const [logoVisible, setLogoVisible] = useState(false);
  const [cupVisible,  setCupVisible]  = useState(false);
  const [logoOut,     setLogoOut]     = useState(false);
  const [irisGrow,    setIrisGrow]    = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setLogoVisible(true),  50),
      setTimeout(() => setCupVisible(true),  800),
      setTimeout(() => setLogoOut(true),    1600),
      setTimeout(() => setIrisGrow(true),   2200),
      setTimeout(() => onDismiss(),         4000),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDismiss]);

  const logoTransform = logoOut
    ? "scale(0.5)"
    : logoVisible ? "scale(1)" : "scale(0.18)";
  const logoOpacity = logoOut ? 0 : logoVisible ? 1 : 0;
  const logoTransition = logoOut
    ? "transform 0.5s ease-in, opacity 0.5s ease-in"
    : "transform 1.1s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease-out";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, backgroundColor: "#fff", overflow: "hidden" }}>

      {/* Cup photo — fades in full-screen */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/teahcup5.png" alt="" aria-hidden style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "center",
        opacity: cupVisible ? 1 : 0,
        transition: "opacity 0.9s ease",
        willChange: "opacity",
      }} />

      {/* Logo — grows in green, turns white over cup, then shrinks out */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/splash-text.svg" alt="Rate your Tea" style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%) ${logoTransform}`,
        width: "62%", maxWidth: 240,
        opacity: logoOpacity,
        transition: logoTransition + ", filter 0.9s ease",
        willChange: "transform, opacity",
        transformOrigin: "center center",
        zIndex: 2,
        filter: cupVisible
          ? "brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))"
          : "brightness(0) saturate(100%) invert(45%) sepia(40%) saturate(600%) hue-rotate(60deg) brightness(95%)",
      }} />

      {/* White iris wipe */}
      <div style={{
        position: "absolute",
        width: 80, height: 80, borderRadius: "50%",
        top: "calc(48% - 40px)", left: "calc(50% - 40px)",
        background: "#fff",
        transform: irisGrow ? "scale(25)" : "scale(0)",
        transition: irisGrow ? "transform 2s cubic-bezier(0.25,0.1,0.25,1)" : "none",
        willChange: "transform",
        zIndex: 3,
      }} />
    </div>
  );
}

// ── Splash V3 — sunrise→night illustrated scene (design_handoff_rate_your_tea2) ─

function SplashScreenV3({ onDismiss }: { onDismiss: () => void }) {
  const [isNight,  setIsNight]  = useState(false);
  const [starsIn,  setStarsIn]  = useState(false);
  const [logoIn,   setLogoIn]   = useState(false);
  const [logoOut,  setLogoOut]  = useState(false);
  const [irisGrow, setIrisGrow] = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setLogoIn(true),   900),
      setTimeout(() => setIsNight(true),  3200),
      setTimeout(() => setStarsIn(true),  3800),
      setTimeout(() => setLogoOut(true),  5200),
      setTimeout(() => setIrisGrow(true), 5900),
      setTimeout(() => onDismiss(),       7600),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDismiss]);

  const logoOpacity  = logoOut ? 0 : logoIn ? 1 : 0;
  const logoTrans    = logoOut ? "opacity 0.5s ease-in" : "opacity 0.9s ease-out";
  // Sunrise: periwinkle #6c8ad2 · Night: white
  const logoFilter   = isNight
    ? "brightness(0) invert(1)"
    : "brightness(0) saturate(100%) invert(52%) sepia(35%) saturate(600%) hue-rotate(195deg)";

  const stroke = isNight ? "#1b2748" : "#2b52e0";
  const strokeTrans = { stroke, transition: "stroke 2.4s ease" };
  const whiteFill   = { fill: isNight ? "#f3f7fc" : "#fdfdff", transition: "fill 2.4s ease" };
  const shadowFill  = { fill: isNight ? "#a8c4dd" : "#cfccef", transition: "fill 2.4s ease" };
  const cushionFill = { fill: isNight ? "#89a7c2" : "#b1bdf7", transition: "fill 2.4s ease" };
  const lineFill    = { fill: isNight ? "#1a2348" : "#2b52e0", transition: "fill 2.4s ease" };
  const lw  = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, overflow: "hidden" }}>

      {/* ── Sky: CSS gradients so they fill the full viewport without SVG clipping ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, #ffeda9 0%, #fce6b4 20%, #f8dabf 40%, #f3cdd6 62%, #efc6e0 82%, #ecc6e8 100%)",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, #87b2cc 0%, #7a9fbd 20%, #66819f 42%, #545f88 62%, #45456f 82%, #3a3866 100%)",
        opacity: isNight ? 1 : 0,
        transition: "opacity 2.4s ease",
      }}/>

      {/* ── Illustration as HTML img — SVGs are transparent when used this way ── */}
      <img
        src="/images/Illustrator-vector2.svg"
        alt="" aria-hidden
        style={{
          position: "absolute", bottom: 0, left: 0, width: "100%", display: "block",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Stars + Cat overlay SVG ── */}
      <svg
        viewBox="0 0 1149 2532"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >

        {/* Stars — fade in at night */}
        <g style={{ opacity: starsIn ? 1 : 0, transition: "opacity 2.4s ease" }} fill="#dfeaf6">
          <path d="M199,227c1.77-1.31,2.77-.31,3,3,1.19,1.13,2.96,1.13,3.98,2.5-.62,1.45-2.39,1.1-2.98,1.5,1.41,2.78-1,5.5-4,4-1.46-1.36-.69-2.42-1-3-1.22,1.17-1.95.7-2-1-.31-.17-1.81.18-2.03-.49-1.11-3.42,1.62-2.04,2.97-3.03,1.01-.74,1.05-2.51,2.05-3.48Z"/>
          <path d="M511,174c2.18-1.16,2.61-.09,3,2,.26.13.72-.13,1,0,2.93.85,1.91,3.91-1,4-.86,1.23-.37,3.5-2.49,3-3.6-4.92-7.06-4.35-.51-9Z"/>
          <path d="M128,646c.07-.25,2.74-4.16,2.93-4.34,1.9-1.72,4.13.62,5.36,2.28,1.83,2.47-2.76,6.85-4.41,5.47-.21-.18-.39-.98-.88-1.41-.95-.82-1.64-1.73-3-2Z"/>
          <path d="M490,378c.17,2.79-.58,3.2,2,5,1.52,1.06,2.44.71,3,1,6.03,3.14-2.56,4.07-4.03,5.48-1.39,1.33-.87,2.91-.97,4.52-.13,1.69-2.56,1.57-3,0-.56-1.24-1.17-3.13-2-4l-3-1c.03-.3.07-.82,0-1-2.06-.28-3.4-1.1-2-3,1.1-.67,5.05-1.19,5.77-2.24.37-.53.72-3.35,1.23-4.76.09-1.58,2.67-1.67,3,0Z"/>
          <path d="M760,302l-4.5,5.98-5.49-4.5c-.4-2.03,1.72-1.64,3.06-2.95.97-.95.54-3.38,2.43-2.54,1.19.53,1.94,4.32,4.5,4.02Z"/>
          <path d="M864.7,634c3.71-.96,6.05,4.63,1.6,5.78-3.71.96-6.05-4.63-1.6-5.78Z"/>
          <path d="M443,636c.99.79,3.28-.71,2.68,1.74l-4.52,4.49-5.46-4.49c-.41-2.21,1.77-1.2,3.45-2.53.59-.46.16-2.82,2.04-1.96.84.39.99,2.09,1.82,2.74Z"/>
          <path d="M1030,325c5.36-5.92,2.53-.86,7.99,1.02.65,2.93-3.67,2.09-2.99,4.98-.55,1.34-2.13,1.28-3,0-1.43-2.18-2.82-1.82-3-2-2.68-2.69-.07-2.81,1-4Z"/>
          <path d="M675,689c.16.15-.17,2.12.48,3,.97,1.3,4.65.47,3.52,2.49-.77,1.37-3.01,1.09-3.71,1.8s-.5,4.33-2.77,3.72c-.43-.12-6.04-6.49-5.51-6.99,3.01,1.41,5.67-6.18,7.99-4.01Z"/>
          <path d="M260,824c-1.04.93-.73,2.81-1.63,3.06-4.82,1.33-7.88-2.08-4.44-4.63,2.47-1.82,5.67,2.68,5.06-1.43.17.69.68,1.72,1,3Z"/>
          <path d="M575,899c-1.81,3.63-3.17,5.11-5,8,.47-4.03-2.75-2.71-3-6,.15-.24-.15-.76,0-1,1.89-3.07,3.19-6.2,5-9,.53-.81.9-2.22,1.99-1.99-1.27,3.83-.06,6.37,1.01,9.99Z"/>
          <path d="M999,55l-5.5,7.97c-1.53-.85-1.2-2.92-2.04-3.94-1.09-1.31-7.45-2.38-3.06-4.16,2.93-1.18,4.32-.47,4.61-4.88,2.81,1.63,1.52,5.72,5.99,5.01Z"/>
          <path d="M967,481c.21-1.68-.36-5.05,2.92-2.94.38.25.64,3.11,1.08,3.94,1.57.36,2.42.78,1,2,1.91,2.26,4.55,2.39,6.99,3.49-3.31,4.97-8.91,1.84-9.48,10.52l-2.52-2.02c.1-.19-.03-.64,0-1-1.81.06-2.15-1.78-1-3-.18-.26-.73-.8-1-1l-6-2c-.15-.17-.85-.09-.99-.5v-1.49c1.27-.31,2.8-.52,3.99-1.01.66-1.93,2.32-3.6,5-5Z"/>
          <path d="M622,517c.88.93,3.13,1.15,2.64,2.85-.25.88-2.29,1.09-2.69,1.71-.26.4.42,2.95-1.81,3.78-.7-2.16-7.39-6-5.5-7.97.11-.11,1.97.15,2.96-.55,2.36-1.65-.29-4.74,4.39.18Z"/>
        </g>

        {/* Cat on cushion — translate matches scene offset y=1163 */}
        <g transform="translate(0,1163)">
          {/* Shadow */}
          <ellipse cx="246" cy="1340" rx="138" ry="20" style={shadowFill}/>
          {/* Cushion */}
          <path style={cushionFill} d="M150,1322C150,1296 176,1284 246,1284C316,1284 342,1296 342,1322C342,1348 316,1360 246,1360C176,1360 150,1348 150,1322Z"/>
          <path {...lw} strokeWidth="3.4" style={strokeTrans} d="M150,1322C150,1296 176,1284 246,1284C316,1284 342,1296 342,1322C342,1348 316,1360 246,1360C176,1360 150,1348 150,1322Z"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M168,1310C204,1300 288,1300 324,1310"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M150,1322l-12,-4M150,1322l-13,5"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M342,1322l12,-4M342,1322l13,5"/>
          {/* Body */}
          <path style={whiteFill} d="M196,1300C188,1252 200,1206 246,1206C292,1206 304,1252 296,1300C284,1314 208,1314 196,1300Z"/>
          <path {...lw} strokeWidth="3.4" style={strokeTrans} d="M196,1300C190,1256 200,1208 246,1208C292,1208 302,1256 296,1300"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M216,1306C214,1296 218,1288 228,1288C236,1288 240,1296 238,1306"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M256,1306C254,1296 258,1288 268,1288C276,1288 280,1296 278,1306"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M225,1306l0,-8M232,1306l0,-8M265,1306l0,-8M272,1306l0,-8"/>
          <path {...lw} strokeWidth="3.4" style={strokeTrans} d="M294,1298C334,1304 354,1276 342,1250C335,1234 316,1232 308,1246C303,1255 308,1266 318,1264"/>
          {/* Head */}
          <path style={whiteFill} d="M246,1136C214,1136 196,1158 196,1182C196,1208 220,1224 246,1224C272,1224 296,1208 296,1182C296,1158 278,1136 246,1136Z"/>
          <path style={whiteFill} d="M210,1150L200,1116L234,1140Z"/>
          <path style={whiteFill} d="M282,1150L292,1116L258,1140Z"/>
          <path {...lw} strokeWidth="3.4" style={strokeTrans} d="M210,1150L200,1116L234,1140"/>
          <path {...lw} strokeWidth="3.4" style={strokeTrans} d="M282,1150L292,1116L258,1140"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M212,1144L207,1126L223,1138Z"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M280,1144L285,1126L269,1138Z"/>
          <path {...lw} strokeWidth="3.4" style={strokeTrans} d="M234,1140C214,1142 196,1160 196,1182C196,1208 220,1224 246,1224C272,1224 296,1208 296,1182C296,1160 278,1142 258,1140"/>
          <path style={lineFill} d="M246,1188C243,1188 242,1191 246,1192C250,1191 249,1188 246,1188Z"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M246,1190l0,6M246,1196C242,1202 236,1202 233,1198M246,1196C250,1202 256,1202 259,1198"/>
          {/* Whiskers */}
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M218,1188l-22,-4M218,1196l-22,4"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M274,1188l22,-4M274,1196l22,4"/>
          {/* Sleepy eyes */}
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M224,1180C228,1186 234,1186 238,1180"/>
          <path {...lw} strokeWidth="2.6" style={strokeTrans} d="M254,1180C258,1186 264,1186 268,1180"/>
        </g>
      </svg>{/* end stars+cat overlay */}

      {/* ── Logo (new-tea-logo.svg) in upper third ── */}
      <img
        src="/images/new-tea-logo.svg"
        alt="Rate your Tea"
        style={{
          position: "absolute",
          top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: "78%", maxWidth: 310,
          opacity: logoOpacity,
          transition: logoTrans,
          filter: logoFilter,
          willChange: "opacity, filter",
        }}
      />

      {/* ── White iris wipe ── */}
      <div style={{
        position: "absolute",
        width: 80, height: 80, borderRadius: "50%",
        top: "calc(50% - 40px)", left: "calc(50% - 40px)",
        background: "#fff",
        transform: irisGrow ? "scale(30)" : "scale(0)",
        transition: irisGrow ? "transform 1.8s cubic-bezier(0.25,0.1,0.25,1)" : "none",
        willChange: "transform", zIndex: 3,
      }}/>
    </div>
  );
}

// ── Splash V2 — glass cup + teabag dip (active: SplashScreenC below) ─────────

// Dip animation: long dip → partial rise → short dip → colour change (x2)
const DIP_DURATION = 9000;
const CUP2_AT     = DIP_DURATION * 0.28;  // at bottom of dip 2
const CUP3_AT     = DIP_DURATION * 0.78;  // at bottom of dip 3
const BAGOUT_AT   = DIP_DURATION + 400;

function SplashScreenC({ onDismiss }: { onDismiss: () => void }) {
  const [cupIn,     setCupIn]     = useState(false);
  const [cupImgIdx, setCupImgIdx] = useState(0);
  const [dipping,   setDipping]   = useState(false);
  const [bagOut,    setBagOut]    = useState(false);
  const [greenFill, setGreenFill] = useState(false);
  const [irisGrow,  setIrisGrow]  = useState(false);
  const [logoIn,    setLogoIn]    = useState(false);
  const [hiVisible, setHiVisible] = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    const after = (ms: number, fn: () => void) => { t += ms; ts.push(setTimeout(fn, t)); };

    // absolute timings from t=0
    const DIP_START = 2000; // ms after mount when animation begins
    ts.push(setTimeout(() => setCupIn(true),              200));
    ts.push(setTimeout(() => setHiVisible(true),         1400));
    ts.push(setTimeout(() => setLogoIn(true),            1200));
    ts.push(setTimeout(() => setHiVisible(false), DIP_START + DIP_DURATION + 100));
    ts.push(setTimeout(() => setDipping(true),      DIP_START));
    // cup 2 after long dip (2nd dip); cup 3 after second long dip
    ts.push(setTimeout(() => setCupImgIdx(1),  DIP_START + DIP_DURATION * 0.28));
    ts.push(setTimeout(() => setCupImgIdx(2),  DIP_START + DIP_DURATION * 0.78));
    // fire slightly early so exit animation starts before onAnimationEnd React re-render latency
    ts.push(setTimeout(() => setBagOut(true),  DIP_START + DIP_DURATION - 50));
    ts.push(setTimeout(() => setGreenFill(true), DIP_START + DIP_DURATION + 900));
    ts.push(setTimeout(() => setIrisGrow(true),  DIP_START + DIP_DURATION + 1600));
    ts.push(setTimeout(() => onDismiss(),        DIP_START + DIP_DURATION + 2000));

    return () => ts.forEach(clearTimeout);
  }, [onDismiss]);

  return (
    <div className="splash-root" style={{
      position: "absolute", inset: 0, zIndex: 100,
      backgroundColor: "#fff",
      overflow: "hidden",
    }}>
      <style>{`
        .splash-root { --bag-offset: -30px; --dip-bottom: calc(var(--ch, 100vh) * -0.06 + var(--bag-offset, -20px)); }
        @media (max-width: 639px) { .splash-root { --bag-offset: -40px; } }
        @media (min-width: 640px) { .splash-root { --dip-bottom: calc(var(--ch, 100vh) * 0.06 + var(--bag-offset, -20px)); } }
        @keyframes floatLogo {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes teabagEnter {
          from { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -1.5 + var(--bag-offset, -20px))); }
          to   { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -0.26 + var(--bag-offset, -20px))); }
        }
        @keyframes teabagExit {
          from { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -0.26 + var(--bag-offset, -20px))); }
          to   { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -1.5 + var(--bag-offset, -20px))); }
        }
        @media (min-width: 640px) {
          .splash-cup { height: calc(var(--ch, 100vh) * 0.58) !important; }
        }
        @keyframes teabagDip {
          /* Dip 2: long dip down → back to rest */
          0%        { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -0.26 + var(--bag-offset, -20px))); }
          28%       { transform: translateX(-50%) translateY(var(--dip-bottom)); }
          50%       { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -0.26 + var(--bag-offset, -20px))); }
          /* Dip 3: long dip down → back to rest */
          78%       { transform: translateX(-50%) translateY(var(--dip-bottom)); }
          100%      { transform: translateX(-50%) translateY(calc(var(--ch, 100vh) * -0.26 + var(--bag-offset, -20px))); }
        }
        }
      `}</style>

      {/* Glass cup — vh-based height so it's consistent across all screen sizes */}
      <div className="splash-cup" style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "calc(var(--ch, 100vh) * 0.68)",
        opacity: cupIn ? 1 : 0,
        transform: cupIn ? "translateY(0)" : "translateY(calc(var(--ch, 100vh) * 0.6))",
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
            transition: "opacity 2s ease",
          }} />
        ))}
      </div>

      {/* Floating black logo inside the tea */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/splash-text.svg" alt="Rate your Tea" style={{
        position: "absolute",
        bottom: "calc(var(--ch, 100vh) * 0.10 + 55px)", left: "50%",
        width: "34%", maxWidth: 140,
        opacity: cupIn ? 0.8 : 0,
        filter: "brightness(0)",
        animation: cupIn ? "floatLogo 3s ease-in-out infinite" : "none",
        transition: "opacity 0.8s ease",
        zIndex: 4,
      }} />

      {/* Real teabag — vh units so dip distance is same on all devices */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/real-teabag.png" alt="" aria-hidden
        onAnimationEnd={(e) => { if (e.animationName === "teabagDip") setBagOut(true); }}
        style={{
        position: "absolute",
        top: 0, left: "50%",
        transform: "translateX(-50%)",
        animation: bagOut
          ? "teabagExit 0.7s cubic-bezier(0.55,0,1,0.45) forwards"
          : dipping
            ? `teabagDip ${DIP_DURATION}ms linear forwards`
            : cupIn
              ? "teabagEnter 1.8s cubic-bezier(0.4,0,0.2,1) forwards"
              : "none",
        width: "62%", maxWidth: 252,
        opacity: cupIn ? 1 : 0,
        mixBlendMode: "multiply",
        transition: "opacity 0.3s ease",
        willChange: "transform",
        zIndex: 8,
      }} />

      {/* Hi Kate greeting */}
      <div style={{
        position: "absolute",
        top: "10%", left: 0, right: 0,
        textAlign: "center",
        opacity: hiVisible ? 1 : 0,
        transition: hiVisible ? "opacity 2.5s ease" : "opacity 0.6s ease",
        zIndex: 3,
        pointerEvents: "none",
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: "#9CA3AF", letterSpacing: -0.5 }}>Hi Kate</span>
      </div>

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

      {/* White iris — expands from centre over the green, reveals home screen */}
      <div style={{
        position: "absolute",
        width: 80, height: 80, borderRadius: "50%",
        top: "calc(50% - 40px)", left: "calc(50% - 40px)",
        background: "#fff",
        transform: irisGrow ? "scale(30)" : "scale(0)",
        transition: irisGrow ? "transform 0.8s cubic-bezier(0.25,0.1,0.25,1)" : "none",
        willChange: "transform",
        zIndex: 7,
      }} />

    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set --ch to actual container height so splash uses container px not viewport vh
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => el.style.setProperty("--ch", `${el.clientHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    <div className="flex items-center justify-center sm:bg-[#E5E5EA] bg-[#E5E5EA] sm:p-4" style={{ minHeight: "100dvh" }}>
      <div
        ref={containerRef}
        className="relative overflow-hidden w-full sm:h-[844px] sm:w-[390px] sm:rounded-[50px] sm:shadow-2xl"
        style={{ height: "100dvh", background: "#FAFAFA" } as React.CSSProperties}
      >

        {/* Home */}
        <div className="absolute inset-0">
          <HomeScreen ratings={ratings} animatingId={animatingId} onSelectTea={handleOpenFromHome} onViewLeaderboard={() => setScreen("leaderboard")} onViewTasteDNA={() => setScreen("tasteDNA")} splashDone={!showSplash} />
        </div>

        {/* Leaderboard — slides up, stays put when rate slides over it from right */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out" style={{ transform: (leaderboardVisible || (rateVisible && rateSlideDir === "right")) ? "translateY(0)" : "translateY(100%)", background: "#FAFAFA" }}>
          <LeaderboardScreen ratings={ratings} onEditTea={handleEditFromLeaderboard} onClose={() => setScreen("home")} />
        </div>

        {/* Taste DNA — slides up from home */}
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out" style={{ transform: screen === "tasteDNA" ? "translateY(0)" : "translateY(100%)" }}>
          <TasteDNAScreen ratings={ratings} onClose={() => setScreen("home")} />
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
        {showSplash && <SplashScreenV3 onDismiss={() => setShowSplash(false)} />}
      </div>
    </div>
  );
}
