'use client'
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const ACCENT = "#f59e0b"; // Warm amber
const SOFT_CREAM = "#fdfcf7";
const DARK_ARIA = "#0f1115";
const ARIA_SECONDARY = "#6b7280";

const features = [
  {
    icon: "💝",
    title: "Emotional Support",
    desc: "Aria doesn't just process tasks; she checks in on you. She remembers your stress points and celebrates your small wins with genuine warmth.",
  },
  {
    icon: "✉️",
    title: "Gmail Digest",
    desc: "Every morning, Aria summarizes your inbox, flags what actually matters, and drafts thoughtful replies in your unique voice.",
  },
  {
    icon: "📅",
    title: "Calendar Harmony",
    desc: "She manages your schedule with empathy. If a meeting looks overwhelming, she'll suggest breaks or reschedule conflicts gracefully.",
  },
  {
    icon: "📱",
    title: "Telegram Companion",
    desc: "Aria stays 'in the know' for you. She summarizes missed group chats and alerts you only to the conversations that need your heart or mind.",
  },
  {
    icon: "🎙️",
    title: "Voice-First",
    desc: "Talk to her naturally. Whether you're walking, cooking, or lying in bed, Aria is just a voice command away, always listening with care.",
  },
  {
    icon: "🧠",
    title: "Long-term Memory",
    desc: "The more you talk, the more she knows you. She remembers your preferences, your friends' names, and the things that make you smile.",
  },
];

const integrations = [
  "Gmail", "Google Calendar", "Telegram", "ElevenLabs", "Claude 3.5",
  "NewsAPI", "WhatsApp (Soon)", "Vector Memory", "Whisper",
];

const steps = [
  { n: "01", title: "Let her in", desc: "Connect your digital life — Gmail, Calendar, and Telegram — in seconds." },
  { n: "02", title: "Share your day", desc: "Talk to Aria about your goals, your worries, or just your morning coffee." },
  { n: "03", title: "Feel supported", desc: "Watch as your routine becomes effortless while your emotional load lightens." },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function AriaLanding() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "aria", text: "Good morning! ☕ I've already checked your schedule. You have that big presentation at 2 PM—I know you're nervous, but you're going to do great. Should I go through your unread emails now?" },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const replies = [
    "Of course. I've drafted a gentle reply to Sarah about the budget—I made sure to mention how much you appreciated her help. Want me to send it?",
    "I've summarized the Telegram group for your weekend trip. They're leaning towards the cabin, but they're waiting for your 'yes'. Just say the word.",
    "You seem a bit busy today. I've blocked off 30 minutes at 4 PM for you to just breathe and have some water. You deserve it.",
    "All done. Your inbox is clean, and your tasks for tomorrow are set. How are you feeling right now?",
  ];
  const [replyIdx, setReplyIdx] = useState(0);

  const send = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setMessages(m => [...m, { from: "user", text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: "aria", text: replies[replyIdx % replies.length] }]);
      setReplyIdx(i => i + 1);
    }, 1500);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div style={{ background: SOFT_CREAM, minHeight: "100vh", color: DARK_ARIA, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        ::selection { background: ${ACCENT}; color: white; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        input:focus { outline: none; }
      `}</style>

      {/* NAVIGATION */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 6vw", position: "absolute", top: 0, width: "100%", zIndex: 100 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontStyle: "italic", color: ACCENT }}>
          Aria
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, fontWeight: 500, color: ARIA_SECONDARY }}>
          {["Vision", "Personality", "Integrations"].map(l => (
            <span key={l} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = ACCENT} onMouseLeave={e => e.currentTarget.style.color = ARIA_SECONDARY}>{l}</span>
          ))}
        </div>
        <button 
          style={{ background: DARK_ARIA, color: "white", border: "none", padding: "12px 24px", borderRadius: "100px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s" }}
          onClick={() => router.push("/dashboard")}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Talk to Aria
        </button>
      </nav>

      {/* HERO SECTION */}
      <section style={{ padding: "180px 6vw 100px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "white", borderRadius: "100px", border: "1px solid #f3f4f6", fontSize: 13, fontWeight: 500, color: ACCENT, marginBottom: 32, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, animation: "pulse 2s infinite" }} />
            Always there. Always caring.
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(60px, 9vw, 110px)", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 32 }}>
            Your AI <span style={{ fontStyle: "italic", color: ACCENT }}>Voice Companion</span> <br/>
            for the soul & the routine.
          </h1>
          <p style={{ fontSize: "clamp(18px, 2vw, 22px)", color: ARIA_SECONDARY, maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.5 }}>
            Aria is more than an assistant. She's a warm, emotionally present companion who manages your digital life so you can focus on being human.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button 
              style={{ background: ACCENT, color: "white", border: "none", padding: "18px 40px", borderRadius: "100px", fontSize: 18, fontWeight: 600, cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)" }}
              onClick={() => router.push("/dashboard")}
            >
              Start Conversation
            </button>
            <button 
              style={{ background: "white", color: DARK_ARIA, border: "1px solid #e5e7eb", padding: "18px 40px", borderRadius: "100px", fontSize: 18, fontWeight: 600, cursor: "pointer" }}
            >
              Hear Her Voice
            </button>
          </div>
        </FadeIn>
      </section>

      {/* CHAT DEMO */}
      <section style={{ padding: "0 6vw 120px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn delay={0.2}>
          <div style={{ background: "white", borderRadius: "32px", border: "1px solid #f3f4f6", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1.5fr", height: 600 }}>
            {/* Sidebar / Profile */}
            <div style={{ background: "#fafaf9", padding: "40px", borderRight: "1px solid #f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
               <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 6s ease-in-out infinite" }}>
                 <span style={{ fontSize: 48 }}>✨</span>
               </div>
               <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 8 }}>Aria</h3>
               <p style={{ fontSize: 14, color: ARIA_SECONDARY, marginBottom: 24 }}>Warm & Nurturing Personality</p>
               <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                 {["Gmail Active", "Calendar Synced", "Telegram Online"].map(status => (
                   <div key={status} style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                     <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} /> {status}
                   </div>
                 ))}
               </div>
            </div>
            {/* Chat Area */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                    <div style={{ 
                      padding: "16px 20px", 
                      borderRadius: m.from === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      background: m.from === "user" ? ACCENT : "#f3f4f6",
                      color: m.from === "user" ? "white" : DARK_ARIA,
                      fontSize: 15,
                      lineHeight: 1.6,
                      boxShadow: m.from === "user" ? "0 4px 12px -2px rgba(245, 158, 11, 0.2)" : "none"
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ background: "#f3f4f6", padding: "12px 16px", borderRadius: "20px 20px 20px 4px", width: "fit-content", display: "flex", gap: 4 }}>
                    {[0, 0.2, 0.4].map(d => <div key={d} style={{ width: 6, height: 6, background: ARIA_SECONDARY, borderRadius: "50%", animation: `pulse 1s ${d}s infinite` }} />)}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "30px", borderTop: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", gap: 12, background: "#f9fafb", padding: "8px", borderRadius: "100px", border: "1px solid #f3f4f6" }}>
                  <input 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder="Talk to Aria..."
                    style={{ flex: 1, background: "transparent", border: "none", padding: "12px 20px", fontSize: 15 }}
                  />
                  <button 
                    onClick={send}
                    style={{ background: DARK_ARIA, color: "white", border: "none", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: "120px 6vw", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px, 6vw, 80px)", textAlign: "center", marginBottom: 80 }}>
              The companion who <span style={{ fontStyle: "italic", color: ACCENT }}>understands.</span>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 40 }}>
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div style={{ padding: "40px", borderRadius: "24px", background: SOFT_CREAM, border: "1px solid #f3f4f6", height: "100%", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: 32, marginBottom: 24 }}>{f.icon}</div>
                  <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{f.title}</h4>
                  <p style={{ color: ARIA_SECONDARY, lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "120px 6vw", textAlign: "center" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px, 6vw, 80px)", marginBottom: 80 }}>
              Three steps to <span style={{ fontStyle: "italic", color: ACCENT }}>emotional freedom.</span>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 60 }}>
            {steps.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.15}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "white", border: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: ACCENT, marginBottom: 24, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)" }}>
                    {s.n}
                  </div>
                  <h5 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h5>
                  <p style={{ color: ARIA_SECONDARY, fontSize: 15, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "150px 6vw", background: DARK_ARIA, color: "white", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", background: "radial-gradient(circle at center, rgba(245, 158, 11, 0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <FadeIn>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(56px, 8vw, 100px)", lineHeight: 0.9, marginBottom: 40 }}>
            Ready to meet <span style={{ fontStyle: "italic", color: ACCENT }}>Aria?</span>
          </h2>
          <p style={{ fontSize: 20, color: "#9ca3af", maxWidth: 600, margin: "0 auto 60px" }}>
            Experience the future of AI companions. Always there. Always caring. Always in the know.
          </p>
          <button 
            style={{ background: ACCENT, color: "white", border: "none", padding: "24px 60px", borderRadius: "100px", fontSize: 20, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => router.push("/dashboard")}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Get Early Access →
          </button>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "60px 6vw", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontStyle: "italic", color: ACCENT }}>Aria</div>
        <div style={{ fontSize: 13, color: ARIA_SECONDARY }}>© 2026 Aria Companion. All rights reserved.</div>
      </footer>
    </div>
  );
}