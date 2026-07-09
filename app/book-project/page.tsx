// // "use client";

// // import { useState, useRef, useEffect, useCallback } from "react";
// // import { useRouter } from "next/navigation";
// // import { motion, AnimatePresence } from "framer-motion";
// // import Image from "next/image";

// // interface Message {
// //   id: number;
// //   text: string;
// //   sender: "bot" | "user";
// //   time: string;
// //   image?: string; // base64 preview
// // }

// // interface LeadState {
// //   name?: string;
// //   phone?: string;
// //   email?: string;
// //   business?: string;
// //   project?: string;
// //   budget?: string;
// //   timeline?: string;
// //   requirements?: string;
// // }

// // interface ManualFormData {
// //   name: string;
// //   phone: string;
// //   email: string;
// //   service: string;
// //   budget: string;
// //   timeline: string;
// //   requirements: string;
// // }

// // type SendStatus = "idle" | "sent" | "updated";

// // function getTime() {
// //   return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
// // }

// // function extractLeadFromConversation(history: { role: string; content: string }[]): LeadState {
// //   const userMessages = history.filter((m) => m.role === "user").map((m) => m.content);
// //   const fullText = userMessages.join(" ");
// //   const lead: LeadState = {};

// //   const phoneMatches = [...fullText.matchAll(/\b[6-9]\d{9}\b/g)];
// //   if (phoneMatches.length) lead.phone = phoneMatches[phoneMatches.length - 1][0];

// //   const emailMatches = [...fullText.matchAll(/[\w.-]+@[\w.-]+\.\w{2,}/g)];
// //   if (emailMatches.length) lead.email = emailMatches[emailMatches.length - 1][0];

// //   const namePatterns = [
// //     /(?:my name is|i(?:'m| am)|naan|per|name is|name)\s+([A-Za-z][a-zA-Z]{1,20})/gi,
// //     /(?:name\s*[:=]\s*)([A-Za-z ]{2,25})/gi,
// //   ];
// //   let lastNameMatch: { text: string; index: number } | null = null;
// //   for (const pat of namePatterns) {
// //     for (const m of fullText.matchAll(pat)) {
// //       if (m[1] && (lastNameMatch === null || (m.index ?? 0) > lastNameMatch.index)) {
// //         lastNameMatch = { text: m[1].trim(), index: m.index ?? 0 };
// //       }
// //     }
// //   }
// //   if (lastNameMatch) lead.name = lastNameMatch.text;

// //   const budgetMatch =
// //     fullText.match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\s*(?:k|thousand|lakh|l))?)/i) ||
// //     fullText.match(/\b(\d{3,6})\s*(?:k|thousand|rupees|rs)\b/i);
// //   if (budgetMatch) lead.budget = `₹${budgetMatch[1]}`;

// //   const timelineMatch = fullText.match(/(\d+\s*(?:day|days|week|weeks|month|months)|asap|urgent|immediately|quick)/i);
// //   if (timelineMatch) lead.timeline = timelineMatch[0];

// //   const projectKeywords: Record<string, string> = {
// //     "landing page": "Landing Page", "ecommerce": "E-Commerce Website",
// //     "portfolio": "Portfolio Website", "business website": "Business Website",
// //     "website": "Website", "logo": "Logo Design", "app": "Mobile App",
// //     "dashboard": "Web Dashboard", "branding": "Branding", "seo": "SEO / Marketing",
// //   };
// //   const lower = fullText.toLowerCase();
// //   for (const [kw, label] of Object.entries(projectKeywords)) {
// //     if (lower.includes(kw)) { lead.project = label; break; }
// //   }

// //   return lead;
// // }

// // function isLeadComplete(lead: LeadState) {
// //   return !!(lead.name && lead.phone && lead.project);
// // }

// // function leadFp(lead: LeadState) {
// //   return `${lead.name}|${lead.phone}|${lead.project}`.toLowerCase().trim();
// // }

// // export default function BookProjectPage() {
// //   const router = useRouter();

// //   const [messages, setMessages] = useState<Message[]>([{
// //     id: 1,
// //     text: "👋 Vanakkam! CraftCode-la welcome!\n\n enna venum? Sollunga, help pannuven! 😊",
// //     sender: "bot",
// //     time: getTime(),
// //   }]);

// //   const [inputMessage, setInputMessage] = useState("");
// //   const [isTyping, setIsTyping] = useState(false);
// //   const [lead, setLead] = useState<LeadState>({});
// //   const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
// //   const [lastSentFp, setLastSentFp] = useState("");
// //   const [retryCount, setRetryCount] = useState(0);

// //   // ✅ NEW: manual fallback form — shown when AI fails (token/API error) or
// //   // when the user opts to skip the chat and fill details directly.
// //   const [showManualForm, setShowManualForm] = useState(false);
// //   const [manualSubmitting, setManualSubmitting] = useState(false);
// //   const [manualForm, setManualForm] = useState<ManualFormData>({
// //     name: "", phone: "", email: "", service: "", budget: "", timeline: "", requirements: "",
// //   });

// //   // Image upload state (for the currently-composed message)
// //   const [pendingImage, setPendingImage] = useState<{ base64: string; mime: string; preview: string } | null>(null);

// //   // ✅ FIX: this ref holds the MOST RECENTLY uploaded image for the entire
// //   // conversation — not just the current turn. Previously, the image was
// //   // only forwarded to Telegram if the lead happened to become "complete"
// //   // on the exact same message where the image was attached. If the user
// //   // uploaded a reference image early and only gave name/phone/service a
// //   // few messages later, the image never reached Telegram. Now, whichever
// //   // message sendWhatsApp fires on (auto-complete OR manual form), it always
// //   // attaches the latest image the user has shared, if any.
// //   const lastImageRef = useRef<{ base64: string; mime: string } | null>(null);

// //   const messagesEndRef = useRef<HTMLDivElement>(null);
// //   const inputRef = useRef<HTMLInputElement>(null);
// //   const fileInputRef = useRef<HTMLInputElement>(null);
// //   const conversationHistory = useRef<{ role: string; content: string }[]>([]);

// //   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, showManualForm]);
// //   useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

// //   // Prefill the manual form with whatever the AI chat already extracted,
// //   // so the user doesn't have to retype what they already told the bot.
// //   useEffect(() => {
// //     if (showManualForm) {
// //       setManualForm(prev => ({
// //         name: prev.name || lead.name || "",
// //         phone: prev.phone || lead.phone || "",
// //         email: prev.email || lead.email || "",
// //         service: prev.service || lead.project || "",
// //         budget: prev.budget || lead.budget || "",
// //         timeline: prev.timeline || lead.timeline || "",
// //         requirements: prev.requirements || lead.requirements || "",
// //       }));
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [showManualForm]);

// //   // ── Image handler ─────────────────────────────────────────────────────────
// //   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0];
// //     if (!file) return;

// //     const reader = new FileReader();
// //     reader.onload = (ev) => {
// //       const result = ev.target?.result as string;
// //       const base64 = result.split(",")[1];
// //       setPendingImage({ base64, mime: file.type, preview: result });
// //     };
// //     reader.readAsDataURL(file);
// //     e.target.value = "";
// //   };

// //   // ── Telegram send (used by both AI-auto-complete and the manual form) ────
// //   const sendWhatsApp = useCallback(async (
// //     l: LeadState,
// //     summary: string,
// //     isUpdate = false
// //   ) => {
// //     const fp = leadFp(l);
// //     if (!isUpdate && sendStatus !== "idle") return;
// //     if (isUpdate && fp === lastSentFp) return;
// //     try {
// //       const img = lastImageRef.current;
// //       const res = await fetch("/api/send-whatsapp", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           name: l.name || "Unknown",
// //           phone: l.phone || "Unknown",
// //           email: l.email,
// //           company: l.business,
// //           service: l.project || "Not specified",
// //           budget: l.budget,
// //           timeline: l.timeline,
// //           requirements: l.requirements,
// //           conversationSummary: summary,
// //           imageBase64: img?.base64,
// //           imageMime: img?.mime,
// //         }),
// //       });
// //       if (res.ok) {
// //         setSendStatus(isUpdate ? "updated" : "sent");
// //         setLastSentFp(fp);
// //         console.log("[WA] Sent successfully");
// //       } else {
// //         console.error("[WA] Failed:", await res.text());
// //       }
// //     } catch (e) { console.error("[WA] Error:", e); }
// //   }, [sendStatus, lastSentFp]);

// //   // ── AI call ───────────────────────────────────────────────────────────────
// //   const callAI = useCallback(async (
// //     userText: string,
// //     imageBase64?: string,
// //     imageMime?: string,
// //     attempt = 1
// //   ): Promise<string> => {
// //     conversationHistory.current.push({ role: "user", content: userText });
// //     try {
// //       const res = await fetch("/api/chat", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           messages: conversationHistory.current,
// //           imageBase64,
// //           imageMime,
// //         }),
// //         signal: AbortSignal.timeout(30000),
// //       });

// //       if (!res.ok) {
// //         conversationHistory.current.pop();
// //         if (res.status >= 500 && attempt === 1) {
// //           await new Promise(r => setTimeout(r, 1500));
// //           return callAI(userText, imageBase64, imageMime, 2);
// //         }
// //         throw new Error(`API ${res.status}`);
// //       }

// //       const data = await res.json();
// //       const rawText: string = data.text ?? "";
// //       const cleanText = rawText.replace(/\[LEAD_READY\]/g, "").replace(/\[LEAD_UPDATED\]/g, "").trim();

// //       conversationHistory.current.push({ role: "assistant", content: cleanText });

// //       const extracted = extractLeadFromConversation(conversationHistory.current);
// //       setLead(extracted);
// //       setRetryCount(0);

// //       const summary = conversationHistory.current
// //         .filter(m => m.role === "user").slice(-4).map(m => m.content).join(" | ");

// //       if (isLeadComplete(extracted)) {
// //         if (sendStatus === "idle") {
// //           sendWhatsApp(extracted, summary, false);
// //         } else if (leadFp(extracted) !== lastSentFp) {
// //           sendWhatsApp(extracted, summary, true);
// //         }
// //       }

// //       return cleanText;
// //     } catch (e) {
// //       conversationHistory.current.pop();
// //       throw e;
// //     }
// //   }, [sendStatus, lastSentFp, sendWhatsApp]);

// //   // ── Send message ──────────────────────────────────────────────────────────
// //   const handleSend = async (text?: string) => {
// //     const msg = (text ?? inputMessage).trim();
// //     if ((!msg && !pendingImage) || isTyping) return;

// //     const displayText = msg || "📎 Image share panniren";
// //     const imgToSend = pendingImage;

// //     // ✅ FIX: persist the latest image for the whole conversation, not just
// //     // this one message, so a later auto-send or manual form submit can
// //     // still attach it.
// //     if (imgToSend) {
// //       lastImageRef.current = { base64: imgToSend.base64, mime: imgToSend.mime };
// //     }

// //     setMessages(p => [...p, {
// //       id: Date.now(),
// //       text: displayText,
// //       sender: "user",
// //       time: getTime(),
// //       image: imgToSend?.preview,
// //     }]);
// //     setInputMessage("");
// //     setPendingImage(null);
// //     setIsTyping(true);

// //     try {
// //       const reply = await callAI(displayText, imgToSend?.base64, imgToSend?.mime);
// //       setMessages(p => [...p, { id: Date.now() + 1, text: reply, sender: "bot", time: getTime() }]);
// //     } catch {
// //       setRetryCount(c => c + 1);
// //       // ✅ NEW: AI failed (token exhausted / API down) — fall back to a
// //       // manual form instead of leaving the user stuck.
// //       setShowManualForm(true);
// //       const errMsg = "AI konjam busy irukku 🙏 Keela irukura short form fill pannunga — naan direct-a contact pannuren!";
// //       setMessages(p => [...p, { id: Date.now() + 1, text: errMsg, sender: "bot", time: getTime() }]);
// //     } finally {
// //       setIsTyping(false);
// //     }
// //   };

// //   // ── Manual form submit ────────────────────────────────────────────────────
// //   const handleManualChange = (field: keyof ManualFormData, value: string) => {
// //     setManualForm(prev => ({ ...prev, [field]: value }));
// //   };

// //   const handleManualSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!manualForm.name.trim() || !manualForm.phone.trim() || !manualForm.service.trim()) return;

// //     setManualSubmitting(true);
// //     try {
// //       const img = lastImageRef.current;
// //       const res = await fetch("/api/send-whatsapp", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           name: manualForm.name.trim(),
// //           phone: manualForm.phone.trim(),
// //           email: manualForm.email.trim() || undefined,
// //           service: manualForm.service.trim(),
// //           budget: manualForm.budget.trim() || undefined,
// //           timeline: manualForm.timeline.trim() || undefined,
// //           requirements: manualForm.requirements.trim() || undefined,
// //           conversationSummary: "📝 Manual form submission (AI fallback)",
// //           imageBase64: img?.base64,
// //           imageMime: img?.mime,
// //         }),
// //       });

// //       if (res.ok) {
// //         setSendStatus("sent");
// //         setLastSentFp(`${manualForm.name}|${manualForm.phone}|${manualForm.service}`.toLowerCase().trim());
// //         setShowManualForm(false);
// //         setMessages(p => [...p, {
// //           id: Date.now(),
// //           sender: "bot",
// //           time: getTime(),
// //           text: "Nandri! 🙏 Unga details kittiduchu. Naan soon-a contact pannuren!",
// //         }]);
// //       } else {
// //         console.error("[Manual Form] Failed:", await res.text());
// //         alert("Send aagala 😕 konjam nerathula try pannunga.");
// //       }
// //     } catch (err) {
// //       console.error("[Manual Form] Error:", err);
// //       alert("Network problem. Try again pannunga.");
// //     } finally {
// //       setManualSubmitting(false);
// //     }
// //   };

// //   const quickReplies = ["Website venum 🌐", "Logo design 🎨", "App venum 📱", "Branding 🎯", "Project discuss 💬"];

// //   return (
// //     <div className="min-h-screen flex flex-col" style={{ background: "#08090D" }}>

// //       {/* ── Background ── */}
// //       <div className="fixed inset-0 pointer-events-none overflow-hidden">
// //         <div style={{
// //           position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
// //           width: 900, height: 900,
// //           background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 60%)",
// //         }} />
// //         <div style={{
// //           position: "absolute", inset: 0,
// //           backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
// //           backgroundSize: "28px 28px",
// //         }} />
// //         <div style={{
// //           position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
// //           background: "linear-gradient(to top, #08090D, transparent)",
// //         }} />
// //       </div>

// //       {/* ── Header ── */}
// //       <header style={{
// //         position: "relative", zIndex: 10,
// //         display: "flex", alignItems: "center", justifyContent: "space-between",
// //         padding: "12px 20px",
// //         background: "rgba(8,9,13,0.85)",
// //         backdropFilter: "blur(24px)",
// //         borderBottom: "1px solid rgba(255,255,255,0.05)",
// //       }}>
// //         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
// //           <motion.button
// //             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
// //             onClick={() => router.back()}
// //             style={{
// //               width: 36, height: 36, borderRadius: 10,
// //               background: "rgba(255,255,255,0.04)",
// //               border: "1px solid rgba(255,255,255,0.07)",
// //               display: "flex", alignItems: "center", justifyContent: "center",
// //               color: "#64748B", cursor: "pointer",
// //             }}
// //           >
// //             <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
// //             </svg>
// //           </motion.button>

// //           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
// //             <div style={{ position: "relative", flexShrink: 0 }}>
// //               <Image src="/craft-code.png" alt="CraftCode" width={40} height={40}
// //                 style={{ borderRadius: 12, display: "block" }} />
// //               <motion.div
// //                 animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
// //                 transition={{ duration: 2, repeat: Infinity }}
// //                 style={{
// //                   position: "absolute", bottom: -1, right: -1,
// //                   width: 11, height: 11, borderRadius: "50%",
// //                   background: "#10B981", border: "2px solid #08090D",
// //                 }}
// //               />
// //             </div>
// //             <div>
// //               <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
// //                 <span style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>CraftCode</span>
// //                 <span style={{
// //                   fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
// //                   color: "#60A5FA", background: "rgba(96,165,250,0.1)",
// //                   border: "1px solid rgba(96,165,250,0.2)",
// //                   padding: "2px 7px", borderRadius: 20, textTransform: "uppercase",
// //                 }}>AI</span>
// //               </div>
// //               <span style={{ fontSize: 11, color: "#10B981", fontWeight: 500 }}>● Online • Ready to help</span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* ✅ CHANGE: removed the "LEAD" progress-dots badge — that internal
// //             tracking indicator should never be visible to the visitor.
// //             Kept only the "Enquiry Sent" confirmation + a small manual-form
// //             trigger so the user always has a way to reach you directly. */}
// //         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
// //           {!showManualForm && sendStatus === "idle" && (
// //             <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
// //               onClick={() => setShowManualForm(true)}
// //               style={{
// //                 display: "flex", alignItems: "center", gap: 6,
// //                 padding: "6px 12px", borderRadius: 20,
// //                 background: "rgba(255,255,255,0.03)",
// //                 border: "1px solid rgba(255,255,255,0.08)",
// //                 color: "#94A3B8", fontSize: 11, fontWeight: 600, cursor: "pointer",
// //               }}>
// //               📝 Form fill pannunga
// //             </motion.button>
// //           )}

// //           <AnimatePresence>
// //             {sendStatus !== "idle" && (
// //               <motion.div
// //                 initial={{ opacity: 0, x: 8, scale: 0.85 }} animate={{ opacity: 1, x: 0, scale: 1 }}
// //                 style={{
// //                   display: "flex", alignItems: "center", gap: 6,
// //                   padding: "5px 11px", borderRadius: 20,
// //                   background: "rgba(16,185,129,0.08)",
// //                   border: "1px solid rgba(16,185,129,0.2)",
// //                 }}>
// //                 <svg width="11" height="11" fill="#10B981" viewBox="0 0 24 24">
// //                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
// //                 </svg>
// //                 <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>
// //                   {sendStatus === "updated" ? "Updated" : "Enquiry Sent"}
// //                 </span>
// //               </motion.div>
// //             )}
// //           </AnimatePresence>

// //           <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
// //             onClick={() => router.push("/")}
// //             style={{
// //               padding: "7px 16px", borderRadius: 10,
// //               background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
// //               color: "#fff", fontSize: 13, fontWeight: 600,
// //               border: "none", cursor: "pointer",
// //               boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
// //             }}>
// //             Home
// //           </motion.button>
// //         </div>
// //       </header>

// //       {/* ── Messages ── */}
// //       <div style={{
// //         position: "relative", zIndex: 10, flex: 1,
// //         overflowY: "auto", padding: "20px 16px",
// //         maxWidth: 720, margin: "0 auto", width: "100%",
// //         display: "flex", flexDirection: "column",
// //       }}>
// //         <AnimatePresence initial={false}>
// //           {messages.map((msg) => {
// //             const isBot = msg.sender === "bot";
// //             return (
// //               <motion.div key={msg.id}
// //                 initial={{ opacity: 0, y: 10, scale: 0.97 }}
// //                 animate={{ opacity: 1, y: 0, scale: 1 }}
// //                 transition={{ duration: 0.2, ease: "easeOut" }}
// //                 style={{
// //                   display: "flex", flexDirection: isBot ? "row" : "row-reverse",
// //                   alignItems: "flex-end", gap: 10, marginBottom: 14,
// //                 }}>
// //                 <div style={{ flexShrink: 0, marginBottom: 20 }}>
// //                   {isBot ? (
// //                     <Image src="/craft-code.png" alt="CraftCode" width={30} height={30}
// //                       style={{ borderRadius: 8, display: "block" }} />
// //                   ) : (
// //                     <div style={{
// //                       width: 30, height: 30, borderRadius: 8,
// //                       background: "linear-gradient(135deg, #1E293B, #0F172A)",
// //                       border: "1px solid rgba(255,255,255,0.06)",
// //                       display: "flex", alignItems: "center", justifyContent: "center",
// //                     }}>
// //                       <svg width="13" height="13" fill="none" stroke="#475569" viewBox="0 0 24 24">
// //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
// //                       </svg>
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "72%" }}>
// //                   <div style={{
// //                     padding: "11px 15px",
// //                     borderRadius: isBot ? "3px 16px 16px 16px" : "16px 3px 16px 16px",
// //                     background: isBot ? "rgba(255,255,255,0.045)" : "linear-gradient(140deg, #2563EB 0%, #1E3A8A 100%)",
// //                     border: isBot ? "1px solid rgba(255,255,255,0.065)" : "none",
// //                     boxShadow: isBot ? "none" : "0 4px 18px rgba(37,99,235,0.28)",
// //                     backdropFilter: isBot ? "blur(12px)" : "none",
// //                   }}>
// //                     {msg.image && (
// //                       <div style={{ marginBottom: 8 }}>
// //                         <img src={msg.image} alt="uploaded"
// //                           style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, display: "block" }} />
// //                       </div>
// //                     )}
// //                     <p style={{
// //                       fontSize: 14, lineHeight: 1.65,
// //                       color: isBot ? "#CBD5E1" : "#fff",
// //                       whiteSpace: "pre-wrap", margin: 0,
// //                     }}>
// //                       {msg.text}
// //                     </p>
// //                   </div>

// //                   <div style={{
// //                     display: "flex", alignItems: "center", gap: 6,
// //                     justifyContent: isBot ? "flex-start" : "flex-end",
// //                     paddingLeft: isBot ? 2 : 0, paddingRight: isBot ? 0 : 2,
// //                   }}>
// //                     <span style={{ fontSize: 10, color: "#334155" }}>{msg.time}</span>
// //                     {isBot && (
// //                       <span style={{
// //                         fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
// //                         color: "#2563EB", background: "rgba(37,99,235,0.07)",
// //                         border: "1px solid rgba(37,99,235,0.14)",
// //                         padding: "1px 7px", borderRadius: 20,
// //                       }}>CraftCode AI</span>
// //                     )}
// //                     {!isBot && (
// //                       <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
// //                         <path d="M1 4L3.5 7L8 1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
// //                         <path d="M6 4L8.5 7L13 1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
// //                       </svg>
// //                     )}
// //                   </div>
// //                 </div>
// //               </motion.div>
// //             );
// //           })}
// //         </AnimatePresence>

// //         {/* Typing */}
// //         <AnimatePresence>
// //           {isTyping && (
// //             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
// //               style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
// //               <Image src="/craft-code.png" alt="CraftCode" width={30} height={30}
// //                 style={{ borderRadius: 8, flexShrink: 0, marginBottom: 20 }} />
// //               <div style={{
// //                 padding: "13px 17px", borderRadius: "3px 16px 16px 16px",
// //                 background: "rgba(255,255,255,0.045)",
// //                 border: "1px solid rgba(255,255,255,0.065)",
// //                 backdropFilter: "blur(12px)",
// //               }}>
// //                 <div style={{ display: "flex", gap: 5, alignItems: "center", height: 12 }}>
// //                   {[0, 0.16, 0.32].map((delay, i) => (
// //                     <motion.div key={i}
// //                       animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
// //                       transition={{ duration: 0.7, repeat: Infinity, delay }}
// //                       style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }}
// //                     />
// //                   ))}
// //                 </div>
// //               </div>
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         {/* ✅ NEW: Manual fallback form — appears as a card in the chat when
// //             the AI fails, or when the user taps "Form fill pannunga". User
// //             fills it and hits Send → goes straight to your Telegram, no AI
// //             involved. */}
// //         <AnimatePresence>
// //           {showManualForm && (
// //             <motion.div
// //               initial={{ opacity: 0, y: 10, scale: 0.97 }}
// //               animate={{ opacity: 1, y: 0, scale: 1 }}
// //               exit={{ opacity: 0, y: -6 }}
// //               style={{
// //                 marginTop: 6, marginBottom: 14,
// //                 padding: 16, borderRadius: 16,
// //                 background: "rgba(255,255,255,0.04)",
// //                 border: "1px solid rgba(37,99,235,0.25)",
// //                 backdropFilter: "blur(12px)",
// //               }}
// //             >
// //               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
// //                 <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>📝 Quick Enquiry Form</span>
// //                 <button type="button" onClick={() => setShowManualForm(false)}
// //                   style={{ background: "none", border: "none", color: "#475569", fontSize: 18, cursor: "pointer" }}>×</button>
// //               </div>

// //               <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
// //                 <input required placeholder="Peru *" value={manualForm.name}
// //                   onChange={(e) => handleManualChange("name", e.target.value)}
// //                   style={inputStyle} />
// //                 <input required placeholder="Phone number *" value={manualForm.phone}
// //                   onChange={(e) => handleManualChange("phone", e.target.value)}
// //                   style={inputStyle} />
// //                 <input placeholder="Email (optional)" value={manualForm.email}
// //                   onChange={(e) => handleManualChange("email", e.target.value)}
// //                   style={inputStyle} />
// //                 <select required value={manualForm.service}
// //                   onChange={(e) => handleManualChange("service", e.target.value)}
// //                   style={{ ...inputStyle, color: manualForm.service ? "#E2E8F0" : "#64748B" }}>
// //                   <option value="">Service venum? *</option>
// //                   <option value="Website">Website</option>
// //                   <option value="E-Commerce Website">E-Commerce Website</option>
// //                   <option value="Portfolio Website">Portfolio Website</option>
// //                   <option value="Logo Design">Logo Design</option>
// //                   <option value="Branding">Branding</option>
// //                   <option value="Mobile App">Mobile App</option>
// //                   <option value="Other">Other</option>
// //                 </select>
// //                 <input placeholder="Budget (optional)" value={manualForm.budget}
// //                   onChange={(e) => handleManualChange("budget", e.target.value)}
// //                   style={inputStyle} />
// //                 <input placeholder="Timeline (optional)" value={manualForm.timeline}
// //                   onChange={(e) => handleManualChange("timeline", e.target.value)}
// //                   style={inputStyle} />
// //                 <textarea placeholder="Requirements (optional)" value={manualForm.requirements}
// //                   onChange={(e) => handleManualChange("requirements", e.target.value)}
// //                   rows={2} style={{ ...inputStyle, resize: "vertical" as const }} />

// //                 {lastImageRef.current && (
// //                   <span style={{ fontSize: 11, color: "#60A5FA" }}>📎 Reference image attach aagum</span>
// //                 )}

// //                 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
// //                   type="submit" disabled={manualSubmitting}
// //                   style={{
// //                     marginTop: 4, padding: "11px 16px", borderRadius: 12,
// //                     background: manualSubmitting ? "rgba(37,99,235,0.35)" : "linear-gradient(135deg, #2563EB, #1D4ED8)",
// //                     color: "#fff", fontSize: 13, fontWeight: 700, border: "none",
// //                     cursor: manualSubmitting ? "not-allowed" : "pointer",
// //                   }}>
// //                   {manualSubmitting ? "Send agudhu..." : "Send to CraftCode 🚀"}
// //                 </motion.button>
// //               </form>
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         <div ref={messagesEndRef} />
// //       </div>

// //       {/* ── Input ── */}
// //       <div style={{
// //         position: "relative", zIndex: 10,
// //         borderTop: "1px solid rgba(255,255,255,0.05)",
// //         background: "rgba(8,9,13,0.9)",
// //         backdropFilter: "blur(24px)",
// //         padding: "12px 16px 16px",
// //       }}>
// //         {messages.length <= 2 && !showManualForm && (
// //           <div style={{ maxWidth: 720, margin: "0 auto 10px", display: "flex", flexWrap: "wrap", gap: 7 }}>
// //             {quickReplies.map((s) => (
// //               <motion.button key={s} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
// //                 onClick={() => handleSend(s)} disabled={isTyping}
// //                 style={{
// //                   padding: "6px 13px", borderRadius: 20,
// //                   background: "rgba(37,99,235,0.07)",
// //                   border: "1px solid rgba(37,99,235,0.18)",
// //                   color: "#93C5FD", fontSize: 12, fontWeight: 500,
// //                   cursor: "pointer", opacity: isTyping ? 0.3 : 1,
// //                 }}>
// //                 {s}
// //               </motion.button>
// //             ))}
// //           </div>
// //         )}

// //         <AnimatePresence>
// //           {pendingImage && (
// //             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
// //               style={{
// //                 maxWidth: 720, margin: "0 auto 10px",
// //                 display: "flex", alignItems: "center", gap: 10,
// //                 padding: "8px 12px", borderRadius: 12,
// //                 background: "rgba(37,99,235,0.08)",
// //                 border: "1px solid rgba(37,99,235,0.2)",
// //               }}>
// //               <img src={pendingImage.preview} alt="preview"
// //                 style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
// //               <span style={{ fontSize: 12, color: "#93C5FD", flex: 1 }}>Image ready to send 📸</span>
// //               <button onClick={() => setPendingImage(null)}
// //                 style={{
// //                   background: "none", border: "none", cursor: "pointer",
// //                   color: "#475569", fontSize: 18, lineHeight: 1,
// //                 }}>×</button>
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
// //           style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>

// //           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
// //             type="button"
// //             onClick={() => fileInputRef.current?.click()}
// //             style={{
// //               width: 46, height: 46, borderRadius: 13, flexShrink: 0,
// //               background: "rgba(255,255,255,0.04)",
// //               border: "1px solid rgba(255,255,255,0.08)",
// //               display: "flex", alignItems: "center", justifyContent: "center",
// //               cursor: "pointer", color: "#475569",
// //               transition: "all 0.2s",
// //             }}>
// //             <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
// //                 d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
// //             </svg>
// //           </motion.button>

// //           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect}
// //             style={{ display: "none" }} />

// //           <input ref={inputRef} type="text" value={inputMessage}
// //             onChange={(e) => setInputMessage(e.target.value)}
// //             placeholder="Enna venum? Type pannunga..."
// //             style={{
// //               flex: 1, padding: "12px 17px", borderRadius: 13,
// //               background: "rgba(255,255,255,0.04)",
// //               border: "1px solid rgba(255,255,255,0.08)",
// //               color: "#E2E8F0", fontSize: 14, outline: "none", transition: "border 0.2s",
// //             }}
// //             onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.45)")}
// //             onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
// //           />

// //           <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
// //             type="submit"
// //             disabled={(!inputMessage.trim() && !pendingImage) || isTyping}
// //             style={{
// //               padding: "12px 20px", borderRadius: 13,
// //               background: (!inputMessage.trim() && !pendingImage) || isTyping
// //                 ? "rgba(37,99,235,0.25)"
// //                 : "linear-gradient(135deg, #2563EB, #1D4ED8)",
// //               color: "#fff", fontSize: 14, fontWeight: 600,
// //               border: "none",
// //               cursor: (!inputMessage.trim() && !pendingImage) || isTyping ? "not-allowed" : "pointer",
// //               boxShadow: (!inputMessage.trim() && !pendingImage) || isTyping
// //                 ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
// //               display: "flex", alignItems: "center", gap: 8,
// //             }}>
// //             <span>Send</span>
// //             <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
// //             </svg>
// //           </motion.button>
// //         </form>

// //         <div style={{
// //           maxWidth: 720, margin: "10px auto 0",
// //           display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
// //         }}>
// //           <Image src="/craft-code.png" alt="" width={11} height={11}
// //             style={{ borderRadius: 3, opacity: 0.4 }} />
// //           <span style={{ fontSize: 10, color: "#1E293B", fontWeight: 500, letterSpacing: "0.05em" }}>
// //             Powered by CraftCode AI • Mr. Yaso
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // const inputStyle: React.CSSProperties = {
// //   padding: "10px 13px", borderRadius: 10,
// //   background: "rgba(255,255,255,0.05)",
// //   border: "1px solid rgba(255,255,255,0.09)",
// //   color: "#E2E8F0", fontSize: 13, outline: "none",
// //   fontFamily: "inherit",
// // };






// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";

// interface Message {
//   id: number;
//   text: string;
//   sender: "bot" | "user";
//   time: string;
//   image?: string; // base64 preview
// }

// interface LeadState {
//   name?: string;
//   phone?: string;
//   email?: string;
//   business?: string;
//   project?: string;
//   budget?: string;
//   timeline?: string;
//   requirements?: string;
// }

// interface ManualFormData {
//   name: string;
//   phone: string;
//   email: string;
//   service: string;
//   budget: string;
//   timeline: string;
//   requirements: string;
// }

// type SendStatus = "idle" | "sent" | "updated";

// // ✅ FIX: Indian mobile numbers only — 10 digits starting with 6-9.
// // Previously the phone field accepted literally any text, so leads could be
// // submitted with garbage / non-contactable numbers.
// const PHONE_REGEX = /^[6-9]\d{9}$/;

// function getTime() {
//   return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
// }

// function extractLeadFromConversation(history: { role: string; content: string }[]): LeadState {
//   const userMessages = history.filter((m) => m.role === "user").map((m) => m.content);
//   const fullText = userMessages.join(" ");
//   const lead: LeadState = {};

//   const phoneMatches = [...fullText.matchAll(/\b[6-9]\d{9}\b/g)];
//   if (phoneMatches.length) lead.phone = phoneMatches[phoneMatches.length - 1][0];

//   const emailMatches = [...fullText.matchAll(/[\w.-]+@[\w.-]+\.\w{2,}/g)];
//   if (emailMatches.length) lead.email = emailMatches[emailMatches.length - 1][0];

//   const namePatterns = [
//     /(?:my name is|i(?:'m| am)|naan|per|name is|name)\s+([A-Za-z][a-zA-Z]{1,20})/gi,
//     /(?:name\s*[:=]\s*)([A-Za-z ]{2,25})/gi,
//   ];
//   let lastNameMatch: { text: string; index: number } | null = null;
//   for (const pat of namePatterns) {
//     for (const m of fullText.matchAll(pat)) {
//       if (m[1] && (lastNameMatch === null || (m.index ?? 0) > lastNameMatch.index)) {
//         lastNameMatch = { text: m[1].trim(), index: m.index ?? 0 };
//       }
//     }
//   }
//   if (lastNameMatch) lead.name = lastNameMatch.text;

//   const budgetMatch =
//     fullText.match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\s*(?:k|thousand|lakh|l))?)/i) ||
//     fullText.match(/\b(\d{3,6})\s*(?:k|thousand|rupees|rs)\b/i);
//   if (budgetMatch) lead.budget = `₹${budgetMatch[1]}`;

//   const timelineMatch = fullText.match(/(\d+\s*(?:day|days|week|weeks|month|months)|asap|urgent|immediately|quick)/i);
//   if (timelineMatch) lead.timeline = timelineMatch[0];

//   const projectKeywords: Record<string, string> = {
//     "landing page": "Landing Page", "ecommerce": "E-Commerce Website",
//     "portfolio": "Portfolio Website", "business website": "Business Website",
//     "website": "Website", "logo": "Logo Design", "app": "Mobile App",
//     "dashboard": "Web Dashboard", "branding": "Branding", "seo": "SEO / Marketing",
//   };
//   const lower = fullText.toLowerCase();
//   for (const [kw, label] of Object.entries(projectKeywords)) {
//     if (lower.includes(kw)) { lead.project = label; break; }
//   }

//   return lead;
// }

// function isLeadComplete(lead: LeadState) {
//   return !!(lead.name && lead.phone && lead.project);
// }

// function leadFp(lead: LeadState) {
//   return `${lead.name}|${lead.phone}|${lead.project}`.toLowerCase().trim();
// }

// export default function BookProjectPage() {
//   const router = useRouter();

//   const [messages, setMessages] = useState<Message[]>([{
//     id: 1,
//     text: "👋 Vanakkam!\n\n enna venum? Sollunga, help pannuven! 😊",
//     sender: "bot",
//     time: getTime(),
//   }]);

//   const [inputMessage, setInputMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [lead, setLead] = useState<LeadState>({});
//   const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
//   const [lastSentFp, setLastSentFp] = useState("");
//   const [retryCount, setRetryCount] = useState(0);

//   const [showManualForm, setShowManualForm] = useState(false);
//   const [manualSubmitting, setManualSubmitting] = useState(false);
//   const [manualForm, setManualForm] = useState<ManualFormData>({
//     name: "", phone: "", email: "", service: "", budget: "", timeline: "", requirements: "",
//   });

//   // ✅ FIX: custom validation errors instead of the native browser
//   // "Please fill out this field" tooltip, which doesn't match the app's
//   // dark theme and looks broken/out of place inside the chat card.
//   const [formErrors, setFormErrors] = useState<Partial<Record<keyof ManualFormData, string>>>({});

//   // ✅ NEW: reference image attached directly inside the manual form
//   // (separate from the chat's pendingImage), so users who skip the chat
//   // entirely can still send a logo/reference image straight to Telegram.
//   const [manualImage, setManualImage] = useState<{ base64: string; mime: string; preview: string } | null>(null);
//   const manualFileInputRef = useRef<HTMLInputElement>(null);

//   // ✅ NEW: "Enquiry Sent" is now a transient toast instead of a fixed badge
//   // sitting in the header — it pops up briefly then disappears on its own,
//   // so it never permanently occupies header space or shifts other buttons.
//   const [showToast, setShowToast] = useState(false);
//   const [toastText, setToastText] = useState("Enquiry Sent 🚀");
//   const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const fireToast = useCallback((text: string) => {
//     setToastText(text);
//     setShowToast(true);
//     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//     toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
//   }, []);

//   useEffect(() => {
//     return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
//   }, []);

//   // Image upload state (for the currently-composed message)
//   const [pendingImage, setPendingImage] = useState<{ base64: string; mime: string; preview: string } | null>(null);

//   // Holds the MOST RECENTLY uploaded image for the entire conversation, so
//   // whichever turn ends up completing the lead (auto-complete, manual form,
//   // or a later AI [LEAD_COMPLETE]) can still attach it.
//   const lastImageRef = useRef<{ base64: string; mime: string } | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const conversationHistory = useRef<{ role: string; content: string }[]>([]);

//   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, showManualForm]);
//   useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

//   // Prefill the manual form with whatever the AI chat already extracted,
//   // so the user doesn't have to retype what they already told the bot.
//   useEffect(() => {
//     if (showManualForm) {
//       setFormErrors({});
//       setManualForm(prev => ({
//         name: prev.name || lead.name || "",
//         phone: prev.phone || lead.phone || "",
//         email: prev.email || lead.email || "",
//         service: prev.service || lead.project || "",
//         budget: prev.budget || lead.budget || "",
//         timeline: prev.timeline || lead.timeline || "",
//         requirements: prev.requirements || lead.requirements || "",
//       }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showManualForm]);

//   // ── Image handler ─────────────────────────────────────────────────────────
//   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const result = ev.target?.result as string;
//       const base64 = result.split(",")[1];
//       setPendingImage({ base64, mime: file.type, preview: result });
//     };
//     reader.readAsDataURL(file);
//     e.target.value = "";
//   };

//   // ✅ NEW: image upload inside the manual form. accept="image/*" already
//   // covers every image format (jpg, png, webp, gif, heic-where-supported,
//   // etc.) — the browser's file picker filters by MIME type, not extension.
//   const handleManualImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const result = ev.target?.result as string;
//       const base64 = result.split(",")[1];
//       const img = { base64, mime: file.type, preview: result };
//       setManualImage(img);
//       // Also feed it into the shared "last image" ref so it's available
//       // to the AI-chat completion path too, if the user later goes back
//       // to chatting instead of submitting this form.
//       lastImageRef.current = { base64, mime: file.type };
//     };
//     reader.readAsDataURL(file);
//     e.target.value = "";
//   };

//   // ── Telegram send (used by both AI-auto-complete and the manual form) ────
//   const sendWhatsApp = useCallback(async (
//     l: LeadState,
//     summary: string,
//     isUpdate = false
//   ) => {
//     const fp = leadFp(l);
//     if (!isUpdate && sendStatus !== "idle") return;
//     if (isUpdate && fp === lastSentFp) return;
//     try {
//       const img = lastImageRef.current;
//       const res = await fetch("/api/send-whatsapp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: l.name || "Unknown",
//           phone: l.phone || "Unknown",
//           email: l.email,
//           company: l.business,
//           service: l.project || "Not specified",
//           budget: l.budget,
//           timeline: l.timeline,
//           requirements: l.requirements,
//           conversationSummary: summary,
//           imageBase64: img?.base64,
//           imageMime: img?.mime,
//         }),
//       });
//       if (res.ok) {
//         setSendStatus(isUpdate ? "updated" : "sent");
//         setLastSentFp(fp);
//         fireToast(isUpdate ? "Enquiry Updated" : "Enquiry Sent");
//         console.log("[WA] Sent successfully");
//       } else {
//         console.error("[WA] Failed:", await res.text());
//       }
//     } catch (e) { console.error("[WA] Error:", e); }
//   }, [sendStatus, lastSentFp, fireToast]);

//   // ── AI call ───────────────────────────────────────────────────────────────
//   const callAI = useCallback(async (
//     userText: string,
//     imageBase64?: string,
//     imageMime?: string,
//     attempt = 1
//   ): Promise<string> => {
//     conversationHistory.current.push({ role: "user", content: userText });

//     // ✅ FIX: always resend the latest known reference image (not just the
//     // image attached to *this* message). Previously, if the user uploaded a
//     // logo reference early and only finished giving name/phone a few
//     // messages later, the image was long gone from the payload by the time
//     // the backend decided the lead was complete — so Telegram only ever saw
//     // "Reference Logo: Yes" with no actual picture. Sending the latest image
//     // on every turn lets /api/chat forward the real photo whenever it fires.
//     const imgToUse = imageBase64 && imageMime
//       ? { base64: imageBase64, mime: imageMime }
//       : lastImageRef.current;

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           messages: conversationHistory.current,
//           imageBase64: imgToUse?.base64,
//           imageMime: imgToUse?.mime,
//         }),
//         signal: AbortSignal.timeout(30000),
//       });

//       if (!res.ok) {
//         conversationHistory.current.pop();
//         if (res.status >= 500 && attempt === 1) {
//           await new Promise(r => setTimeout(r, 1500));
//           return callAI(userText, imageBase64, imageMime, 2);
//         }
//         throw new Error(`API ${res.status}`);
//       }

//       const data = await res.json();
//       const rawText: string = data.text ?? "";
//       const cleanText = rawText.replace(/\[LEAD_READY\]/g, "").replace(/\[LEAD_UPDATED\]/g, "").trim();

//       conversationHistory.current.push({ role: "assistant", content: cleanText });

//       const extracted = extractLeadFromConversation(conversationHistory.current);
//       setLead(extracted);
//       setRetryCount(0);

//       const summary = conversationHistory.current
//         .filter(m => m.role === "user").slice(-4).map(m => m.content).join(" | ");

//       if (isLeadComplete(extracted)) {
//         if (sendStatus === "idle") {
//           sendWhatsApp(extracted, summary, false);
//         } else if (leadFp(extracted) !== lastSentFp) {
//           sendWhatsApp(extracted, summary, true);
//         }
//       }

//       return cleanText;
//     } catch (e) {
//       conversationHistory.current.pop();
//       throw e;
//     }
//   }, [sendStatus, lastSentFp, sendWhatsApp]);

//   // ── Send message ──────────────────────────────────────────────────────────
//   const handleSend = async (text?: string) => {
//     const msg = (text ?? inputMessage).trim();
//     if ((!msg && !pendingImage) || isTyping) return;

//     const displayText = msg || "📎 Image share panniren";
//     const imgToSend = pendingImage;

//     if (imgToSend) {
//       lastImageRef.current = { base64: imgToSend.base64, mime: imgToSend.mime };
//     }

//     setMessages(p => [...p, {
//       id: Date.now(),
//       text: displayText,
//       sender: "user",
//       time: getTime(),
//       image: imgToSend?.preview,
//     }]);
//     setInputMessage("");
//     setPendingImage(null);
//     setIsTyping(true);

//     try {
//       const reply = await callAI(displayText, imgToSend?.base64, imgToSend?.mime);
//       setMessages(p => [...p, { id: Date.now() + 1, text: reply, sender: "bot", time: getTime() }]);
//     } catch {
//       setRetryCount(c => c + 1);
//       setShowManualForm(true);
//       const errMsg = "AI konjam busy ahh irukku 🙏, short form ( fast book ) fill pannunga —  direct-a contact pannuvanga!";
//       setMessages(p => [...p, { id: Date.now() + 1, text: errMsg, sender: "bot", time: getTime() }]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // ── Manual form ────────────────────────────────────────────────────────────
//   const handleManualChange = (field: keyof ManualFormData, value: string) => {
//     setManualForm(prev => ({ ...prev, [field]: value }));
//     // Clear that field's error as soon as the user edits it, instead of
//     // leaving a stale error message on screen.
//     if (formErrors[field]) {
//       setFormErrors(prev => ({ ...prev, [field]: undefined }));
//     }
//   };

//   // ✅ FIX: replaces native `required`/browser-tooltip validation with
//   // inline, brand-styled error messages. Also validates the phone number
//   // format instead of accepting anything typed in that field.
//   const validateManualForm = (): boolean => {
//     const errors: Partial<Record<keyof ManualFormData, string>> = {};

//     if (!manualForm.name.trim()) {
//       errors.name = "Peru podunga";
//     }

//     const cleanedPhone = manualForm.phone.replace(/\D/g, "");
//     if (!cleanedPhone) {
//       errors.phone = "Phone number podunga";
//     } else if (!PHONE_REGEX.test(cleanedPhone)) {
//       errors.phone = "Correct-a 10 digit mobile number podunga (6-9-la start aganum)";
//     }

//     if (!manualForm.service.trim()) {
//       errors.service = "Enna service venumnu select pannunga";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleManualSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateManualForm()) return;

//     const cleanedPhone = manualForm.phone.replace(/\D/g, "");

//     setManualSubmitting(true);
//     try {
//       // Prefer an image attached directly in this form; fall back to
//       // whatever was last shared in the chat, if any.
//       const img = manualImage || lastImageRef.current;
//       const res = await fetch("/api/send-whatsapp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: manualForm.name.trim(),
//           phone: cleanedPhone,
//           email: manualForm.email.trim() || undefined,
//           service: manualForm.service.trim(),
//           budget: manualForm.budget.trim() || undefined,
//           timeline: manualForm.timeline.trim() || undefined,
//           requirements: manualForm.requirements.trim() || undefined,
//           conversationSummary: "📝 Manual form submission (AI fallback)",
//           imageBase64: img?.base64,
//           imageMime: img?.mime,
//         }),
//       });

//       if (res.ok) {
//         setSendStatus("sent");
//         setLastSentFp(`${manualForm.name}|${cleanedPhone}|${manualForm.service}`.toLowerCase().trim());
//         setShowManualForm(false);
//         fireToast("Enquiry Sent ");
//         setMessages(p => [...p, {
//           id: Date.now(),
//           sender: "bot",
//           time: getTime(),
//           text: "Nandri! 🙏 Unga details kittiduchu. Naan soon-a contact pannuren!",
//         }]);
//         // Reset the form (and its image) for next time — the trigger
//         // button in the header stays available so anyone can submit again.
//         setManualForm({ name: "", phone: "", email: "", service: "", budget: "", timeline: "", requirements: "" });
//         setFormErrors({});
//         setManualImage(null);
//       } else {
//         console.error("[Manual Form] Failed:", await res.text());
//         setFormErrors({ name: undefined, phone: "Send aagala 😕 konjam nerathula try pannunga." });
//       }
//     } catch (err) {
//       console.error("[Manual Form] Error:", err);
//       setFormErrors({ phone: "Network problem. Try again pannunga." });
//     } finally {
//       setManualSubmitting(false);
//     }
//   };

//   const quickReplies = ["Website", "Logo design", "App", "Branding", "Project discuss"];

//   return (
//     <div className="min-h-screen flex flex-col" style={{ background: "#08090D" }}>

//       {/* ── Background ── */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div style={{
//           position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
//           width: 900, height: 900,
//           background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 60%)",
//         }} />
//         <div style={{
//           position: "absolute", inset: 0,
//           backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
//           backgroundSize: "28px 28px",
//         }} />
//         <div style={{
//           position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
//           background: "linear-gradient(to top, #08090D, transparent)",
//         }} />
//       </div>

//       {/* ── Header ── */}
//       <header style={{
//         position: "relative", zIndex: 10,
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//         padding: "12px 20px",
//         background: "rgba(8,9,13,0.85)",
//         backdropFilter: "blur(24px)",
//         borderBottom: "1px solid rgba(255,255,255,0.05)",
//       }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <motion.button
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//             onClick={() => router.back()}
//             style={{
//               width: 36, height: 36, borderRadius: 10,
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.07)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               color: "#64748B", cursor: "pointer",
//             }}
//           >
//             <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//             </svg>
//           </motion.button>

//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ position: "relative", flexShrink: 0 }}>
//               <Image src="/craft-code.png" alt="CraftCode" width={40} height={40}
//                 style={{ borderRadius: 12, display: "block" }} />
//               <motion.div
//                 animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//                 style={{
//                   position: "absolute", bottom: -1, right: -1,
//                   width: 11, height: 11, borderRadius: "50%",
//                   background: "#10B981", border: "2px solid #08090D",
//                 }}
//               />
//             </div>
//            <div
//   style={{
//     display: "flex",
//     flexDirection: "column",
//     gap: 1, // 👈 reduce/increase this
//   }}
// >
//   <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//     <span style={{ color: "#F1F5F9", fontWeight: 800, fontSize: 14, letterSpacing: "-0.3px" }}>
//       CraftCode
//     </span>

//     <span
//       style={{
//         fontSize: 9,
//         fontWeight: 800,
//         letterSpacing: "0.1em",
//         color: "#60A5FA",
//         background: "rgba(96,165,250,0.1)",
//         border: "1px solid rgba(96,165,250,0.2)",
//         padding: "2px 5px",
//         borderRadius: 20,
//         textTransform: "uppercase",
//       }}
//     >
//       AI
//     </span>
//   </div>

//   <span
//     style={{
//       fontSize: 11,
//       color: "#10B981",
//       fontWeight: 500,
//       marginTop: -2, // 👈 Online mela varum
//     }}
//   >
//     Online
//   </span>
// </div>
//           </div>
//         </div>

//         {/* ✅ FIX: renamed from "Form fill pannunga" to a brand-matched
//             "Fast Book" button, sized identically to the Home button (same
//             padding/font-size/radius). It always shows (as long as the form
//             isn't already open) so people can submit more than once. The
//             old "Enquiry Sent" badge no longer lives here — it's now a
//             transient toast rendered below the header instead. */}
//         {/* ✅ FIX: "Fast Book" was too wide/tall for mobile (no breathing
//             room next to Home) and had a "glassy" two-tone gradient + tinted
//             border. Simplified to a flat, compact button — same solid-color
//             approach as Home, just a secondary shade — sized to actually fit
//             the header on small screens. */}
//         <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
//           {!showManualForm && (
//             <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//               onClick={() => setShowManualForm(true)}
//               style={{
//                 padding: "6px 14px", borderRadius: 9,
//                 background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
//                 color: "#fff", fontSize: 12, fontWeight: 600,
//                 border: "none", cursor: "pointer",
//                 boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
//                 whiteSpace: "nowrap", flexShrink: 0,
//               }}>
//               Fast Book
//             </motion.button>
//           )}
//         </div>
//       </header>

//       {/* ✅ NEW: "Enquiry Sent" toast — floats centered near the top of the
//           screen and auto-dismisses after 3 seconds, so it never sits fixed
//           in the header pushing buttons around, and never stays visible
//           indefinitely. */}
//       <div style={{
//         position: "fixed", top: 74, left: 0, right: 0,
//         display: "flex", justifyContent: "center",
//         zIndex: 50, pointerEvents: "none",
//       }}>
//         <AnimatePresence>
//           {showToast && (
//             <motion.div
//               initial={{ opacity: 0, y: -12, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -12, scale: 0.9 }}
//               transition={{ duration: 0.25, ease: "easeOut" }}
//               style={{
//                 display: "flex", alignItems: "center", gap: 8,
//                 padding: "9px 18px", borderRadius: 30,
//                 background: "rgba(16,185,129,0.12)",
//                 border: "1px solid rgba(16,185,129,0.3)",
//                 backdropFilter: "blur(16px)",
//                 boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
//               }}>
//               <svg width="13" height="13" fill="#10B981" viewBox="0 0 24 24">
//                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
//               </svg>
//               <span style={{ fontSize: 12.5, color: "#10B981", fontWeight: 700 }}>{toastText}</span>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* ── Messages ── */}
//       <div style={{
//         position: "relative", zIndex: 10, flex: 1,
//         overflowY: "auto", padding: "20px 16px",
//         maxWidth: 720, margin: "0 auto", width: "100%",
//         display: "flex", flexDirection: "column",
//       }}>
//         <AnimatePresence initial={false}>
//           {messages.map((msg) => {
//             const isBot = msg.sender === "bot";
//             return (
//               <motion.div key={msg.id}
//                 initial={{ opacity: 0, y: 10, scale: 0.97 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 transition={{ duration: 0.2, ease: "easeOut" }}
//                 style={{
//                   display: "flex", flexDirection: isBot ? "row" : "row-reverse",
//                   alignItems: "flex-end", gap: 10, marginBottom: 14,
//                 }}>
//                 <div style={{ flexShrink: 0, marginBottom: 20 }}>
//                   {isBot ? (
//                     <Image src="/craft-code.png" alt="CraftCode" width={30} height={30}
//                       style={{ borderRadius: 8, display: "block" }} />
//                   ) : (
//                     <div style={{
//                       width: 30, height: 30, borderRadius: 8,
//                       background: "linear-gradient(135deg, #1E293B, #0F172A)",
//                       border: "1px solid rgba(255,255,255,0.06)",
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                     }}>
//                       <svg width="13" height="13" fill="none" stroke="#475569" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "72%" }}>
//                   <div style={{
//                     padding: "11px 15px",
//                     borderRadius: isBot ? "3px 16px 16px 16px" : "16px 3px 16px 16px",
//                     background: isBot ? "rgba(255,255,255,0.045)" : "linear-gradient(140deg, #2563EB 0%, #1E3A8A 100%)",
//                     border: isBot ? "1px solid rgba(255,255,255,0.065)" : "none",
//                     boxShadow: isBot ? "none" : "0 4px 18px rgba(37,99,235,0.28)",
//                     backdropFilter: isBot ? "blur(12px)" : "none",
//                   }}>
//                     {msg.image && (
//                       <div style={{ marginBottom: 8 }}>
//                         <img src={msg.image} alt="uploaded"
//                           style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, display: "block" }} />
//                       </div>
//                     )}
//                     <p style={{
//                       fontSize: 14, lineHeight: 1.65,
//                       color: isBot ? "#CBD5E1" : "#fff",
//                       whiteSpace: "pre-wrap", margin: 0,
//                     }}>
//                       {msg.text}
//                     </p>
//                   </div>

//                   <div style={{
//                     display: "flex", alignItems: "center", gap: 6,
//                     justifyContent: isBot ? "flex-start" : "flex-end",
//                     paddingLeft: isBot ? 2 : 0, paddingRight: isBot ? 0 : 2,
//                   }}>
//                     <span style={{ fontSize: 10, color: "#334155" }}>{msg.time}</span>
//                     {isBot && (
//                       <span style={{
//                         fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
//                         color: "#2563EB", background: "rgba(37,99,235,0.07)",
//                         border: "1px solid rgba(37,99,235,0.14)",
//                         padding: "1px 7px", borderRadius: 20,
//                       }}>CraftCode AI</span>
//                     )}
//                     {!isBot && (
//                       <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
//                         <path d="M1 4L3.5 7L8 1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                         <path d="M6 4L8.5 7L13 1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>

//         {/* Typing */}
//         <AnimatePresence>
//           {isTyping && (
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//               style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
//               <Image src="/craft-code.png" alt="CraftCode" width={30} height={30}
//                 style={{ borderRadius: 8, flexShrink: 0, marginBottom: 20 }} />
//               <div style={{
//                 padding: "13px 17px", borderRadius: "3px 16px 16px 16px",
//                 background: "rgba(255,255,255,0.045)",
//                 border: "1px solid rgba(255,255,255,0.065)",
//                 backdropFilter: "blur(12px)",
//               }}>
//                 <div style={{ display: "flex", gap: 5, alignItems: "center", height: 12 }}>
//                   {[0, 0.16, 0.32].map((delay, i) => (
//                     <motion.div key={i}
//                       animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
//                       transition={{ duration: 0.7, repeat: Infinity, delay }}
//                       style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Manual fallback form */}
//         <AnimatePresence>
//           {showManualForm && (
//             <motion.div
//               initial={{ opacity: 0, y: 10, scale: 0.97 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -6 }}
//               style={{
//                 marginTop: 6, marginBottom: 14,
//                 padding: 16, borderRadius: 16,
//                 background: "rgba(255,255,255,0.04)",
//                 border: "1px solid rgba(37,99,235,0.25)",
//                 backdropFilter: "blur(12px)",
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
//                 <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>📝 Quick Enquiry Form</span>
//                 <button type="button" onClick={() => setShowManualForm(false)}
//                   style={{ background: "none", border: "none", color: "#475569", fontSize: 18, cursor: "pointer" }}>×</button>
//               </div>

//               {/* noValidate: we do our own validation below so the browser's
//                   native "Please fill out this field" tooltip never appears. */}
//               <form onSubmit={handleManualSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                 <div>
//                   <input placeholder="Peru *" value={manualForm.name}
//                     onChange={(e) => handleManualChange("name", e.target.value)}
//                     style={{ ...inputStyle, ...(formErrors.name ? errorBorder : {}) }} />
//                   {formErrors.name && <span style={errorTextStyle}>{formErrors.name}</span>}
//                 </div>

//                 <div>
//                   <input placeholder="Phone number *" value={manualForm.phone}
//                     inputMode="numeric"
//                     onChange={(e) => handleManualChange("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
//                     style={{ ...inputStyle, ...(formErrors.phone ? errorBorder : {}) }} />
//                   {formErrors.phone && <span style={errorTextStyle}>{formErrors.phone}</span>}
//                 </div>

//                 <input placeholder="Email (optional)" value={manualForm.email}
//                   onChange={(e) => handleManualChange("email", e.target.value)}
//                   style={inputStyle} />

//                 <div>
//                   {/* ✅ FIX: dark-themed <option>s so the dropdown list no
//                       longer renders as a jarring white box that clashes with
//                       the rest of the UI. */}
//                   <select value={manualForm.service}
//                     onChange={(e) => handleManualChange("service", e.target.value)}
//                     style={{
//                       ...inputStyle,
//                       ...selectStyle,
//                       ...(formErrors.service ? errorBorder : {}),
//                       color: manualForm.service ? "#E2E8F0" : "#64748B",
//                     }}>
//                     <option value="" style={optionStyle}>Service venum? *</option>
//                     <option value="Website" style={optionStyle}>Website</option>
//                     <option value="E-Commerce Website" style={optionStyle}>E-Commerce Website</option>
//                     <option value="Portfolio Website" style={optionStyle}>Portfolio Website</option>
//                     <option value="Logo Design" style={optionStyle}>Logo Design</option>
//                     <option value="Branding" style={optionStyle}>Branding</option>
//                     <option value="Mobile App" style={optionStyle}>Mobile App</option>
//                     <option value="Other" style={optionStyle}>Other</option>
//                   </select>
//                   {formErrors.service && <span style={errorTextStyle}>{formErrors.service}</span>}
//                 </div>

//                 <input placeholder="Budget (optional)" value={manualForm.budget}
//                   onChange={(e) => handleManualChange("budget", e.target.value)}
//                   style={inputStyle} />
//                 <input placeholder="Timeline (optional)" value={manualForm.timeline}
//                   onChange={(e) => handleManualChange("timeline", e.target.value)}
//                   style={inputStyle} />
//                 <textarea placeholder="Requirements (optional)" value={manualForm.requirements}
//                   onChange={(e) => handleManualChange("requirements", e.target.value)}
//                   rows={2} style={{ ...inputStyle, resize: "vertical" as const }} />

//                 {/* ✅ NEW: reference image upload directly inside the manual
//                     form (same as the chat), so users who go straight to
//                     "Fast Book" without chatting can still attach a logo /
//                     reference picture that reaches Telegram as a real photo. */}
//                 <div>
//                   {!manualImage ? (
//                     <button type="button"
//                       onClick={() => manualFileInputRef.current?.click()}
//                       style={{
//                         display: "flex", alignItems: "center", gap: 8,
//                         width: "100%", padding: "10px 13px", borderRadius: 10,
//                         background: "rgba(255,255,255,0.03)",
//                         border: "1px dashed rgba(255,255,255,0.18)",
//                         color: "#94A3B8", fontSize: 12.5, fontWeight: 500,
//                         cursor: "pointer", fontFamily: "inherit",
//                       }}>
//                       📎 Reference image add pannunga (optional)
//                     </button>
//                   ) : (
//                     <div style={{
//                       display: "flex", alignItems: "center", gap: 10,
//                       padding: "8px 10px", borderRadius: 10,
//                       background: "rgba(37,99,235,0.08)",
//                       border: "1px solid rgba(37,99,235,0.2)",
//                     }}>
//                       <img src={manualImage.preview} alt="reference preview"
//                         style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
//                       <span style={{ fontSize: 11.5, color: "#93C5FD", flex: 1 }}>Reference image ready 📸</span>
//                       <button type="button" onClick={() => setManualImage(null)}
//                         style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 17, lineHeight: 1 }}>×</button>
//                     </div>
//                   )}
//                   <input ref={manualFileInputRef} type="file" accept="image/*"
//                     onChange={handleManualImageSelect} style={{ display: "none" }} />
//                 </div>

//                 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//                   type="submit" disabled={manualSubmitting}
//                   style={{
//                     marginTop: 4, padding: "11px 16px", borderRadius: 12,
//                     background: manualSubmitting ? "rgba(37,99,235,0.35)" : "linear-gradient(135deg, #2563EB, #1D4ED8)",
//                     color: "#fff", fontSize: 13, fontWeight: 700, border: "none",
//                     cursor: manualSubmitting ? "not-allowed" : "pointer",
//                   }}>
//                   {manualSubmitting ? "Send agudhu..." : "Send to CraftCode"}
//                 </motion.button>
//               </form>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div ref={messagesEndRef} />
//       </div>

//       {/* ── Input ── */}
//       <div style={{
//         position: "relative", zIndex: 10,
//         borderTop: "1px solid rgba(255,255,255,0.05)",
//         background: "rgba(8,9,13,0.9)",
//         backdropFilter: "blur(24px)",
//         padding: "12px 16px 16px",
//       }}>
//         {messages.length <= 2 && !showManualForm && (
//           <div style={{ maxWidth: 720, margin: "0 auto 10px", display: "flex", flexWrap: "wrap", gap: 7 }}>
//             {quickReplies.map((s) => (
//               <motion.button key={s} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
//                 onClick={() => handleSend(s)} disabled={isTyping}
//                 style={{
//                   padding: "6px 13px", borderRadius: 20,
//                   background: "rgba(37,99,235,0.07)",
//                   border: "1px solid rgba(37,99,235,0.18)",
//                   color: "#93C5FD", fontSize: 12, fontWeight: 500,
//                   cursor: "pointer", opacity: isTyping ? 0.3 : 1,
//                 }}>
//                 {s}
//               </motion.button>
//             ))}
//           </div>
//         )}

//         <AnimatePresence>
//           {pendingImage && (
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//               style={{
//                 maxWidth: 720, margin: "0 auto 10px",
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "8px 12px", borderRadius: 12,
//                 background: "rgba(37,99,235,0.08)",
//                 border: "1px solid rgba(37,99,235,0.2)",
//               }}>
//               <img src={pendingImage.preview} alt="preview"
//                 style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
//               <span style={{ fontSize: 12, color: "#93C5FD", flex: 1 }}>Image ready to send 📸</span>
//               <button onClick={() => setPendingImage(null)}
//                 style={{
//                   background: "none", border: "none", cursor: "pointer",
//                   color: "#475569", fontSize: 18, lineHeight: 1,
//                 }}>×</button>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
//           style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>

//           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             style={{
//               width: 46, height: 46, borderRadius: 13, flexShrink: 0,
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               cursor: "pointer", color: "#475569",
//               transition: "all 0.2s",
//             }}>
//             <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                 d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </motion.button>

//           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect}
//             style={{ display: "none" }} />

//           <input ref={inputRef} type="text" value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             placeholder="Enna venum? Type pannunga..."
//             style={{
//               flex: 1, padding: "12px 17px", borderRadius: 13,
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.08)",
//               color: "#E2E8F0", fontSize: 14, outline: "none", transition: "border 0.2s",
//             }}
//             onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.45)")}
//             onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
//           />

//           <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
//             type="submit"
//             disabled={(!inputMessage.trim() && !pendingImage) || isTyping}
//             style={{
//               padding: "12px 20px", borderRadius: 13,
//               background: (!inputMessage.trim() && !pendingImage) || isTyping
//                 ? "rgba(37,99,235,0.25)"
//                 : "linear-gradient(135deg, #2563EB, #1D4ED8)",
//               color: "#fff", fontSize: 14, fontWeight: 600,
//               border: "none",
//               cursor: (!inputMessage.trim() && !pendingImage) || isTyping ? "not-allowed" : "pointer",
//               boxShadow: (!inputMessage.trim() && !pendingImage) || isTyping
//                 ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
//               display: "flex", alignItems: "center", gap: 8,
//             }}>
//             <span>Send</span>
//             <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//             </svg>
//           </motion.button>
//         </form>

//         <div style={{
//           maxWidth: 720, margin: "10px auto 0",
//           display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
//         }}>
//           <Image src="/craft-code.png" alt="" width={11} height={11}
//             style={{ borderRadius: 3, opacity: 0.4 }} />
//           <span style={{ fontSize: 10, color: "#1E293B", fontWeight: 500, letterSpacing: "0.05em" }}>
//             Powered by CraftCode AI • Mr. Yaso
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// const inputStyle: React.CSSProperties = {
//   padding: "10px 13px", borderRadius: 10,
//   background: "rgba(255,255,255,0.05)",
//   border: "1px solid rgba(255,255,255,0.09)",
//   color: "#E2E8F0", fontSize: 13, outline: "none",
//   fontFamily: "inherit",
//   width: "100%",
//   boxSizing: "border-box" as const,
// };

// // ✅ FIX: gives the <select> element and its <option>s an explicit dark
// // background/text color. Browsers render the dropdown's OPEN list using
// // the OS/browser's own popup styling by default (which is why it showed up
// // white) — setting these colors explicitly gets it much closer to the rest
// // of the dark UI in Chromium-based browsers.
// const selectStyle: React.CSSProperties = {
//   backgroundColor: "#0F1115",
//   appearance: "none" as const,
// };

// const optionStyle: React.CSSProperties = {
//   backgroundColor: "#0F1115",
//   color: "#E2E8F0",
// };

// const errorBorder: React.CSSProperties = {
//   borderColor: "#EF4444",
// };

// const errorTextStyle: React.CSSProperties = {
//   display: "block",
//   marginTop: 4,
//   fontSize: 11,
//   color: "#F87171",
// };
















"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
  image?: string; // base64 preview
}

interface LeadState {
  name?: string;
  phone?: string;
  email?: string;
  business?: string;
  project?: string;
  budget?: string;
  timeline?: string;
  requirements?: string;
}

interface ManualFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  budget: string;
  timeline: string;
  requirements: string;
}

type SendStatus = "idle" | "sent" | "updated";

// ✅ FIX: Indian mobile numbers only — 10 digits starting with 6-9.
// Previously the phone field accepted literally any text, so leads could be
// submitted with garbage / non-contactable numbers.
const PHONE_REGEX = /^[6-9]\d{9}$/;

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function extractLeadFromConversation(history: { role: string; content: string }[]): LeadState {
  const userMessages = history.filter((m) => m.role === "user").map((m) => m.content);
  const fullText = userMessages.join(" ");
  const lead: LeadState = {};

  const phoneMatches = [...fullText.matchAll(/\b[6-9]\d{9}\b/g)];
  if (phoneMatches.length) lead.phone = phoneMatches[phoneMatches.length - 1][0];

  const emailMatches = [...fullText.matchAll(/[\w.-]+@[\w.-]+\.\w{2,}/g)];
  if (emailMatches.length) lead.email = emailMatches[emailMatches.length - 1][0];

  const namePatterns = [
    /(?:my name is|i(?:'m| am)|naan|per|name is|name)\s+([A-Za-z][a-zA-Z]{1,20})/gi,
    /(?:name\s*[:=]\s*)([A-Za-z ]{2,25})/gi,
  ];
  let lastNameMatch: { text: string; index: number } | null = null;
  for (const pat of namePatterns) {
    for (const m of fullText.matchAll(pat)) {
      if (m[1] && (lastNameMatch === null || (m.index ?? 0) > lastNameMatch.index)) {
        lastNameMatch = { text: m[1].trim(), index: m.index ?? 0 };
      }
    }
  }
  if (lastNameMatch) lead.name = lastNameMatch.text;

  const budgetMatch =
    fullText.match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\s*(?:k|thousand|lakh|l))?)/i) ||
    fullText.match(/\b(\d{3,6})\s*(?:k|thousand|rupees|rs)\b/i);
  if (budgetMatch) lead.budget = `₹${budgetMatch[1]}`;

  const timelineMatch = fullText.match(/(\d+\s*(?:day|days|week|weeks|month|months)|asap|urgent|immediately|quick)/i);
  if (timelineMatch) lead.timeline = timelineMatch[0];

  const projectKeywords: Record<string, string> = {
    "landing page": "Landing Page", "ecommerce": "E-Commerce Website",
    "portfolio": "Portfolio Website", "business website": "Business Website",
    "website": "Website", "logo": "Logo Design", "app": "Mobile App",
    "dashboard": "Web Dashboard", "branding": "Branding", "seo": "SEO / Marketing",
  };
  const lower = fullText.toLowerCase();
  for (const [kw, label] of Object.entries(projectKeywords)) {
    if (lower.includes(kw)) { lead.project = label; break; }
  }

  return lead;
}

function isLeadComplete(lead: LeadState) {
  return !!(lead.name && lead.phone && lead.project);
}

function leadFp(lead: LeadState) {
  return `${lead.name}|${lead.phone}|${lead.project}`.toLowerCase().trim();
}

export default function BookProjectPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "👋 Vanakkam!\n\n enna venum? Sollunga, help pannuven! 😊",
    sender: "bot",
    time: getTime(),
  }]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lead, setLead] = useState<LeadState>({});
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [lastSentFp, setLastSentFp] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState<ManualFormData>({
    name: "", phone: "", email: "", service: "", budget: "", timeline: "", requirements: "",
  });

  // ✅ FIX: custom validation errors instead of the native browser
  // "Please fill out this field" tooltip, which doesn't match the app's
  // dark theme and looks broken/out of place inside the chat card.
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ManualFormData, string>>>({});

  // ✅ NEW: reference image attached directly inside the manual form
  // (separate from the chat's pendingImage), so users who skip the chat
  // entirely can still send a logo/reference image straight to Telegram.
  const [manualImage, setManualImage] = useState<{ base64: string; mime: string; preview: string } | null>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  // ✅ NEW: "Enquiry Sent" is now a transient toast instead of a fixed badge
  // sitting in the header — it pops up briefly then disappears on its own,
  // so it never permanently occupies header space or shifts other buttons.
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("Enquiry Sent 🚀");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireToast = useCallback((text: string) => {
    setToastText(text);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
  }, []);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  // Image upload state (for the currently-composed message)
  const [pendingImage, setPendingImage] = useState<{ base64: string; mime: string; preview: string } | null>(null);

  // Holds the MOST RECENTLY uploaded image for the entire conversation, so
  // whichever turn ends up completing the lead (auto-complete, manual form,
  // or a later AI [LEAD_COMPLETE]) can still attach it.
  const lastImageRef = useRef<{ base64: string; mime: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, showManualForm]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  // Prefill the manual form with whatever the AI chat already extracted,
  // so the user doesn't have to retype what they already told the bot.
  useEffect(() => {
    if (showManualForm) {
      setFormErrors({});
      setManualForm(prev => ({
        name: prev.name || lead.name || "",
        phone: prev.phone || lead.phone || "",
        email: prev.email || lead.email || "",
        service: prev.service || lead.project || "",
        budget: prev.budget || lead.budget || "",
        timeline: prev.timeline || lead.timeline || "",
        requirements: prev.requirements || lead.requirements || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showManualForm]);

  // ── Image handler ─────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      setPendingImage({ base64, mime: file.type, preview: result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ✅ NEW: image upload inside the manual form. accept="image/*" already
  // covers every image format (jpg, png, webp, gif, heic-where-supported,
  // etc.) — the browser's file picker filters by MIME type, not extension.
  const handleManualImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      const img = { base64, mime: file.type, preview: result };
      setManualImage(img);
      // Also feed it into the shared "last image" ref so it's available
      // to the AI-chat completion path too, if the user later goes back
      // to chatting instead of submitting this form.
      lastImageRef.current = { base64, mime: file.type };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Telegram send (used by both AI-auto-complete and the manual form) ────
  const sendWhatsApp = useCallback(async (
    l: LeadState,
    summary: string,
    isUpdate = false
  ) => {
    const fp = leadFp(l);
    if (!isUpdate && sendStatus !== "idle") return;
    if (isUpdate && fp === lastSentFp) return;
    try {
      const img = lastImageRef.current;
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: l.name || "Unknown",
          phone: l.phone || "Unknown",
          email: l.email,
          company: l.business,
          service: l.project || "Not specified",
          budget: l.budget,
          timeline: l.timeline,
          requirements: l.requirements,
          conversationSummary: summary,
          imageBase64: img?.base64,
          imageMime: img?.mime,
        }),
      });
      if (res.ok) {
        setSendStatus(isUpdate ? "updated" : "sent");
        setLastSentFp(fp);
        fireToast(isUpdate ? "Enquiry Updated" : "Enquiry Sent");
        console.log("[WA] Sent successfully");
      } else {
        console.error("[WA] Failed:", await res.text());
      }
    } catch (e) { console.error("[WA] Error:", e); }
  }, [sendStatus, lastSentFp, fireToast]);

  // ── AI call ───────────────────────────────────────────────────────────────
  const callAI = useCallback(async (
    userText: string,
    imageBase64?: string,
    imageMime?: string,
    attempt = 1
  ): Promise<string> => {
    conversationHistory.current.push({ role: "user", content: userText });

    // ✅ FIX: always resend the latest known reference image (not just the
    // image attached to *this* message). Previously, if the user uploaded a
    // logo reference early and only finished giving name/phone a few
    // messages later, the image was long gone from the payload by the time
    // the backend decided the lead was complete — so Telegram only ever saw
    // "Reference Logo: Yes" with no actual picture. Sending the latest image
    // on every turn lets /api/chat forward the real photo whenever it fires.
    const imgToUse = imageBase64 && imageMime
      ? { base64: imageBase64, mime: imageMime }
      : lastImageRef.current;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory.current,
          imageBase64: imgToUse?.base64,
          imageMime: imgToUse?.mime,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        conversationHistory.current.pop();
        if (res.status >= 500 && attempt === 1) {
          await new Promise(r => setTimeout(r, 1500));
          return callAI(userText, imageBase64, imageMime, 2);
        }
        throw new Error(`API ${res.status}`);
      }

      const data = await res.json();
      const rawText: string = data.text ?? "";
      const cleanText = rawText.replace(/\[LEAD_READY\]/g, "").replace(/\[LEAD_UPDATED\]/g, "").trim();

      conversationHistory.current.push({ role: "assistant", content: cleanText });

      const extracted = extractLeadFromConversation(conversationHistory.current);
      setLead(extracted);
      setRetryCount(0);

      const summary = conversationHistory.current
        .filter(m => m.role === "user").slice(-4).map(m => m.content).join(" | ");

      if (isLeadComplete(extracted)) {
        if (sendStatus === "idle") {
          sendWhatsApp(extracted, summary, false);
        } else if (leadFp(extracted) !== lastSentFp) {
          sendWhatsApp(extracted, summary, true);
        }
      }

      return cleanText;
    } catch (e) {
      conversationHistory.current.pop();
      throw e;
    }
  }, [sendStatus, lastSentFp, sendWhatsApp]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (text?: string) => {
    const msg = (text ?? inputMessage).trim();
    if ((!msg && !pendingImage) || isTyping) return;

    const displayText = msg || "📎 Image share panniren";
    const imgToSend = pendingImage;

    if (imgToSend) {
      lastImageRef.current = { base64: imgToSend.base64, mime: imgToSend.mime };
    }

    setMessages(p => [...p, {
      id: Date.now(),
      text: displayText,
      sender: "user",
      time: getTime(),
      image: imgToSend?.preview,
    }]);
    setInputMessage("");
    setPendingImage(null);
    setIsTyping(true);

    try {
      const reply = await callAI(displayText, imgToSend?.base64, imgToSend?.mime);
      setMessages(p => [...p, { id: Date.now() + 1, text: reply, sender: "bot", time: getTime() }]);
    } catch {
      setRetryCount(c => c + 1);
      setShowManualForm(true);
      const errMsg = "AI konjam busy ahh irukku 🙏, short form ( fast book ) fill pannunga —  direct-a contact pannuvanga!";
      setMessages(p => [...p, { id: Date.now() + 1, text: errMsg, sender: "bot", time: getTime() }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Manual form ────────────────────────────────────────────────────────────
  const handleManualChange = (field: keyof ManualFormData, value: string) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
    // Clear that field's error as soon as the user edits it, instead of
    // leaving a stale error message on screen.
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ✅ FIX: replaces native `required`/browser-tooltip validation with
  // inline, brand-styled error messages. Also validates the phone number
  // format instead of accepting anything typed in that field.
  const validateManualForm = (): boolean => {
    const errors: Partial<Record<keyof ManualFormData, string>> = {};

    if (!manualForm.name.trim()) {
      errors.name = "Peru podunga";
    }

    const cleanedPhone = manualForm.phone.replace(/\D/g, "");
    if (!cleanedPhone) {
      errors.phone = "Phone number podunga";
    } else if (!PHONE_REGEX.test(cleanedPhone)) {
      errors.phone = "Correct-a 10 digit mobile number podunga (6-9-la start aganum)";
    }

    if (!manualForm.service.trim()) {
      errors.service = "Enna service venumnu select pannunga";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateManualForm()) return;

    const cleanedPhone = manualForm.phone.replace(/\D/g, "");

    setManualSubmitting(true);
    try {
      // Prefer an image attached directly in this form; fall back to
      // whatever was last shared in the chat, if any.
      const img = manualImage || lastImageRef.current;
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualForm.name.trim(),
          phone: cleanedPhone,
          email: manualForm.email.trim() || undefined,
          service: manualForm.service.trim(),
          budget: manualForm.budget.trim() || undefined,
          timeline: manualForm.timeline.trim() || undefined,
          requirements: manualForm.requirements.trim() || undefined,
          conversationSummary: "📝 Manual form submission (AI fallback)",
          imageBase64: img?.base64,
          imageMime: img?.mime,
        }),
      });

      if (res.ok) {
        setSendStatus("sent");
        setLastSentFp(`${manualForm.name}|${cleanedPhone}|${manualForm.service}`.toLowerCase().trim());
        setShowManualForm(false);
        fireToast("Enquiry Sent ");
        setMessages(p => [...p, {
          id: Date.now(),
          sender: "bot",
          time: getTime(),
          text: "Nandri! 🙏 Unga details kittiduchu. Naan soon-a contact pannuren!",
        }]);
        // Reset the form (and its image) for next time — the trigger
        // button in the header stays available so anyone can submit again.
        setManualForm({ name: "", phone: "", email: "", service: "", budget: "", timeline: "", requirements: "" });
        setFormErrors({});
        setManualImage(null);
      } else {
        console.error("[Manual Form] Failed:", await res.text());
        setFormErrors({ name: undefined, phone: "Send aagala 😕 konjam nerathula try pannunga." });
      }
    } catch (err) {
      console.error("[Manual Form] Error:", err);
      setFormErrors({ phone: "Network problem. Try again pannunga." });
    } finally {
      setManualSubmitting(false);
    }
  };

  const quickReplies = ["Website", "Logo design", "App", "Branding", "Project discuss"];

  return (
    // ✅ FIX (mobile scroll): changed from `min-h-screen` (which grows with
    // content and lets the WHOLE page scroll) to a fixed viewport height
    // (`h-screen` fallback + `h-dvh` for mobile browsers that account for
    // the address bar) with `overflow-hidden`. Now the header and the
    // input bar below simply sit in normal flow at fixed positions, and
    // ONLY the messages div in the middle (flex:1 + overflow-y:auto)
    // scrolls — exactly like WhatsApp. Nothing else in the page changed.
    <div className="flex flex-col h-screen h-dvh overflow-hidden" style={{ background: "#08090D" }}>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 900, height: 900,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
          background: "linear-gradient(to top, #08090D, transparent)",
        }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(8,9,13,0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748B", cursor: "pointer",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </motion.button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Image src="/craft-code.png" alt="CraftCode" width={40} height={40}
                style={{ borderRadius: 12, display: "block" }} />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "absolute", bottom: -1, right: -1,
                  width: 11, height: 11, borderRadius: "50%",
                  background: "#10B981", border: "2px solid #08090D",
                }}
              />
            </div>
           <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 1, // 👈 reduce/increase this
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ color: "#F1F5F9", fontWeight: 800, fontSize: 14, letterSpacing: "-0.3px" }}>
      CraftCode
    </span>

    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.1em",
        color: "#60A5FA",
        background: "rgba(96,165,250,0.1)",
        border: "1px solid rgba(96,165,250,0.2)",
        padding: "2px 5px",
        borderRadius: 20,
        textTransform: "uppercase",
      }}
    >
      AI
    </span>
  </div>

  <span
    style={{
      fontSize: 11,
      color: "#10B981",
      fontWeight: 500,
      marginTop: -2, // 👈 Online mela varum
    }}
  >
    Online
  </span>
</div>
          </div>
        </div>

        {/* ✅ FIX: renamed from "Form fill pannunga" to a brand-matched
            "Fast Book" button, sized identically to the Home button (same
            padding/font-size/radius). It always shows (as long as the form
            isn't already open) so people can submit more than once. The
            old "Enquiry Sent" badge no longer lives here — it's now a
            transient toast rendered below the header instead. */}
        {/* ✅ FIX: "Fast Book" was too wide/tall for mobile (no breathing
            room next to Home) and had a "glassy" two-tone gradient + tinted
            border. Simplified to a flat, compact button — same solid-color
            approach as Home, just a secondary shade — sized to actually fit
            the header on small screens. */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {!showManualForm && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowManualForm(true)}
              style={{
                padding: "6px 14px", borderRadius: 9,
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                color: "#fff", fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
              Fast Book
            </motion.button>
          )}
        </div>
      </header>

      {/* ✅ NEW: "Enquiry Sent" toast — floats centered near the top of the
          screen and auto-dismisses after 3 seconds, so it never sits fixed
          in the header pushing buttons around, and never stays visible
          indefinitely. */}
      <div style={{
        position: "fixed", top: 74, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        zIndex: 50, pointerEvents: "none",
      }}>
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 30,
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}>
              <svg width="13" height="13" fill="#10B981" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span style={{ fontSize: 12.5, color: "#10B981", fontWeight: 700 }}>{toastText}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Messages ── */}
      <div style={{
        position: "relative", zIndex: 10, flex: 1,
        overflowY: "auto", padding: "20px 16px",
        maxWidth: 720, margin: "0 auto", width: "100%",
        display: "flex", flexDirection: "column",
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  display: "flex", flexDirection: isBot ? "row" : "row-reverse",
                  alignItems: "flex-end", gap: 10, marginBottom: 14,
                }}>
                <div style={{ flexShrink: 0, marginBottom: 20 }}>
                  {isBot ? (
                    <Image src="/craft-code.png" alt="CraftCode" width={30} height={30}
                      style={{ borderRadius: 8, display: "block" }} />
                  ) : (
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: "linear-gradient(135deg, #1E293B, #0F172A)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="13" height="13" fill="none" stroke="#475569" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "72%" }}>
                  <div style={{
                    padding: "11px 15px",
                    borderRadius: isBot ? "3px 16px 16px 16px" : "16px 3px 16px 16px",
                    background: isBot ? "rgba(255,255,255,0.045)" : "linear-gradient(140deg, #2563EB 0%, #1E3A8A 100%)",
                    border: isBot ? "1px solid rgba(255,255,255,0.065)" : "none",
                    boxShadow: isBot ? "none" : "0 4px 18px rgba(37,99,235,0.28)",
                    backdropFilter: isBot ? "blur(12px)" : "none",
                  }}>
                    {msg.image && (
                      <div style={{ marginBottom: 8 }}>
                        <img src={msg.image} alt="uploaded"
                          style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, display: "block" }} />
                      </div>
                    )}
                    <p style={{
                      fontSize: 14, lineHeight: 1.65,
                      color: isBot ? "#CBD5E1" : "#fff",
                      whiteSpace: "pre-wrap", margin: 0,
                    }}>
                      {msg.text}
                    </p>
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    justifyContent: isBot ? "flex-start" : "flex-end",
                    paddingLeft: isBot ? 2 : 0, paddingRight: isBot ? 0 : 2,
                  }}>
                    <span style={{ fontSize: 10, color: "#334155" }}>{msg.time}</span>
                    {isBot && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                        color: "#2563EB", background: "rgba(37,99,235,0.07)",
                        border: "1px solid rgba(37,99,235,0.14)",
                        padding: "1px 7px", borderRadius: 20,
                      }}>CraftCode AI</span>
                    )}
                    {!isBot && (
                      <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                        <path d="M1 4L3.5 7L8 1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 4L8.5 7L13 1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing */}
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
              <Image src="/craft-code.png" alt="CraftCode" width={30} height={30}
                style={{ borderRadius: 8, flexShrink: 0, marginBottom: 20 }} />
              <div style={{
                padding: "13px 17px", borderRadius: "3px 16px 16px 16px",
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.065)",
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center", height: 12 }}>
                  {[0, 0.16, 0.32].map((delay, i) => (
                    <motion.div key={i}
                      animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual fallback form */}
        <AnimatePresence>
          {showManualForm && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                marginTop: 6, marginBottom: 14,
                padding: 16, borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(37,99,235,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>📝 Quick Enquiry Form</span>
                <button type="button" onClick={() => setShowManualForm(false)}
                  style={{ background: "none", border: "none", color: "#475569", fontSize: 18, cursor: "pointer" }}>×</button>
              </div>

              {/* noValidate: we do our own validation below so the browser's
                  native "Please fill out this field" tooltip never appears. */}
              <form onSubmit={handleManualSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <input placeholder="Peru *" value={manualForm.name}
                    onChange={(e) => handleManualChange("name", e.target.value)}
                    style={{ ...inputStyle, ...(formErrors.name ? errorBorder : {}) }} />
                  {formErrors.name && <span style={errorTextStyle}>{formErrors.name}</span>}
                </div>

                <div>
                  <input placeholder="Phone number *" value={manualForm.phone}
                    inputMode="numeric"
                    onChange={(e) => handleManualChange("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                    style={{ ...inputStyle, ...(formErrors.phone ? errorBorder : {}) }} />
                  {formErrors.phone && <span style={errorTextStyle}>{formErrors.phone}</span>}
                </div>

                <input placeholder="Email (optional)" value={manualForm.email}
                  onChange={(e) => handleManualChange("email", e.target.value)}
                  style={inputStyle} />

                <div>
                  {/* ✅ FIX: dark-themed <option>s so the dropdown list no
                      longer renders as a jarring white box that clashes with
                      the rest of the UI. */}
                  <select value={manualForm.service}
                    onChange={(e) => handleManualChange("service", e.target.value)}
                    style={{
                      ...inputStyle,
                      ...selectStyle,
                      ...(formErrors.service ? errorBorder : {}),
                      color: manualForm.service ? "#E2E8F0" : "#64748B",
                    }}>
                    <option value="" style={optionStyle}>Service venum? *</option>
                    <option value="Website" style={optionStyle}>Website</option>
                    <option value="E-Commerce Website" style={optionStyle}>E-Commerce Website</option>
                    <option value="Portfolio Website" style={optionStyle}>Portfolio Website</option>
                    <option value="Logo Design" style={optionStyle}>Logo Design</option>
                    <option value="Branding" style={optionStyle}>Branding</option>
                    <option value="Mobile App" style={optionStyle}>Mobile App</option>
                    <option value="Other" style={optionStyle}>Other</option>
                  </select>
                  {formErrors.service && <span style={errorTextStyle}>{formErrors.service}</span>}
                </div>

                <input placeholder="Budget (optional)" value={manualForm.budget}
                  onChange={(e) => handleManualChange("budget", e.target.value)}
                  style={inputStyle} />
                <input placeholder="Timeline (optional)" value={manualForm.timeline}
                  onChange={(e) => handleManualChange("timeline", e.target.value)}
                  style={inputStyle} />
                <textarea placeholder="Requirements (optional)" value={manualForm.requirements}
                  onChange={(e) => handleManualChange("requirements", e.target.value)}
                  rows={2} style={{ ...inputStyle, resize: "vertical" as const }} />

                {/* ✅ NEW: reference image upload directly inside the manual
                    form (same as the chat), so users who go straight to
                    "Fast Book" without chatting can still attach a logo /
                    reference picture that reaches Telegram as a real photo. */}
                <div>
                  {!manualImage ? (
                    <button type="button"
                      onClick={() => manualFileInputRef.current?.click()}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "10px 13px", borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px dashed rgba(255,255,255,0.18)",
                        color: "#94A3B8", fontSize: 12.5, fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                      📎 Reference image add pannunga (optional)
                    </button>
                  ) : (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 10,
                      background: "rgba(37,99,235,0.08)",
                      border: "1px solid rgba(37,99,235,0.2)",
                    }}>
                      <img src={manualImage.preview} alt="reference preview"
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                      <span style={{ fontSize: 11.5, color: "#93C5FD", flex: 1 }}>Reference image ready 📸</span>
                      <button type="button" onClick={() => setManualImage(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 17, lineHeight: 1 }}>×</button>
                    </div>
                  )}
                  <input ref={manualFileInputRef} type="file" accept="image/*"
                    onChange={handleManualImageSelect} style={{ display: "none" }} />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={manualSubmitting}
                  style={{
                    marginTop: 4, padding: "11px 16px", borderRadius: 12,
                    background: manualSubmitting ? "rgba(37,99,235,0.35)" : "linear-gradient(135deg, #2563EB, #1D4ED8)",
                    color: "#fff", fontSize: 13, fontWeight: 700, border: "none",
                    cursor: manualSubmitting ? "not-allowed" : "pointer",
                  }}>
                  {manualSubmitting ? "Send agudhu..." : "Send to CraftCode"}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,9,13,0.9)",
        backdropFilter: "blur(24px)",
        padding: "12px 16px 16px",
      }}>
        {messages.length <= 2 && !showManualForm && (
          <div style={{ maxWidth: 720, margin: "0 auto 10px", display: "flex", flexWrap: "wrap", gap: 7 }}>
            {quickReplies.map((s) => (
              <motion.button key={s} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleSend(s)} disabled={isTyping}
                style={{
                  padding: "6px 13px", borderRadius: 20,
                  background: "rgba(37,99,235,0.07)",
                  border: "1px solid rgba(37,99,235,0.18)",
                  color: "#93C5FD", fontSize: 12, fontWeight: 500,
                  cursor: "pointer", opacity: isTyping ? 0.3 : 1,
                }}>
                {s}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {pendingImage && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                maxWidth: 720, margin: "0 auto 10px",
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 12,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}>
              <img src={pendingImage.preview} alt="preview"
                style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
              <span style={{ fontSize: 12, color: "#93C5FD", flex: 1 }}>Image ready to send 📸</span>
              <button onClick={() => setPendingImage(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#475569", fontSize: 18, lineHeight: 1,
                }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#475569",
              transition: "all 0.2s",
            }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.button>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect}
            style={{ display: "none" }} />

          <input ref={inputRef} type="text" value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enna venum? Type pannunga..."
            style={{
              flex: 1, padding: "12px 17px", borderRadius: 13,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E2E8F0", fontSize: 14, outline: "none", transition: "border 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.45)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />

          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={(!inputMessage.trim() && !pendingImage) || isTyping}
            style={{
              padding: "12px 20px", borderRadius: 13,
              background: (!inputMessage.trim() && !pendingImage) || isTyping
                ? "rgba(37,99,235,0.25)"
                : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "#fff", fontSize: 14, fontWeight: 600,
              border: "none",
              cursor: (!inputMessage.trim() && !pendingImage) || isTyping ? "not-allowed" : "pointer",
              boxShadow: (!inputMessage.trim() && !pendingImage) || isTyping
                ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
            <span>Send</span>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </form>

        <div style={{
          maxWidth: 720, margin: "10px auto 0",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Image src="/craft-code.png" alt="" width={11} height={11}
            style={{ borderRadius: 3, opacity: 0.4 }} />
          <span style={{ fontSize: 10, color: "#1E293B", fontWeight: 500, letterSpacing: "0.05em" }}>
            Powered by CraftCode AI • Mr. Yaso
          </span>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 13px", borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#E2E8F0", fontSize: 13, outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box" as const,
};

// ✅ FIX: gives the <select> element and its <option>s an explicit dark
// background/text color. Browsers render the dropdown's OPEN list using
// the OS/browser's own popup styling by default (which is why it showed up
// white) — setting these colors explicitly gets it much closer to the rest
// of the dark UI in Chromium-based browsers.
const selectStyle: React.CSSProperties = {
  backgroundColor: "#0F1115",
  appearance: "none" as const,
};

const optionStyle: React.CSSProperties = {
  backgroundColor: "#0F1115",
  color: "#E2E8F0",
};

const errorBorder: React.CSSProperties = {
  borderColor: "#EF4444",
};

const errorTextStyle: React.CSSProperties = {
  display: "block",
  marginTop: 4,
  fontSize: 11,
  color: "#F87171",
};