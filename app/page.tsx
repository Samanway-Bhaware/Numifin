"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ColorBends from "@/components/ColorBends";
import { useEffect } from "react";


export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e7e8e1",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        color: "white",
      }}
    >
      {/* ── Hero (full viewport) ── */}
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1vh",
          backgroundColor: "#F7F7F5",
        }}
      >
      <div
        style={{
          position: "relative",
          width: "99vw",
          height: "98vh",
          overflow: "hidden",
          borderRadius: "17px",
          backgroundColor: "#0a1612",
        }}
      >
        {/* ColorBends animated background fills the entire section */}
        <div style={{ position: "absolute", inset: 0 }}>
          <ColorBends
            rotation={90}
            speed={0.2}
            colors={["#94af74ff"]}
            transparent
            autoRotate={0.7}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.9}
            noise={0.15}
            iterations={1}
            intensity={1.5}
            bandWidth={3}
          />
        </div>

        {/* Nav — absolute, sitting on top of the canvas */}
        <nav
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: "0 40px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <span style={{ color: "white", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.01em" }}>
            NumiFin
          </span>

          {/* Nav links pill */}
          {/* <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "2px",
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "6px 8px",
            }}
          >
            {["Features", "Solutions", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "13px",
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  letterSpacing: "0.01em",
                  transition: "background 0.15s",
                }}
              >
                {item}
              </a>
            ))}
          </div> */}

          {/* Auth buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/login"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "13px",
                letterSpacing: "0.06em",
                textDecoration: "none",
                padding: "8px 16px",
              }}
            >
              LOG IN
            </Link>
            <Link
              href="/signup"
              style={{
                backgroundColor: "rgba(15,28,22,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "9px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                letterSpacing: "0.06em",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              GET STARTED
            </Link>
          </div>
        </nav>

        {/* Hero content — centered */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          <h1
            className="hero-title"
            style={{
              color: "white",
              fontSize: "clamp(50px, 7.5vw, 92px)",
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              margin: "0 0 24px",
            }}
          >
            Automate Your Accounting
            <br />
            with Autonomous AI Agents.
          </h1>
          <p
            className="hero-subtitle"
            style={{
              color: "rgba(255, 255, 255, 1)",
              fontSize: "18px",
              lineHeight: 1.72,
              maxWidth: "460px",
              margin: 0,
            }}
          >
            Built for the modern independent. Delegate bookkeeping,
            reconciliation, and tax strategy to a suite of specialized AI
            agents working silently in the background.
          </p>
        </div>

        {/* CTA — pinned to bottom-right */}
        <div
          className="hero-cta"
          style={{
            position: "absolute",
            bottom: "40px",
            right: "48px",
            zIndex: 20,
          }}
        >
          <Link href="/signup">
            <button className="group flex items-center gap-0 hover:gap-1 transition-all">
              <span className="bg-[#c5c9a8]/80 backdrop-blur-sm text-[#1a1a1a] px-6 py-3.5 rounded-full text-xs font-medium tracking-widest uppercase">
                Get Started for Free
              </span>
              <span className="bg-[#c5c9a8]/80 backdrop-blur-sm p-3.5 rounded-full -ml-1">
                <ArrowRight className="w-4 h-4 text-[#1a1a1a]" />
              </span>
            </button>
          </Link>
        </div>
      </div>
      </section>

      {/* ── Platform Description ── */}
      <style>{`
        @keyframes ticker-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(8px, -12px) scale(1.04); }
          66%       { transform: translate(-6px, 8px) scale(0.97); }
        }
        @keyframes tag-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .platform-ticker-inner { animation: ticker-up 20s linear infinite; }
        .platform-orb           { animation: orb-drift 8s ease-in-out infinite; }
        .platform-tag           { animation: tag-in 0.5s ease-out both; }
      `}</style>
      <section
        style={{
          backgroundColor: "#F7F7F5",
          padding: "20px",
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "12px",
            height: "100%",
          }}
        >
          {/* ── Left card ── */}
          <div
            style={{
              border: "1px solid rgba(26,26,26,0.12)",
              borderRadius: "14px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              gap: "0",
            }}
          >
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#94af74", flexShrink: 0, display: "inline-block" }} />
              <span style={{ color: "#1a1a1a", fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
                The Integrated Platform
              </span>
            </div>

            {/* Vertical infinite ticker */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative", margin: "28px 0" }}>
              {/* fade top */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "64px", background: "linear-gradient(to bottom, #F7F7F5, transparent)", zIndex: 1, pointerEvents: "none" }} />
              {/* fade bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "64px", background: "linear-gradient(to top, #F7F7F5, transparent)", zIndex: 1, pointerEvents: "none" }} />
              <div className="platform-ticker-inner">
                {[
                  "Autonomous Bookkeeping",
                  "Smart Reconciliation",
                  "Cash Flow Forecasting",
                  "Document Intelligence",
                  "CFO-Level Insights",
                  "Tax Optimization",
                  "Ledger Matching",
                  "Expense Categorization",
                  "Invoice Extraction",
                  "Burn Rate Tracking",
                  "Autonomous Bookkeeping",
                  "Smart Reconciliation",
                  "Cash Flow Forecasting",
                  "Document Intelligence",
                  "CFO-Level Insights",
                  "Tax Optimization",
                  "Ledger Matching",
                  "Expense Categorization",
                  "Invoice Extraction",
                  "Burn Rate Tracking",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "13px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      borderBottom: "1px solid rgba(26,26,26,0.07)",
                    }}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#94af74", flexShrink: 0 }} />
                    <span style={{ color: "rgba(26,26,26,0.65)", fontSize: "13px", letterSpacing: "0.01em" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flexShrink: 0 }}>
              {[
                { value: "97%", label: "Classification accuracy" },
                { value: "5×", label: "Faster reconciliation" },
                { value: "5", label: "Specialized agents" },
                { value: "<1s", label: "Per transaction" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(26,26,26,0.05)" }}>
                  <p style={{ color: "#1a1a1a", fontSize: "24px", fontWeight: 600, margin: "0 0 3px", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ color: "rgba(26,26,26,0.45)", fontSize: "11px", margin: 0, letterSpacing: "0.03em", lineHeight: 1.4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right card ── */}
          <div
            style={{
              border: "1px solid rgba(26,26,26,0.12)",
              borderRadius: "14px",
              padding: "52px 56px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative animated orb */}
            <div
              className="platform-orb"
              style={{
                position: "absolute",
                right: "-80px",
                top: "-80px",
                width: "340px",
                height: "340px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(148,175,116,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div>
              {/* Heading */}
              <h2
                style={{
                  color: "#1a1a1a",
                  fontSize: "clamp(42px, 4.8vw, 72px)",
                  fontWeight: 300,
                  lineHeight: 1.08,
                  letterSpacing: "-0.025em",
                  margin: "0 0 36px",
                  position: "relative",
                }}
              >
                Combining bookkeeping,
                <br />
                reconciliation, and AI
                <br />
                into an{" "}
                <span style={{ color: "rgba(26,26,26,0.2)" }}>
                  engine of financial clarity.
                </span>
              </h2>

              {/* Body */}
              <p
                style={{
                  color: "rgba(26,26,26,0.62)",
                  fontSize: "16px",
                  lineHeight: 1.78,
                  maxWidth: "580px",
                  margin: "0 0 32px",
                  position: "relative",
                }}
              >
                NumiFin enables precise, autonomous control of your financial operations —
                categorizing every transaction, reconciling every ledger, and answering every
                question. At its core are five specialized AI agents that work silently together,
                providing a rich foundation for financial clarity and strategic decision-making.
              </p>

              {/* Feature tag pills */}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px", position: "relative" }}>
                {[
                  "Autonomous Agents",
                  "Real-time Sync",
                  "Explainable AI",
                  "Document OCR",
                  "Custom Rules",
                  "Multi-ledger",
                  "Privacy-first",
                  "Self-hostable",
                ].map((tag, i) => (
                  <span
                    key={tag}
                    className="platform-tag"
                    style={{
                      backgroundColor: i === 0 ? "rgba(148,175,116,0.18)" : "rgba(26,26,26,0.05)",
                      color: i === 0 ? "#4a6e30" : "rgba(26,26,26,0.65)",
                      padding: "7px 16px",
                      borderRadius: "50px",
                      fontSize: "12px",
                      letterSpacing: "0.02em",
                      border: i === 0 ? "1px solid rgba(148,175,116,0.35)" : "1px solid transparent",
                      animationDelay: `${i * 0.06}s`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ position: "relative" }}>
              <Link href="/signup">
                <button className="group flex items-center gap-0 hover:gap-1 transition-all">
                  <span
                    style={{ backgroundColor: "#1a1a1a" }}
                    className="text-white px-6 py-3.5 rounded-full text-xs font-medium tracking-widest uppercase"
                  >
                    Discover our platform
                  </span>
                  <span
                    style={{ backgroundColor: "#94af74" }}
                    className="p-3.5 rounded-full -ml-1 group-hover:ml-0 transition-all"
                  >
                    <ArrowRight className="w-4 h-4 text-[#1a1a1a]" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5-Agent System ── */}
      <section style={{ backgroundColor: "#F7F7F5", padding: "50px 0 20px 0" }}>
        {/* Label */}
        
        {/* 3-column grid, no gaps — cards share borders */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>

          {/* 01 — Bookkeeper */}
          <div className="reveal" style={{ backgroundColor: "#c5e88a", padding: "28px 32px 40px", minHeight: "460px", display: "flex", flexDirection: "column", justifyContent: "space-between", transitionDelay: "0ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Compass icon */}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="rgba(26,26,26,0.55)" strokeWidth="1">
                <circle cx="32" cy="32" r="28" />
                <line x1="32" y1="4" x2="32" y2="60" />
                <line x1="4" y1="32" x2="60" y2="32" />
                <line x1="11.8" y1="11.8" x2="52.2" y2="52.2" />
                <line x1="52.2" y1="11.8" x2="11.8" y2="52.2" />
                <circle cx="32" cy="32" r="5" />
              </svg>
              <span style={{ color: "rgba(26,26,26,0.45)", fontSize: "12px", letterSpacing: "0.05em" }}>01.</span>
            </div>
            <div>
              <h3 style={{ color: "#1a1a1a", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px" }}>
                Bookkeeper
              </h3>
              <p style={{ color: "rgba(26,26,26,0.65)", fontSize: "15px", lineHeight: 1.65, margin: 0 }}>
                Categorizes transactions with biological precision, learning your specific spending patterns over time without manual rules.
              </p>
            </div>
          </div>

          {/* 02 — Reconciliation */}
          <div className="reveal" style={{ backgroundColor: "#1a1a1a", padding: "28px 32px 40px", minHeight: "460px", display: "flex", flexDirection: "column", justifyContent: "space-between", transitionDelay: "80ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Hexagon icon */}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1">
                <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" />
                <polygon points="32,14 50,24 50,44 32,54 14,44 14,24" />
              </svg>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", letterSpacing: "0.05em" }}>02.</span>
            </div>
            <div>
              <h3 style={{ color: "white", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px" }}>
                Reconciliation
              </h3>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.65, margin: 0 }}>
                Detects duplicates and mismatches across multiple ledgers instantly with systematic, high-fidelity accuracy.
              </p>
            </div>
          </div>

          {/* 03 — Cash Flow */}
          <div className="reveal" style={{ backgroundColor: "#e8e8e4", padding: "28px 32px 40px", minHeight: "460px", display: "flex", flexDirection: "column", justifyContent: "space-between", transitionDelay: "160ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Cube icon */}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="rgba(26,26,26,0.4)" strokeWidth="1">
                <rect x="6" y="22" width="32" height="32" />
                <rect x="26" y="10" width="32" height="32" />
                <line x1="6" y1="22" x2="26" y2="10" />
                <line x1="38" y1="22" x2="58" y2="10" />
                <line x1="6" y1="54" x2="26" y2="42" />
              </svg>
              <span style={{ color: "rgba(26,26,26,0.35)", fontSize: "12px", letterSpacing: "0.05em" }}>03.</span>
            </div>
            <div>
              <h3 style={{ color: "#1a1a1a", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px" }}>
                Cash Flow
              </h3>
              <p style={{ color: "rgba(26,26,26,0.65)", fontSize: "15px", lineHeight: 1.65, margin: 0 }}>
                Calculates burn rate and runway through fluid, predictive modeling powered by real-time data ingestion.
              </p>
            </div>
          </div>

          {/* 04 — CFO Agent */}
          <div className="reveal" style={{ backgroundColor: "#fbf7e3ff", padding: "28px 32px 40px", minHeight: "500px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: "1px solid rgba(26,26,26,0.08)", transitionDelay: "80ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Crosshair / dashed circle icon */}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="rgba(26,26,26,0.3)" strokeWidth="1">
                <circle cx="32" cy="32" r="26" strokeDasharray="4 4" />
                <line x1="32" y1="8" x2="32" y2="56" />
                <line x1="8" y1="32" x2="56" y2="32" />
                <circle cx="32" cy="32" r="6" strokeDasharray="3 3" />
              </svg>
              <span style={{ color: "rgba(26,26,26,0.35)", fontSize: "12px", letterSpacing: "0.05em" }}>04.</span>
            </div>
            <div>
              <h3 style={{ color: "#1a1a1a", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px" }}>
                CFO Agent
              </h3>
              <p style={{ color: "rgba(26,26,26,0.65)", fontSize: "15px", lineHeight: 1.65, margin: 0 }}>
                Answers complex financial questions via advanced RAG. Your personal strategist available 24/7.
              </p>
            </div>
          </div>

          {/* 05 — Document Intel (spans 2 cols) */}
          <div className="reveal" style={{ gridColumn: "2 / 4", backgroundColor: "#f7f7bfff", padding: "28px 32px 40px", minHeight: "500px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: "1px solid rgba(26,26,26,0.08)", borderLeft: "1px solid rgba(26,26,26,0.08)", transitionDelay: "160ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Document icon */}
              <svg width="56" height="64" viewBox="0 0 56 64" fill="none" stroke="rgba(26,26,26,0.35)" strokeWidth="1">
                <rect x="4" y="4" width="40" height="52" rx="2" />
                <line x1="12" y1="20" x2="36" y2="20" />
                <line x1="12" y1="30" x2="36" y2="30" />
                <line x1="12" y1="40" x2="28" y2="40" />
              </svg>
              <span style={{ color: "rgba(26,26,26,0.35)", fontSize: "12px", letterSpacing: "0.05em" }}>05.</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h3 style={{ color: "#1a1a1a", fontSize: "clamp(32px, 3.5vw, 48px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px" }}>
                  Document Intel
                </h3>
                <p style={{ color: "rgba(26,26,26,0.65)", fontSize: "15px", lineHeight: 1.65, margin: 0, maxWidth: "420px" }}>
                  Effortlessly handles receipts and complex PDFs, extracting structured data from chaotic physical inputs into an engine of discovery.
                </p>
              </div>
              {/* Decorative circle + icon */}
              <div style={{ flexShrink: 0, position: "relative", width: "120px", height: "120px", marginLeft: "24px" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: "1px solid rgba(26,26,26,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#c5e88a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
                      <rect x="2" y="2" width="18" height="18" rx="2" />
                      <line x1="6" y1="8" x2="16" y2="8" />
                      <line x1="6" y1="12" x2="16" y2="12" />
                      <line x1="6" y1="16" x2="12" y2="16" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Sections + footer: shared styles ── */}
      <style>{`
        /* ── Audience rows ── */
        .aud-row {
          display: grid;
          grid-template-columns: 52px 220px 1fr;
          align-items: baseline;
          gap: 0 32px;
          padding: 30px 16px;
          border-bottom: 1px solid rgba(26,26,26,0.07);
          border-radius: 6px;
          cursor: default;
          transition: background 0.28s cubic-bezier(0.25,1,0.5,1);
        }
        .aud-row:hover { background: rgba(148,175,116,0.07); }
        .aud-row:hover .aud-num { color: #94af74; }
        .aud-num {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(26,26,26,0.22);
          transition: color 0.28s cubic-bezier(0.25,1,0.5,1);
          padding-top: 3px;
        }
        .aud-title {
          font-size: 21px;
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: -0.015em;
        }
        .aud-desc {
          font-size: 15px;
          line-height: 1.65;
          color: rgba(26,26,26,0.5);
          margin: 0;
        }

        /* ── Marquee ── */
        .marquee-wrap {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 80px, #000 calc(100% - 80px), transparent);
          mask-image: linear-gradient(to right, transparent, #000 80px, #000 calc(100% - 80px), transparent);
        }
        .marquee-track { display: flex; gap: 14px; width: max-content; }
        .marquee-fwd { animation: numi-marquee-fwd 65s linear infinite; }
        @keyframes numi-marquee-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .t-card {
          flex-shrink: 0;
          width: 300px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 24px;
          background: rgba(255,255,255,0.035);
        }

        /* ── Pricing table ── */
        .ptable { width: 100%; border-collapse: collapse; }
        .ptable-head th {
          padding: 14px 24px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26,26,26,0.35);
          border-bottom: 1px solid rgba(26,26,26,0.08);
        }
        .ptable-head th.pro-col {
          background: rgba(148,175,116,0.08);
          color: #4a6e30;
          border-radius: 10px 10px 0 0;
        }
        .ptable tbody tr { border-bottom: 1px solid rgba(26,26,26,0.06); }
        .ptable tbody tr:last-child { border-bottom: none; }
        .ptable td { padding: 14px 24px; font-size: 14px; color: rgba(26,26,26,0.6); }
        .ptable td.pro-col { background: rgba(148,175,116,0.065); }
        .ptable td.feat-name { font-weight: 500; color: #1a1a1a; font-size: 14px; }
        .ptable-price td { padding: 22px 24px 10px; }
        .ptable-price td.pro-col { background: rgba(148,175,116,0.065); }
        .ptable-cta td { padding: 22px 24px; border-top: 1px solid rgba(26,26,26,0.08) !important; border-bottom: none !important; }
        .ptable-cta td.pro-col { background: rgba(148,175,116,0.065); }

        /* ── Footer ── */
        @keyframes wordmark-in {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .footer-wordmark { animation: wordmark-in 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        @keyframes footer-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .footer-top { animation: footer-fade 0.8s ease-out 0.1s both; }
        .footer-scroll-btn:hover { background-color: rgba(255,255,255,0.18) !important; }
        .footer-nav-link:hover { color: rgba(255,255,255,0.95) !important; }
        .footer-cta-arrow:hover { background-color: #a8cc60 !important; }

        @media (prefers-reduced-motion: reduce) {
          .marquee-fwd { animation-play-state: paused; }
          .footer-wordmark, .footer-top { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* ── Who It's For ── */}
      <section style={{ backgroundColor: "#F7F7F5", padding: "100px 40px" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "1px", backgroundColor: "#94af74", display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(26,26,26,0.42)" }}>
              Who It&apos;s For
            </span>
          </div>
          <h2 className="reveal" style={{ color: "#1a1a1a", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 56px" }}>
            Built for modern<br />financial operations.
          </h2>
          <div style={{ borderTop: "1px solid rgba(26,26,26,0.07)" }}>
            {([
              { num: "01", title: "Startups",      desc: "Track burn, runway, and financial health in real time without a finance hire." },
              { num: "02", title: "Founders",      desc: "Automate bookkeeping end-to-end so you can focus on the product, not the spreadsheets." },
              { num: "03", title: "Finance Teams", desc: "Speed up reconciliation, close, and reporting workflows by an order of magnitude." },
              { num: "04", title: "SMBs",          desc: "Replace fragmented accounting tools with autonomous AI that runs 24/7." },
            ] as const).map((row, i) => (
              <div key={row.num} className="aud-row reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="aud-num">{row.num}</span>
                <span className="aud-title">{row.title}</span>
                <p className="aud-desc">{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ backgroundColor: "#0d120e", padding: "100px 0" }}>
        {/* Featured quote */}
        <div className="reveal" style={{ padding: "0 40px", maxWidth: "1080px", margin: "0 auto 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "1px", backgroundColor: "#94af74", display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)" }}>
              Testimonials
            </span>
          </div>
          <p style={{ fontSize: "clamp(72px, 10vw, 120px)", lineHeight: 0.7, margin: "0 0 20px", color: "#94af74", fontWeight: 700, letterSpacing: "-0.04em", fontFamily: "Georgia, serif" }}>&ldquo;</p>
          <blockquote style={{ margin: 0 }}>
            <p style={{ color: "white", fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 300, lineHeight: 1.4, letterSpacing: "-0.015em", margin: "0 0 28px", maxWidth: "760px" }}>
              NumiFin cut our month-end close from 3 days to under 4 hours. The reconciliation alone paid for itself in the first week.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#94af74", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#1a1a1a", flexShrink: 0 }}>MC</div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 500, margin: 0 }}>Maya Chen</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: 0 }}>CTO, Synth Labs</p>
              </div>
            </div>
          </blockquote>
        </div>

        {/* More voices */}
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.2)", padding: "0 40px", marginBottom: "20px" }}>
            More voices
          </p>
          <div className="marquee-wrap">
            <div className="marquee-track marquee-fwd">
              {([
                { q: "The reconciliation agent caught a $12k duplicate we'd have missed manually.", name: "Daniel Park",   role: "Finance Lead, Orbital Agency", init: "DP", bg: "#3C366B", fg: "#ffffff" },
                { q: "Finally, bookkeeping that works without a dedicated accountant.",             name: "Priya Mehta",  role: "Founder, Stackflow",           init: "PM", bg: "#c5e88a", fg: "#1a1a1a" },
                { q: "The CFO agent answers in seconds what used to take hours of spreadsheet work.", name: "Tom Bradley", role: "Solo founder",                 init: "TB", bg: "#4a6e30", fg: "#ffffff" },
                { q: "Real-time burn rate tracking alone made the switch worth it.",                 name: "Sarah Kim",   role: "Co-founder, Leafy Commerce",   init: "SK", bg: "#94af74", fg: "#1a1a1a" },
                { q: "We replaced QuickBooks and our bookkeeper. Cheaper, faster, better.",          name: "Marcus Rivera", role: "Operations, Nimbus SMB",     init: "MR", bg: "#e8e8e4", fg: "#1a1a1a" },
                { q: "The AI explanations build real confidence that our books are accurate.",        name: "Leila Osman", role: "CFO, Greenfield Ventures",     init: "LO", bg: "#94af74", fg: "#1a1a1a" },
                { q: "Our runway modeling went from a spreadsheet exercise to a live dashboard.",     name: "Ananya Patel", role: "CEO, Loopify",                init: "AP", bg: "#c5e88a", fg: "#1a1a1a" },
              ] as const).flatMap((t) => [t, { ...t }]).map((t, i) => (
                <div key={i} className="t-card">
                  <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", lineHeight: 1.68, margin: "0 0 16px" }}>&ldquo;{t.q}&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 600, color: t.fg, flexShrink: 0 }}>{t.init}</div>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "12px", fontWeight: 500, margin: 0 }}>{t.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "11px", margin: 0 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ backgroundColor: "#F7F7F5", padding: "100px 40px" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "1px", backgroundColor: "#94af74", display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(26,26,26,0.42)" }}>
              Pricing
            </span>
          </div>
          <h2 className="reveal" style={{ color: "#1a1a1a", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 56px" }}>
            Simple pricing.<br />No surprises.
          </h2>
          <table className="ptable">
            <thead>
              <tr className="ptable-head">
                <th style={{ width: "38%" }}></th>
                <th>Starter</th>
                <th className="pro-col">Pro</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              <tr className="ptable-price">
                <td className="feat-name" style={{ color: "rgba(26,26,26,0.38)", fontWeight: 400, fontSize: "12px" }}>Monthly price</td>
                <td><span style={{ fontSize: "28px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.025em" }}>Free</span></td>
                <td className="pro-col">
                  <span style={{ fontSize: "28px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.025em" }}>$49</span>
                  <span style={{ fontSize: "13px", color: "rgba(26,26,26,0.4)", marginLeft: "4px" }}>/mo</span>
                </td>
                <td>
                  <span style={{ fontSize: "28px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.025em" }}>$149</span>
                  <span style={{ fontSize: "13px", color: "rgba(26,26,26,0.4)", marginLeft: "4px" }}>/mo</span>
                </td>
              </tr>
              {(([
                { feat: "Transactions / month", starter: "500",  pro: "5,000", team: "Unlimited" },
                { feat: "AI categorization",    starter: "✓",    pro: "✓",     team: "✓" },
                { feat: "AI agents",            starter: "—",    pro: "✓",     team: "✓" },
                { feat: "Reconciliation",       starter: "—",    pro: "✓",     team: "✓" },
                { feat: "CFO chat",             starter: "—",    pro: "✓",     team: "✓" },
                { feat: "Multi-user",           starter: "—",    pro: "—",     team: "✓" },
                { feat: "Integrations",         starter: "—",    pro: "—",     team: "✓" },
                { feat: "Custom prompts",       starter: "—",    pro: "—",     team: "✓" },
                { feat: "Priority support",     starter: "—",    pro: "—",     team: "✓" },
              ] as { feat: string; starter: string; pro: string; team: string }[])).map((row) => (
                <tr key={row.feat}>
                  <td className="feat-name">{row.feat}</td>
                  <td style={{ color: row.starter === "—" ? "rgba(26,26,26,0.2)" : row.starter === "✓" ? "#4a6e30" : "rgba(26,26,26,0.65)" }}>{row.starter}</td>
                  <td className="pro-col" style={{ color: row.pro === "—" ? "rgba(26,26,26,0.2)" : row.pro === "✓" ? "#4a6e30" : "rgba(26,26,26,0.65)", fontWeight: row.pro === "✓" ? 500 : 400 }}>{row.pro}</td>
                  <td style={{ color: row.team === "—" ? "rgba(26,26,26,0.2)" : row.team === "✓" ? "#4a6e30" : "rgba(26,26,26,0.65)" }}>{row.team}</td>
                </tr>
              ))}
              <tr className="ptable-cta">
                <td></td>
                <td>
                  <Link href="/signup" style={{ display: "inline-block", padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(26,26,26,0.15)", fontSize: "13px", fontWeight: 500, color: "#1a1a1a", textDecoration: "none" }}>
                    Get started free
                  </Link>
                </td>
                <td className="pro-col">
                  <Link href="/api/stripe/checkout?plan=pro" style={{ display: "inline-block", padding: "10px 20px", borderRadius: "8px", backgroundColor: "#94af74", fontSize: "13px", fontWeight: 500, color: "#1a1a1a", textDecoration: "none" }}>
                    Start with Pro
                  </Link>
                </td>
                <td>
                  <Link href="/api/stripe/checkout?plan=team" style={{ display: "inline-block", padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(26,26,26,0.15)", fontSize: "13px", fontWeight: 500, color: "#1a1a1a", textDecoration: "none" }}>
                    Get Team
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ backgroundColor: "#0a1612", padding: "130px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(148,175,116,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" as const, maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "white", fontSize: "clamp(36px, 5vw, 68px)", fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.025em", margin: "0 0 20px" }}>
            Let AI run your financial operations.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "17px", lineHeight: 1.72, margin: "0 auto 44px", maxWidth: "480px" }}>
            Replace manual finance workflows with autonomous AI agents built for modern businesses.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" as const }}>
            <Link href="/signup">
              <button className="group flex items-center gap-0 hover:gap-1 transition-all">
                <span style={{ backgroundColor: "rgba(10,22,18,0.88)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }} className="text-white px-6 py-3.5 rounded-full text-xs font-medium tracking-widest uppercase">
                  Start Free
                </span>
                <span style={{ backgroundColor: "#94af74" }} className="p-3.5 rounded-full -ml-1 group-hover:ml-0 transition-all">
                  <ArrowRight className="w-4 h-4 text-[#1a1a1a]" />
                </span>
              </button>
            </Link>
            <a href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", letterSpacing: "0.08em", textDecoration: "none", padding: "12px 22px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.12)", transition: "color 0.2s ease, border-color 0.2s ease", textTransform: "uppercase" as const }}>
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#0a1612",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "100vh",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ColorBends background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <ColorBends
            rotation={90}
            speed={0.15}
            colors={["#94af74"]}
            transparent
            autoRotate={0.3}
            scale={1}
            frequency={1}
            warpStrength={0.8}
            mouseInfluence={0.5}
            parallax={0.4}
            noise={0.1}
            iterations={1}
            intensity={1.2}
            bandWidth={4}
          />
        </div>

        {/* ── Top row ── */}
        <div
          className="footer-top"
          style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "40px" }}
        >
          {/* Left: tagline + CTA */}
          <div style={{ maxWidth: "560px" }}>
            <p
              style={{
                color: "white",
                fontSize: "clamp(28px, 3.8vw, 52px)",
                fontWeight: 300,
                lineHeight: 1.22,
                letterSpacing: "-0.02em",
                margin: "0 0 36px",
              }}
            >
              Automating financial operations for modern, independent businesses.
            </p>
            <Link href="/signup">
              <button className="group flex items-center gap-0 hover:gap-1 transition-all">
                <span
                  style={{ backgroundColor: "rgba(10,22,18,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                  className="text-white px-6 py-3.5 rounded-full text-xs font-medium tracking-widest uppercase"
                >
                  Get started
                </span>
                <span
                  style={{ backgroundColor: "#94af74" }}
                  className="footer-cta-arrow p-3.5 rounded-full -ml-1 group-hover:ml-0 transition-all"
                >
                  <ArrowRight className="w-4 h-4 text-[#1a1a1a]" />
                </span>
              </button>
            </Link>
          </div>

          {/* Right: nav links + scroll-to-top */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "64px", flexShrink: 0 }}>
            <div>
              {["Features", "Solutions", "Pricing", "About"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="footer-nav-link"
                  style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "15px", textDecoration: "none", marginBottom: "10px", transition: "color 0.15s" }}
                >
                  {item}
                </a>
              ))}
            </div>
            <div>
              {["LinkedIn", "X (Twitter)", "GitHub"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="footer-nav-link"
                  style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "15px", textDecoration: "none", marginBottom: "10px", transition: "color 0.15s" }}
                >
                  {item}
                </a>
              ))}
            </div>
            <button
              className="footer-scroll-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background-color 0.15s",
                flexShrink: 0,
                backdropFilter: "blur(8px)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                <line x1="8" y1="13" x2="8" y2="3" />
                <polyline points="4,7 8,3 12,7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Large wordmark ── */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0 0 24px" }} />
          <div className="footer-wordmark" style={{ lineHeight: 0.85, overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                color: "white",
                fontSize: "clamp(80px, 18vw, 240px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                userSelect: "none",
              }}
            >
              NumiFin
            </span>
            <p
              style={{
                color: "rgba(255,255,255,0.28)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "16px 0 0",
              }}
            >
              &copy; 2025 NumiFin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
