// import { NextRequest, NextResponse } from "next/server";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface LeadPayload {
//   // Basic
//   name: string;
//   phone: string;
//   email?: string;
//   company?: string;
//   brandName?: string;
//   service: string;
//   // Branding specific
//   logoExists?: string;
//   needLogoRedesign?: string;
//   needLogoDesign?: string;
//   preferredColors?: string;
//   brandStyle?: string;
//   logoType?: string;
//   slogan?: string;
//   brandStrategy?: string;
//   // Website specific
//   websiteType?: string;
//   currentWebsite?: string;
//   pagesNeeded?: string;
//   featuresNeeded?: string;
//   paymentGateway?: string;
//   bookingSystem?: string;
//   adminPanel?: string;
//   languages?: string;
//   // Portfolio specific
//   portfolioType?: string;
//   services?: string;
//   needCMS?: string;
//   needAnimations?: string;
//   needSEO?: string;
//   needHosting?: string;
//   // Common
//   budget?: string;
//   timeline?: string;
//   requirements?: string;
//   conversationSummary?: string;
//   // ✅ FIX: these were being sent by the frontend but never declared here,
//   // so they were silently ignored and the image never reached Telegram.
//   imageBase64?: string;
//   imageMime?: string;
// }

// // ─── In-memory dedup (per serverless instance) ────────────────────────────────
// const sentFingerprints = new Set<string>();
// const pendingQueue: LeadPayload[] = [];
// let isProcessing = false;

// function buildFingerprint(p: LeadPayload): string {
//   return `${p.name}|${p.phone}|${p.service}`.toLowerCase().trim();
// }

// function val(v?: string) {
//   return v && v !== "" ? v : "—";
// }

// function buildMessage(p: LeadPayload): string {
//   const time = new Date().toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     dateStyle: "medium",
//     timeStyle: "short",
//   });

//   const lines: string[] = [
//     `🔥 *New Project Enquiry — CraftCode*`,
//     ``,
//     `👤 *Name:* ${val(p.name)}`,
//     `📱 *Phone:* ${val(p.phone)}`,
//     p.email ? `📧 *Email:* ${val(p.email)}` : "",
//     p.company ? `🏢 *Company:* ${val(p.company)}` : "",
//     p.brandName ? `🏷 *Brand Name:* ${val(p.brandName)}` : "",
//     `💼 *Service:* ${val(p.service)}`,
//     ``,
//   ];

//   // Service-specific fields
//   const service = p.service?.toLowerCase() || "";

//   if (service.includes("brand") || service.includes("logo")) {
//     lines.push(
//       `🎨 *Logo Exists:* ${val(p.logoExists)}`,
//       p.needLogoRedesign ? `🔄 *Logo Redesign:* ${val(p.needLogoRedesign)}` : "",
//       p.needLogoDesign ? `✏️ *Need Logo Design:* ${val(p.needLogoDesign)}` : "",
//       p.preferredColors ? `🎨 *Colors:* ${val(p.preferredColors)}` : "",
//       p.brandStyle ? `💎 *Brand Style:* ${val(p.brandStyle)}` : "",
//       p.logoType ? `🖋 *Logo Type:* ${val(p.logoType)}` : "",
//       p.slogan ? `📝 *Slogan:* ${val(p.slogan)}` : "",
//       p.brandStrategy ? `🧠 *Brand Strategy:* ${val(p.brandStrategy)}` : "",
//       ``,
//     );
//   }

//   if (service.includes("website") || service.includes("ecommerce") || service.includes("e-commerce")) {
//     lines.push(
//       p.websiteType ? `🌐 *Website Type:* ${val(p.websiteType)}` : "",
//       p.currentWebsite ? `🔗 *Current Website:* ${val(p.currentWebsite)}` : "",
//       p.pagesNeeded ? `📄 *Pages:* ${val(p.pagesNeeded)}` : "",
//       p.featuresNeeded ? `⚙️ *Features:* ${val(p.featuresNeeded)}` : "",
//       p.paymentGateway ? `💳 *Payment Gateway:* ${val(p.paymentGateway)}` : "",
//       p.bookingSystem ? `📅 *Booking System:* ${val(p.bookingSystem)}` : "",
//       p.adminPanel ? `🖥 *Admin Panel:* ${val(p.adminPanel)}` : "",
//       p.languages ? `🌍 *Languages:* ${val(p.languages)}` : "",
//       ``,
//     );
//   }

//   if (service.includes("portfolio")) {
//     lines.push(
//       p.portfolioType ? `👤 *Portfolio Type:* ${val(p.portfolioType)}` : "",
//       p.services ? `🛠 *Services Listed:* ${val(p.services)}` : "",
//       p.needCMS ? `📝 *CMS:* ${val(p.needCMS)}` : "",
//       p.adminPanel ? `🖥 *Admin Panel:* ${val(p.adminPanel)}` : "",
//       p.needAnimations ? `✨ *Animations:* ${val(p.needAnimations)}` : "",
//       p.needSEO ? `🔍 *SEO:* ${val(p.needSEO)}` : "",
//       p.needHosting ? `☁️ *Hosting:* ${val(p.needHosting)}` : "",
//       ``,
//     );
//   }

//   lines.push(
//     `💰 *Budget:* ${val(p.budget)}`,
//     `📅 *Timeline:* ${val(p.timeline)}`,
//     `📋 *Requirements:* ${val(p.requirements)}`,
//     ``,
//     `🤖 *AI Summary:*`,
//     val(p.conversationSummary),
//     ``,
//     `🕒 *Time:* ${time}`,
//     ``,
//     `━━━━━━━━━━━━━━━━━━━━━━`,
//     `🤖 CraftCode AI Assistant`,
//   );

//   return lines.filter(l => l !== "").join("\n");
// }

// async function sendToTelegram(message: string): Promise<void> {
//   const token = process.env.TELEGRAM_BOT_TOKEN!;
//   const chatId = process.env.TELEGRAM_CHAT_ID!;

//   if (!token || !chatId) {
//     throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env.local");
//   }

//   const url = `https://api.telegram.org/bot${token}/sendMessage`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       chat_id: chatId,
//       text: message,
//       parse_mode: "Markdown",
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Telegram API error ${res.status}: ${err}`);
//   }
// }

// /**
//  * ✅ NEW: send the customer's reference image to Telegram using sendPhoto.
//  * Telegram's sendPhoto endpoint needs multipart/form-data (it doesn't accept
//  * base64 inside a JSON body), so we decode the base64 string back into a
//  * Buffer/Blob and upload it as a file.
//  *
//  * Caption is kept short — Telegram limits photo captions to 1024 characters,
//  * so we don't reuse the full lead message here (that's already sent as a
//  * separate text message beforehand).
//  */
// async function sendPhotoToTelegram(
//   imageBase64: string,
//   imageMime: string,
//   captionName: string
// ): Promise<void> {
//   const token = process.env.TELEGRAM_BOT_TOKEN!;
//   const chatId = process.env.TELEGRAM_CHAT_ID!;

//   if (!token || !chatId) {
//     throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env.local");
//   }

//   const buffer = Buffer.from(imageBase64, "base64");
//   const ext = imageMime.split("/")[1] || "jpg";

//   const formData = new FormData();
//   formData.append("chat_id", chatId);
//   formData.append("caption", `📎 Reference image from ${captionName}`);
//   formData.append("photo", new Blob([new Uint8Array(buffer)], { type: imageMime }), `reference.${ext}`);

//   const url = `https://api.telegram.org/bot${token}/sendPhoto`;
//   const res = await fetch(url, {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Telegram sendPhoto error ${res.status}: ${err}`);
//   }
// }

// async function processQueue(): Promise<void> {
//   if (isProcessing || pendingQueue.length === 0) return;
//   isProcessing = true;

//   while (pendingQueue.length > 0) {
//     const payload = pendingQueue.shift()!;
//     const fp = buildFingerprint(payload);

//     if (sentFingerprints.has(fp)) {
//       console.log(`[Telegram] Duplicate skipped: ${fp}`);
//       continue;
//     }

//     const message = buildMessage(payload);

//     let sent = false;
//     for (let attempt = 1; attempt <= 2; attempt++) {
//       try {
//         await sendToTelegram(message);
//         sentFingerprints.add(fp);
//         console.log(`[Telegram] ✅ Text sent (attempt ${attempt}): ${fp}`);
//         sent = true;
//         break;
//       } catch (err) {
//         console.error(`[Telegram] Attempt ${attempt} failed:`, err);
//         if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
//       }
//     }

//     // ✅ FIX: after the text message succeeds, also forward the image (if any)
//     // as a separate photo message. This is what was missing before — the
//     // image data was accepted by the API but never actually sent to Telegram.
//     if (sent && payload.imageBase64 && payload.imageMime) {
//       try {
//         await sendPhotoToTelegram(payload.imageBase64, payload.imageMime, payload.name || "customer");
//         console.log(`[Telegram] ✅ Image sent: ${fp}`);
//       } catch (err) {
//         console.error(`[Telegram] ❌ Image send failed for ${fp}:`, err);
//         // Don't fail the whole lead just because the image didn't send —
//         // the text lead notification already went through.
//       }
//     }

//     if (!sent) {
//       console.error(`[Telegram] ❌ FAILED after retries: ${fp}`);
//     }
//   }

//   isProcessing = false;
// }

// // ─── Route ────────────────────────────────────────────────────────────────────

// export async function POST(req: NextRequest) {
//   try {
//     const payload: LeadPayload = await req.json();

//     if (!payload.name || !payload.phone || !payload.service) {
//       return NextResponse.json(
//         { success: false, error: "name, phone, service required" },
//         { status: 400 }
//       );
//     }

//     const fp = buildFingerprint(payload);
//     if (sentFingerprints.has(fp)) {
//       return NextResponse.json({ success: true, queued: false, message: "Already sent" });
//     }

//     pendingQueue.push(payload);
//     processQueue().catch(e => console.error("[Telegram] Queue error:", e));

//     return NextResponse.json({ success: true, queued: true });
//   } catch (err) {
//     console.error("[Telegram] API error:", err);
//     return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
//   }
// }









import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadPayload {
  // Basic
  name: string;
  phone: string;
  email?: string;
  company?: string;
  brandName?: string;
  service: string;
  // Branding specific
  logoExists?: string;
  needLogoRedesign?: string;
  needLogoDesign?: string;
  preferredColors?: string;
  brandStyle?: string;
  logoType?: string;
  slogan?: string;
  brandStrategy?: string;
  // Website specific
  websiteType?: string;
  currentWebsite?: string;
  pagesNeeded?: string;
  featuresNeeded?: string;
  paymentGateway?: string;
  bookingSystem?: string;
  adminPanel?: string;
  languages?: string;
  // Portfolio specific
  portfolioType?: string;
  services?: string;
  needCMS?: string;
  needAnimations?: string;
  needSEO?: string;
  needHosting?: string;
  // Common
  budget?: string;
  timeline?: string;
  requirements?: string;
  conversationSummary?: string;
  imageBase64?: string;
  imageMime?: string;
}

// ─── FIX: removed the in-memory queue + fingerprint dedup ─────────────────────
// The previous implementation used a module-level `Set` and array as a
// "queue", relying on that memory persisting between requests. On serverless
// platforms (Vercel etc.) each invocation can land on a *different* instance
// with its own fresh memory, so:
//   1. The dedup Set didn't reliably prevent duplicates (different instance
//      = different Set = duplicate goes through anyway), and
//   2. Worse, it *could* incorrectly block a legitimate resubmission if the
//      same instance handled it and the name+phone+service happened to match
//      an earlier lead — which is exactly the "form send agiruthu aana
//      Telegram-la varala" (silently dropped) symptom being reported.
// A single stateless request that directly awaits Telegram and returns the
// real result is far more predictable under concurrent traffic from many
// users, and lets the same person submit the form again if they want to.

function val(v?: string) {
  return v && v !== "" ? v : "—";
}

function buildMessage(p: LeadPayload): string {
  const time = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [
    `🔥 *New Project Enquiry — CraftCode*`,
    ``,
    `👤 *Name:* ${val(p.name)}`,
    `📱 *Phone:* ${val(p.phone)}`,
    p.email ? `📧 *Email:* ${val(p.email)}` : "",
    p.company ? `🏢 *Company:* ${val(p.company)}` : "",
    p.brandName ? `🏷 *Brand Name:* ${val(p.brandName)}` : "",
    `💼 *Service:* ${val(p.service)}`,
    ``,
  ];

  // Service-specific fields
  const service = p.service?.toLowerCase() || "";

  if (service.includes("brand") || service.includes("logo")) {
    lines.push(
      `🎨 *Logo Exists:* ${val(p.logoExists)}`,
      p.needLogoRedesign ? `🔄 *Logo Redesign:* ${val(p.needLogoRedesign)}` : "",
      p.needLogoDesign ? `✏️ *Need Logo Design:* ${val(p.needLogoDesign)}` : "",
      p.preferredColors ? `🎨 *Colors:* ${val(p.preferredColors)}` : "",
      p.brandStyle ? `💎 *Brand Style:* ${val(p.brandStyle)}` : "",
      p.logoType ? `🖋 *Logo Type:* ${val(p.logoType)}` : "",
      p.slogan ? `📝 *Slogan:* ${val(p.slogan)}` : "",
      p.brandStrategy ? `🧠 *Brand Strategy:* ${val(p.brandStrategy)}` : "",
      ``,
    );
  }

  if (service.includes("website") || service.includes("ecommerce") || service.includes("e-commerce")) {
    lines.push(
      p.websiteType ? `🌐 *Website Type:* ${val(p.websiteType)}` : "",
      p.currentWebsite ? `🔗 *Current Website:* ${val(p.currentWebsite)}` : "",
      p.pagesNeeded ? `📄 *Pages:* ${val(p.pagesNeeded)}` : "",
      p.featuresNeeded ? `⚙️ *Features:* ${val(p.featuresNeeded)}` : "",
      p.paymentGateway ? `💳 *Payment Gateway:* ${val(p.paymentGateway)}` : "",
      p.bookingSystem ? `📅 *Booking System:* ${val(p.bookingSystem)}` : "",
      p.adminPanel ? `🖥 *Admin Panel:* ${val(p.adminPanel)}` : "",
      p.languages ? `🌍 *Languages:* ${val(p.languages)}` : "",
      ``,
    );
  }

  if (service.includes("portfolio")) {
    lines.push(
      p.portfolioType ? `👤 *Portfolio Type:* ${val(p.portfolioType)}` : "",
      p.services ? `🛠 *Services Listed:* ${val(p.services)}` : "",
      p.needCMS ? `📝 *CMS:* ${val(p.needCMS)}` : "",
      p.adminPanel ? `🖥 *Admin Panel:* ${val(p.adminPanel)}` : "",
      p.needAnimations ? `✨ *Animations:* ${val(p.needAnimations)}` : "",
      p.needSEO ? `🔍 *SEO:* ${val(p.needSEO)}` : "",
      p.needHosting ? `☁️ *Hosting:* ${val(p.needHosting)}` : "",
      ``,
    );
  }

  lines.push(
    `💰 *Budget:* ${val(p.budget)}`,
    `📅 *Timeline:* ${val(p.timeline)}`,
    `📋 *Requirements:* ${val(p.requirements)}`,
    ``,
    `🤖 *AI Summary:*`,
    val(p.conversationSummary),
    ``,
    `🕒 *Time:* ${time}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🤖 CraftCode AI Assistant`,
  );

  return lines.filter(l => l !== "").join("\n");
}

async function sendToTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env.local");
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${err}`);
  }
}

async function sendPhotoToTelegram(
  imageBase64: string,
  imageMime: string,
  captionName: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env.local");
  }

  const buffer = Buffer.from(imageBase64, "base64");
  const ext = imageMime.split("/")[1] || "jpg";

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", `📎 Reference image from ${captionName}`);
  formData.append("photo", new Blob([new Uint8Array(buffer)], { type: imageMime }), `reference.${ext}`);

  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram sendPhoto error ${res.status}: ${err}`);
  }
}

/**
 * Send one lead straight through, with retries on the text message only.
 * Runs fully inside the request lifecycle — no shared queue, so concurrent
 * submissions from different users never interfere with each other and
 * nothing gets silently dropped because a background loop wasn't running.
 */
async function sendLead(payload: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  const message = buildMessage(payload);

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await sendToTelegram(message);
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      console.error(`[Telegram] Attempt ${attempt} failed:`, err);
      if (attempt < 2) await new Promise(r => setTimeout(r, 1200));
    }
  }

  if (lastError) {
    return { ok: false, error: lastError instanceof Error ? lastError.message : "Unknown error" };
  }

  // Text succeeded — best-effort forward the reference image too. A failed
  // image send should never fail the whole lead, since the text already
  // reached the team.
  if (payload.imageBase64 && payload.imageMime) {
    try {
      await sendPhotoToTelegram(payload.imageBase64, payload.imageMime, payload.name || "customer");
    } catch (err) {
      console.error("[Telegram] Image send failed:", err);
    }
  }

  return { ok: true };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload: LeadPayload = await req.json();

    if (!payload.name || !payload.phone || !payload.service) {
      return NextResponse.json(
        { success: false, error: "name, phone, service required" },
        { status: 400 }
      );
    }

    const result = await sendLead(payload);

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Telegram] API error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}