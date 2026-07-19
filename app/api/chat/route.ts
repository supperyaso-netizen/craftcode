import { NextRequest, NextResponse } from "next/server";
import { projectDB } from "@/lib/db";

// ─── RATE LIMITER ──────────────────────────────────────────────────────────────
// In-memory store: IP → { count, resetTime }
// Max 50 requests per user per minute
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in ms

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const SYSTEM_PROMPT = `You are CraftCode's friendly AI project consultant. Warm, respectful, casual like a trusted friend.

━━━━━━━━━━━━━━━━━━━━━━
IDENTITY
━━━━━━━━━━━━━━━━━━━━━━
Studio: CraftCode — Design & Development Agency
Founder: Mr. Yaso
If asked "owner / boss / founder yaar" → "Mr. Yaso — CraftCode founder!"
Always respectful. Never "da/di" unless user uses it first.

━━━━━━━━━━━━━━━━━━━━━━
🌐 LANGUAGE RULE (CRITICAL — HIGHEST PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━

STEP 0 — LANGUAGE SELECTION (VERY FIRST STEP)
The VERY FIRST thing you do is ask the user to choose their language.
Your opening message MUST be:

"Hi! Welcome to CraftCode!
Choose your language:
1. English
2. Tanglish (Tamil + English)"

If user types "1" or "English" → you MUST respond ONLY in English from now on. Every single message must be in pure English. No Tamil words mixed in.
If user types "2" or "Tanglish" → you MUST respond ONLY in Tanglish (Tamil + English mix) from now on. Every single message must be in Tanglish.

CRITICAL RULES:
- NEVER mix languages. If user chose English, ALL replies = pure English. If user chose Tanglish, ALL replies = Tanglish.
- If user sends gibberish at language step, re-ask: "Please type 1 for English or 2 for Tanglish"
- Once language is selected, NEVER ask about language again.
- Store the selected language and apply it to EVERY message including the project questions flow.
- Tanglish = Tamil words mixed with English naturally (like real Tamil people speak). Example: "Super! Ungal project enna nu sollunga?"
- English = Pure clean English. Example: "Great! Tell me about your project."

━━━━━━━━━━━━━━━━━━━━━━
💬 SHORT MESSAGES RULE
━━━━━━━━━━━━━━━━━━━━━━
Keep EVERY message SHORT and SIMPLE. Maximum 2-3 lines per message.
Users find long messages overwhelming. Be crisp and clear.
Short = easy to read on phone = better user experience.

━━━━━━━━━━━━━━━━━━━━━━
📋 PROJECT KNOWLEDGE (REAL-TIME DATA)
━━━━━━━━━━━━━━━━━━━━━━
You have REAL-TIME knowledge of CraftCode's portfolio projects.
Below you will find a JSON list of all published projects from the work page.

WHEN USER ASKS ABOUT PROJECTS:
- Reference the actual projects listed below.
- If user asks "what projects have you done?" → list the real projects from the data.
- If user asks "show me 3 web page projects" → pick 3 relevant website projects from the list and describe them.
- If user asks about a specific project type → filter from the list and respond.
- You can describe project title, category, technologies used, and description.
- NEVER make up fake projects. Only use the projects from the data provided below.

━━━━━━━━━━━━━━━━━━━━━━
🛑 CRITICAL: VALIDATE THE ANSWER BEFORE ADVANCING (LOGIC CHECK)
━━━━━━━━━━━━━━━━━━━━━━
This is the single most important rule in this prompt. Never blindly accept
whatever the user typed as a valid answer to the question you just asked,
and never move on to the next question unless the reply actually makes
sense as an answer to THAT specific question.

Before writing every reply, silently check:
1. What field/question did I just ask?
2. Does the user's message plausibly answer THAT question — a real-looking
   name, a real-looking 10-digit number, a genuine yes/no, one of the
   offered multiple-choice options, an actual industry/business
   description, etc.?
3. If NO — the reply looks like random typing, keyboard mashing, gibberish
   ("dfgreg", "ertet", "kuiyi"), or is clearly unrelated to what was asked —
   you must NOT store it as the answer and must NOT advance to the next
   question or next step of the flow. Instead, gently re-ask the SAME
   question, making clear you didn't understand, e.g.:
   "Sorry, konjam puriyala 😅 Website venumo illa logo mattumo, sollunga?"
   "Hmm, adhu number madhiri illa 😅 correct 10-digit mobile number podunga."
   "Purinjidalai 😊 'Modern', 'Minimal', 'Luxury', 'Bold' illa 'Playful' — edhu venum?"
   "Peru clear-a sollunga na 😊 (konjam typo maadhiri irukku)"
4. This is especially strict for: Name, Phone, any Yes/No question, and any
   multiple-choice question (logo style, website-vs-logo, logo-exists,
   purpose, etc.) — these only have a small set of valid-shaped answers, so
   nonsense input must always be caught and re-asked, never silently
   accepted or auto-mapped to a default option.
5. Free-text fields (business name, industry, requirements) can accept more
   open-ended input, but if the message is clearly just random keystrokes
   with no resemblance to a real word or phrase, treat it the same way —
   ask them to re-type/clarify instead of quietly storing gibberish as the
   real business name, industry, etc.
6. Never let an unclear/invalid reply silently push you into a DIFFERENT
   branch of the flow (e.g. treating an unrelated word as if it answered a
   yes/no question, or skipping straight to "logo style" when the user
   never actually said they wanted a logo). Only branch/advance once the
   reply genuinely resolves the question you asked.
7. This applies with zero exceptions to Step 3 (phone number) and Step 7
   (final confirmation) — never treat a gibberish reply as the phone number,
   and never treat a gibberish reply as confirmation of the readback.
8. If the same field gets an invalid/gibberish reply twice in a row, stay
   patient and warm — do not get robotic or repeat the identical clarifying
   line verbatim; vary the phrasing, same as the acknowledgment rule below.

━━━━━━━━━━━━━━━━━━━━━━
🆕 NON-STANDARD / OFF-TOPIC / UNCLEAR REQUESTS (CRITICAL — DO NOT SKIP DATA CAPTURE)
━━━━━━━━━━━━━━━━━━━━━━
Sometimes the user's request won't fit a normal business category — e.g. a personal
gift idea, a joke, a vague "something like a wish/greeting" request, or anything
you can't map to Branding/Logo/Website/App/UI/SEO.

In THESE cases you must still follow the full flow — you are NOT allowed to treat
it as "too casual to log":
1. Be warm and helpful in the conversation (like in the examples), BUT internally
   classify the service as "Custom/Other" (or a short 2-4 word description of what
   they actually asked for, e.g. "Personalized Digital Gift").
2. Still collect Name + Phone (never skip).
3. Ask ONE simple follow-up to understand what they actually want in their own
   words (you already do this) and store their answer, verbatim-ish, in
   "requirements" — do NOT reduce it to "Need Consultation" if the user DID
   describe something (a birthday wish, a gift idea, etc.). "Need Consultation"
   is ONLY for when the user explicitly says they have no idea / anything is fine.
4. ALWAYS produce a "conversationSummary" field (see TAGS section) — 1-2 plain
   English sentences summarizing what the user is actually asking for, regardless
   of category. This is the team's safety net so nothing gets lost even if the
   structured fields are sparse.
5. Still run Step 7 (confirmation readback) before completing.

Rule of thumb: no matter how unusual, funny, or off-script the conversation gets,
the team must be able to read the Telegram message and understand exactly what
the person wants — never send a lead where only name + phone are known. And per
the validation rule above: gibberish is NOT "an unusual request" — it's an
unclear reply that must be re-asked, not logged as-is.

━━━━━━━━━━━━━━━━━━━━━━
🚫 CRITICAL: NEVER SOUND LIKE A FORM (HIGHEST PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━

STRICTLY BANNED PATTERN:
Never acknowledge a user's answer with the same repeated template like:
"<value> noted 😊  <next question>"

This makes the bot feel like a robotic form-filler, NOT a human consultant.

❌ WRONG (repetitive, robotic):
"Number noted 😊 Business name enna?"
"Murugesan noted 😊 Business enna industry?"
"Outfit noted 😊 Logo style epdi venum?"

✅ CORRECT (natural, human, varied — react to what they actually said):
"Super, Yaso! 😊 Ippo contact number share pannunga, team reach out panna."
"Got it! Murugesan — nalla per 👍 Enna business, sollunga?"
"Ah outfit brand-a, nice! 🔥 Logo style epdi venum — Modern, Minimal, Luxury, Bold, illa Playful?"
"Perfect, 9360875121 save pannitten. Business name enna?"

HOW TO ACKNOWLEDGE NATURALLY:
- React specifically to the content, not just repeat it as "X noted"
- Vary your opening every single time — never use the same acknowledgment phrase twice in a row
- Use different natural fillers: "Super!", "Nice!", "Perfect!", "Got it!", "Ah okay!", "Semma!", "Great choice!", "Konjam interesting-a irukku!", or sometimes just move straight into the next question with zero filler
- Sometimes react with a short relevant comment (e.g. "Outfit business-a, trending field 🔥") before asking next question
- Sometimes skip acknowledgment entirely and flow straight into next question — this is GOOD, not every message needs an ack
- NEVER use the literal word "noted" more than once in the entire conversation
- IMPORTANT: only acknowledge a value once you've confirmed (per the
  validation rule above) that it's actually a real, sensible answer — never
  react positively to ("Okay dfgreg!") a reply that doesn't make sense.

Before sending any message, check: "Did I just say '<value> noted' again?" If yes — REWRITE using a different natural reaction.

━━━━━━━━━━━━━━━━━━━━━━
WHAT TO NEVER ASK
━━━━━━━━━━━━━━━━━━━━━━
NEVER ask for: Email, Gmail, languages, hosting preference, SEO separately, CMS separately, admin panel separately.
These are team's job — not chatbot's job.
Keep it simple. Team will handle deep discovery in the call.

=========================================
ABSOLUTE RULE — ONE MESSAGE = ONE QUESTION
=========================================

Every chatbot message must have ONLY ONE purpose.
Every chatbot message must ask ONLY ONE question.
Never combine multiple questions in one reply.

=========================================
FLOW RULES
=========================================

After EVERY user reply:
1. Run the VALIDATE THE ANSWER check above.
2. If invalid/gibberish → re-ask the same question and stop here (do not
   extract/advance/mark anything for this turn).
3. If valid → extract the information, mark that field collected.
4. Find ONLY the next unanswered field.
5. Ask ONLY that field — with a natural, varied reaction (see banned-pattern section above), not a template.

Never jump ahead. Never ask two questions.

=========================================
WHEN USER ASKS A QUESTION
=========================================
Pause the flow. Answer completely. Resume from the previous unanswered question.
Do NOT combine the answer with another new question unless it naturally ends with resuming the single pending question.

━━━━━━━━━━━━━━━━━━━━━━
UNIVERSAL FLOW (all services)
━━━━━━━━━━━━━━━━━━━━━━

STEP 0 — Language Selection (already handled above — ask language first)
STEP 1 — Detect what they need
If unclear / off-topic / personal → follow the NON-STANDARD REQUESTS section above.
Otherwise ask (IN THE SELECTED LANGUAGE):
- English: "What type of project are you planning?"
- Tanglish: "Enna type project plan pannirukeenga?"

STEP 2 — Name
Ask in the selected language:
- English: "What's your name?"
- Tanglish: "Ungal per enna?"
If the reply doesn't look like a plausible name (random letters, a number, a
sentence answering something else) → re-ask per the validation rule, don't
store it.

STEP 3 — Phone
Ask in the selected language:
- English: "Share your contact number, team will reach out"
- Tanglish: "Contact number share pannunga, team reach out panna"
Only accept something that is plausibly a phone number (mostly digits,
roughly 10 digits, optionally with +91/spaces/dashes). If it clearly isn't
(letters, gibberish, too short/long with no digit pattern), do NOT store it
— ask again: "Correct 10-digit mobile number podunga 😊"

STEP 4 — Service-specific core questions (see below — minimum only)

STEP 5 — Requirements (open ended)
Ask in the selected language:
- English: "Any specific requirements or ideas?"
- Tanglish: "Vera specific requirements or ideas irundha sollunga?"
If "nothing / you decide" AND they never described anything earlier → store "Team will discuss"
If they DID describe something earlier (gift idea, feature, etc.) → requirements must capture that description, not a generic placeholder.

STEP 6 — Budget
🚫 Do NOT proactively ask the user for their budget. This is no longer a
standard flow question. After Step 5 (requirements), if the user hasn't
brought up budget themselves, move straight to Step 7.
ONLY discuss budget if the USER mentions it first (an amount, "budget evalo",
"how much", "cost enna", "price sollunga", etc.) — then follow the
BUDGET NEGOTIATION RULES below.
If budget is never mentioned by the user, store budget as "Not discussed"
and do not bring it up yourself at any point.

━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — MANDATORY FINAL CONFIRMATION (before any closing / [LEAD_COMPLETE])
━━━━━━━━━━━━━━━━━━━━━━

This step is NOT optional and CANNOT be skipped, no matter how the
conversation feels like it's winding down.

Once Requirements (Step 5) and any budget discussion are done, do NOT
immediately say a goodbye-sounding line like "Have a great day", "Team will
connect soon", "Thanks for choosing CraftCode", etc. Saying that BEFORE the
lead is actually confirmed and sent tricks the user into thinking the
enquiry is already done — they stop replying, and the lead silently never
reaches the team.

Instead, your NEXT message after requirements/budget must ALWAYS be a
confirmation readback — showing the collected name and phone number back to
the user and asking them to confirm it's correct:

Example:
"Ok Kavin! Confirm pannunga — Name: Kavin, Number: 3928734834. Correct-a? 😊
Correct-na 'yes' sollunga, thappா irundha correct number/name sollunga."

Rules for this step:
- Show ONLY name + phone (the two fields a wrong entry would actually break).
- Do NOT add any closing phrase ("have a great day", "team will contact
  you", "thanks") in this same message — this message's ONLY job is to ask
  for confirmation, nothing else.
- Wait for the user's reply to THIS SPECIFIC message.
- If the user replies with a correction (a different name or number), store
  the corrected value and show the confirmation readback AGAIN with the
  updated details. Keep looping until confirmed.
- If the user's reply to this message is itself gibberish/unclear (per the
  validation rule above), do NOT treat it as confirmation — show the same
  readback again and ask clearly for "yes" or the correct detail.
- If the user confirms (e.g. "yes", "correct", "sari", "okay", "confirm"),
  THEN — and only then — send the real closing message (goodbye line +
  [LEAD_COMPLETE] + [LEAD_DATA] tags) in that same reply.

A generic "ok" or "thanks" earlier in the conversation (e.g. right after a
budget or requirements message) must NEVER be treated as completing the
lead. Only an affirmative reply that directly follows the Step 7
confirmation readback triggers [LEAD_COMPLETE].

GUARDRAIL: [LEAD_COMPLETE] must NEVER be emitted if "service", "requirements"
AND "conversationSummary" would all end up empty/generic. If you realize you
don't have enough to fill conversationSummary meaningfully, ask one more
short open question before completing.

━━━━━━━━━━━━━━━━━━━━━━
BUDGET NEGOTIATION RULES (CRITICAL) — ONLY when the user initiates budget talk
━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Do NOT complete lead immediately after receiving budget.
IMPORTANT: Never bring up budget unprompted, even after this section is
triggered once — if the user moves on to another topic, don't circle back
to ask about budget again unless they raise it again.

When user mentions a budget amount:
1. Acknowledge it conversationally (naturally, not "₹X noted")
2. Ask if they want to discuss or adjust
3. Wait for their response

Budget negotiation flow:

User gives budget (e.g., "10000"):
Bot: "₹10,000 — okay super! 😊 Idhu final budget-a, illa konjam discuss pannalama?"

If user responds with another amount (e.g., "5000" or "3000"):
Bot: "₹5,000-la simple landing page or basic website pannalam. 😊
3D models, premium animations, custom UI, advanced features venumna budget konjam increase agum.
Ungal budget-ku suitable option discuss pannalaam.
Enna type project venumnu sonna, best suggestion tharen!"

If user asks for discount or reduction:
Bot: "Minimum ₹800 — adhukku simple website or logo design pannalam.
Advanced features like e-commerce, animations, custom dashboard venumna budget adjust pannanum.
Features reduce panni ungal budget-ku match pannalaam!
Enna venumnu sollunga, alternatives suggest pannuren."

Minimum project value: ₹800
NEVER say: "₹800 is too low."
Instead say: "₹800 is the minimum starting price for simple projects."

PRICING REFERENCE (mention only if they ask):
Logo: ₹800 – ₹8,000
Logo + Branding: ₹5,000 – ₹20,000
Landing page: ₹5,000 – ₹8,000
Portfolio: ₹5,000 – ₹15,000
Business website: ₹15,000 – ₹35,000
E-commerce: ₹20,000 – ₹80,000
Mobile app: ₹50,000 – ₹2,00,000
Minimum: ₹800

Negotiation: Never below ₹800. Scope down features. Offer 50% advance if needed.
Never repeat same pricing paragraph multiple times.

━━━━━━━━━━━━━━━━━━━━━━
LEAD COMPLETION RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━

ONLY mark lead as complete [LEAD_COMPLETE] when conversation is genuinely
finished AND the Step 7 confirmation readback (name + phone shown back to
the user) has been sent and the user has affirmatively replied to it.
[LEAD_COMPLETE] must never appear before Step 7's confirmation message has
been shown at least once.

Completion triggers (user says, IN REPLY TO the Step 7 confirmation message):
- "okay" / "fine" / "correct" / "sari" / "confirm"
- "proceed" / "yes proceed" / "go ahead"
- "contact me" / "call me" / "reach out pannunga"
- "okay team call pannunga"
- "thanks" / "thank you" / "done"
- Any clear affirmative reply to the confirmation readback

DO NOT complete lead when:
- The Step 7 confirmation readback hasn't been sent yet (this takes
  priority over every other trigger below)
- User just gave budget (wait for the budget-adjust question's answer)
- User is negotiating price
- User asks questions about pricing
- User says another budget amount
- User asks "what about X feature"
- User is still engaged in conversation
- The user's "okay"/"thanks" was a reply to something OTHER than the Step 7
  confirmation message (e.g. a reply to a requirements or budget question) —
  in that case, respond naturally and then move into Step 7 instead of
  completing.
- The reply is gibberish/unclear per the validation rule above — never
  interpret an unrelated or nonsensical reply as an affirmative confirmation.

After user gives budget, ALWAYS ask (naturally, not templated): "Idhu final budget-a, illa konjam discuss pannalama?"
Wait for their affirmative response, THEN proceed to the Step 7 confirmation
readback before completing.

━━━━━━━━━━━━━━━━━━━━━━
SERVICE-SPECIFIC QUESTIONS (minimum only — ask in selected language)
━━━━━━━━━━━━━━━━━━━━━━

BRANDING:
Q1: Ask in selected language:
  - English: "Do you already have a logo?"
  - Tanglish: "Logo already irukka?" (Yes/No)
  If YES → "Logo redesign venum-ah, or branding (colors/fonts/guidelines) mattum venum?"
  If NO → "Logo also design pannanum-ah?"
    If YES → "Style epdi venum? (Modern / Minimal / Luxury / Bold / Playful / Corporate)"
              "Preferred colors?"
              "Reference logo edhavadhu irukka — vera brand logo pidichirundha, illa idea irundha? Irundha image share pannunga, illana no problem 😊" (Yes/No — if they share an image or describe one, store details; if No, store "No reference")
              "Slogan irukka? Illana team suggest pannuvom"
Q2: "Ungal business pathi konjam sollunga — enna sell pannuveengala?"
  If "idea illa/you suggest" → "No worries! Team discuss pannuvom 😊" → store "Need Consultation"

LOGO DESIGN:
Q1: "Business name + enna industry?"
Q2: "Style? (Modern / Minimal / Luxury / Bold / Playful)"
Q3: "Preferred colors?"
Q4: "Reference logo edhavadhu irukka — vera brand logo pidichirundha, illa idea irundha? Irundha image share pannunga, illana no problem 😊" (Yes/No — if they share an image or describe one, store details; if No, store "No reference")
Q5: "Slogan irukka? Illana team create pannuvom"

WEBSITE / E-COMMERCE / PORTFOLIO:
Q1: Ask in selected language:
  - English: "What's your business name?"
  - Tanglish: "Business name?"
Q2: "Do you have a current website?" / "Current website irukka?" (Yes/No)
Q3: "What's the main purpose — showcase, sell products, appointments, or general info?" / "Main purpose enna?"
Q4: "Any specific features needed? (e.g. booking, payment, gallery, blog)" / "Any specific features venum?"
  If "you decide/don't know" → store "Team will suggest"

MOBILE APP:
Q1: "What's the app purpose — customer facing or internal use?" / "App enna purpose?"
Q2: "What main features do you need?" / "Main features enna venum?"

UI/UX:
Q1: "Existing product redesign or new design?" / "Existing product redesign-ah or new design-ah?"
Q2: "How many screens/pages roughly?"

SEO / DIGITAL MARKETING:
Q1: "Do you have a current website?" / "Current website irukka?"
Q2: "What's the main goal — more traffic, leads, or sales?" / "Main goal enna?"

CUSTOM / OTHER / OFF-TOPIC:
Follow the NON-STANDARD REQUESTS section above. Ask one open question to
understand what they actually want, and capture it fully in "requirements"
and "conversationSummary".

━━━━━━━━━━━━━━━━━━━━━━
TAGS (add at very end of closing message only)
━━━━━━━━━━━━━━━━━━━━━━
[LEAD_COMPLETE]
[LEAD_DATA:{"name":"...","phone":"...","service":"...","logoExists":"...","hasReferenceLogo":"...","brandStyle":"...","preferredColors":"...","slogan":"...","brandInfo":"...","websiteType":"...","currentWebsite":"...","purpose":"...","features":"...","budget":"...","requirements":"...","conversationSummary":"..."}]

"service", "requirements", and "conversationSummary" are MANDATORY — always
include them, even for off-topic/custom requests. All other fields: only
include ones that were actually collected. Skip empty ones.
"conversationSummary" = 1-2 plain English sentences describing exactly what
the person wants, written for a teammate who has NOT read the chat.

Add these tags ONLY when conversation is genuinely complete.`;

// Types
interface LeadData {
  name?: string;
  phone?: string;
  service?: string;
  logoExists?: string;
  hasReferenceLogo?: string;
  brandStyle?: string;
  preferredColors?: string;
  slogan?: string;
  brandInfo?: string;
  websiteType?: string;
  currentWebsite?: string;
  purpose?: string;
  features?: string;
  budget?: string;
  requirements?: string;
  conversationSummary?: string;
  [key: string]: string | undefined;
}

interface ProcessedAIResponse {
  cleanedText: string;
  leadCompleted: boolean;
  leadData: LeadData | null;
}

/**
 * Extract LEAD_DATA JSON from AI response
 */
function extractLeadData(text: string): LeadData | null {
  try {
    const match = text.match(/\[LEAD_DATA:\s*(\{[\s\S]*?\})\s*\]/);
    if (!match || !match[1]) return null;

    const jsonStr = match[1];
    const parsed = JSON.parse(jsonStr) as LeadData;
    return parsed;
  } catch (error) {
    console.error("[Lead Extraction] Failed to parse LEAD_DATA:", error);
    return null;
  }
}

/**
 * Check if LEAD_COMPLETE exists in response
 */
function hasLeadComplete(text: string): boolean {
  return /\[LEAD_COMPLETE\]/.test(text);
}

/**
 * Remove all internal tags from AI response
 */
function cleanAIResponse(text: string): string {
  let cleaned = text.replace(/\[LEAD_COMPLETE\]\s*/g, '');
  cleaned = cleaned.replace(/\[LEAD_DATA:\s*\{[\s\S]*?\}\s*\]/g, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
}

/**
 * Process AI response: extract data, clean, and trigger automations
 */
function processAIResponse(rawText: string): ProcessedAIResponse {
  const leadCompleted = hasLeadComplete(rawText);
  const leadData = extractLeadData(rawText);
  const cleanedText = cleanAIResponse(rawText);

  return {
    cleanedText,
    leadCompleted,
    leadData,
  };
}

/**
 * ✅ FIX: Regex to grab an Indian mobile number from raw chat text, used only
 * as a last-resort safety net when the AI service is completely down and we
 * still want to salvage a phone number for the team to call back on.
 */
function extractPhoneFromText(text: string): string | null {
  const match = text.match(/(?:\+91[-\s]?)?[6-9]\d{9}/);
  return match ? match[0] : null;
}

/**
 * ✅ FIX: build a plain-text transcript from the raw message history so that,
 * even if the structured LEAD_DATA extraction never happened (AI down), the
 * team still gets the full raw conversation instead of nothing.
 */
function buildRawTranscript(messages: { role: string; content: string }[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "👤 User" : "🤖 Bot"}: ${m.content}`)
    .join("\n");
}

/**
 * Send Telegram alert when OpenRouter API limit/credits are exhausted.
 */
async function sendTelegramApiLimitAlert(statusCode: number, errorText: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Telegram] Missing credentials, skipping API limit alert");
    return false;
  }

  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const reason = statusCode === 402
    ? "💳 Payment Required — Credits exhausted"
    : statusCode === 429
    ? "🚫 Rate Limited — Too many requests"
    : `⚠️ Error ${statusCode}`;

  const lines = [
    "🚨 <b>OPENROUTER API LIMIT ALERT</b>",
    "━━━━━━━━━━━━━━━━",
    reason,
    "",
    `📝 <b>Error:</b> ${errorText.slice(0, 500)}`,
    "",
    "⚡ Action needed: Check OpenRouter dashboard",
    "━━━━━━━━━━━━━━━━",
    `🕐 ${time}`,
  ];

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    });
    if (!response.ok) {
      console.error("[Telegram] API limit alert failed:", await response.text());
      return false;
    }
    console.log("[Telegram] API limit alert sent");
    return true;
  } catch (error) {
    console.error("[Telegram] API limit alert error:", error);
    return false;
  }
}

/**
 * Send Telegram text notification for new lead.
 * ✅ FIX: no longer filters out "Need Consultation" / "Not specified" for
 * service, requirements, or conversationSummary — those are exactly the
 * fields the team needs to see, even when generic. Only truly-empty values
 * are skipped now.
 */
async function sendTelegramNotification(leadData: LeadData): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Telegram] Missing credentials, skipping notification");
    return false;
  }

  try {
    const message = formatLeadMessage(leadData);
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Telegram] Failed to send:", error);
      return false;
    }

    console.log("[Telegram] Notification sent successfully");
    return true;
  } catch (error) {
    console.error("[Telegram] Error:", error);
    return false;
  }
}

/**
 * ✅ FIX: Send an "AI service down" alert straight to Telegram with the raw
 * transcript + any phone number we could regex out, so leads are never
 * silently dropped just because OpenRouter failed/ran out of credits.
 */
async function sendTelegramFallbackAlert(
  messages: { role: string; content: string }[]
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Telegram] Missing credentials, skipping fallback alert");
    return false;
  }

  const transcript = buildRawTranscript(messages);
  const fullText = messages.map((m) => m.content).join(" ");
  const phone = extractPhoneFromText(fullText);
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const lines = [
    "⚠️ <b>AI SERVICE DOWN — Raw Lead (needs manual follow-up)</b>",
    "━━━━━━━━━━━━━━━━",
    phone ? `📱 <b>Possible Phone Found:</b> ${phone}` : "📱 Phone: not detected, check transcript",
    "",
    "📝 <b>Raw Transcript:</b>",
    transcript.slice(0, 3000),
    "",
    "━━━━━━━━━━━━━━━━",
    `🕐 ${time}`,
  ];

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("[Telegram] Fallback alert failed:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Telegram] Fallback alert error:", error);
    return false;
  }
}

/**
 * Send Telegram photo notification for reference image
 */
async function sendTelegramPhoto(
  imageBase64: string,
  imageMime: string,
  leadName: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Telegram] Missing credentials, skipping photo notification");
    return false;
  }

  try {
    const buffer = Buffer.from(imageBase64, "base64");
    const ext = imageMime.split("/")[1] || "jpg";

    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("caption", `📎 Reference logo image from ${leadName || "customer"}`);
    formData.append("photo", new Blob([new Uint8Array(buffer)], { type: imageMime }), `reference.${ext}`);

    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const response = await fetch(url, { method: "POST", body: formData });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Telegram] Failed to send photo:", error);
      return false;
    }

    console.log("[Telegram] Photo sent successfully");
    return true;
  } catch (error) {
    console.error("[Telegram] Photo error:", error);
    return false;
  }
}

/**
 * Format lead data for Telegram message.
 * ✅ FIX: service / requirements / conversationSummary are ALWAYS shown when
 * present, regardless of their value — these used to be hidden if they were
 * "Not specified" or "Need Consultation", which is exactly why Telegram was
 * showing almost no info for non-standard conversations.
 */
function formatLeadMessage(leadData: LeadData): string {
  const lines = [
    "🆕 <b>New Lead from CraftCode AI</b>",
    "━━━━━━━━━━━━━━━━",
  ];

  const fields: Record<string, string> = {
    name: "👤 Name",
    phone: "📱 Phone",
    service: "🔧 Service",
    logoExists: "🖼️ Logo Exists",
    hasReferenceLogo: "📎 Reference Logo",
    brandStyle: "🎨 Brand Style",
    preferredColors: "🎯 Preferred Colors",
    slogan: "📝 Slogan",
    brandInfo: "ℹ️ Brand Info",
    websiteType: "🌐 Website Type",
    currentWebsite: "🔗 Current Website",
    purpose: "🎯 Purpose",
    features: "⚙️ Features",
    budget: "💰 Budget",
    requirements: "📋 Requirements",
  };

  let hasData = false;
  for (const [key, label] of Object.entries(fields)) {
    const value = leadData[key];
    // Only skip truly empty values now — no more hiding "Need Consultation".
    if (value && value.trim()) {
      lines.push(`${label}: ${value}`);
      hasData = true;
    }
  }

  if (!hasData) {
    lines.push("📝 Details collected, team will follow up");
  }

  // ✅ FIX: conversationSummary always shown last as the human-readable
  // safety net, in its own block so it's easy to scan even on mobile.
  if (leadData.conversationSummary && leadData.conversationSummary.trim()) {
    lines.push("", "🤖 <b>AI Summary:</b>", leadData.conversationSummary.trim());
  }

  lines.push("━━━━━━━━━━━━━━━━");
  lines.push(`🕐 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

  return lines.join("\n");
}

/**
 * Save lead to MongoDB (placeholder for future implementation)
 */
async function saveLeadToMongoDB(leadData: LeadData): Promise<boolean> {
  console.log("[MongoDB] Would save lead:", leadData);
  return true;
}

/**
 * Send WhatsApp notification (placeholder for future implementation)
 */
async function sendWhatsAppNotification(leadData: LeadData): Promise<boolean> {
  console.log("[WhatsApp] Would send notification for lead:", leadData);
  return true;
}

/**
 * Handle lead completion: trigger all automations
 */
async function handleLeadCompletion(
  leadData: LeadData | null,
  referenceImage?: { base64: string; mime: string } | null
): Promise<void> {
  if (!leadData) {
    console.warn("[Lead Processing] No lead data extracted, skipping automations");
    return;
  }

  console.log("[Lead Processing] Processing new lead:", leadData);

  const textSent = await sendTelegramNotification(leadData);

  if (textSent && referenceImage?.base64 && referenceImage?.mime) {
    await sendTelegramPhoto(referenceImage.base64, referenceImage.mime, leadData.name || "customer");
  }

  const promises = [
    saveLeadToMongoDB(leadData),
    sendWhatsAppNotification(leadData),
  ];

  try {
    await Promise.allSettled(promises);
    console.log("[Lead Processing] All automations completed");
  } catch (error) {
    console.error("[Lead Processing] Error in automations:", error);
  }
}

/**
 * ✅ FIX: Fast-book fallback message shown to the user when the AI API is
 * completely unavailable (both primary + fallback model calls failed).
 * Uses an env var for the direct contact number so it's configurable
 * without a code change.
 */
function buildFastBookFallbackMessage(): string {
  const bookingPhone =
    process.env.BOOKING_PHONE_DISPLAY || process.env.TELEGRAM_CHAT_ID ? process.env.BOOKING_PHONE_DISPLAY : undefined;
  const phoneLine = bookingPhone
    ? `"Ungaloda project details submit pannunga — team direct-a contact pannuvanga. ${bookingPhone}`
    : ``;

  return [
    "Ah sorry! 😅 Ippo AI system konjam busy-a irukku.",
    "",
    "Fast-ah project book pannanum na:",
    "🚀 Fast Book option use pannunga.",
    
    
  ].join("\n");
}

/**
 * Fetch published projects from Supabase for real-time project knowledge.
 * Returns a summary string that gets injected into the AI system prompt.
 */
async function fetchProjectsForAI(): Promise<string> {
  try {
    const projects = await projectDB.getAll();
    const published = projects.filter(p => p.status === 'published');

    if (published.length === 0) {
      return "No published projects available yet.";
    }

    const projectList = published.map((p, i) => {
      const techs = Array.isArray(p.technologies) && p.technologies.length > 0
        ? p.technologies.join(', ')
        : 'N/A';
      return `${i + 1}. "${p.title}" — Category: ${p.category} | Tech: ${techs} | ${p.description || 'No description'}`;
    }).join('\n');

    return `CRAFTCODE PUBLISHED PROJECTS (${published.length} total):\n${projectList}`;
  } catch (error) {
    console.error("[Chat] Failed to fetch projects for AI:", error);
    return "Project data temporarily unavailable.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, imageBase64, imageMime } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    // ── Rate Limit Check ──
    const rateLimitKey = getRateLimitKey(req);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      console.warn(`[Chat] Rate limit exceeded for IP: ${rateLimitKey}`);
      return NextResponse.json({
        text: "Too many requests! Please wait a minute and try again. 😊",
        leadCompleted: false,
        rateLimited: true,
      }, { status: 429 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // ✅ FIX: even with no API key configured at all, salvage the lead
      // instead of just returning a bare error.
      await sendTelegramFallbackAlert(messages);
      return NextResponse.json({
        text: buildFastBookFallbackMessage(),
        leadCompleted: false,
        aiDown: true,
      });
    }

    const referenceImage = imageBase64 && imageMime ? { base64: imageBase64, mime: imageMime } : null;

    // Fetch real-time project data from Supabase
    const projectData = await fetchProjectsForAI();

    // Build system prompt with project knowledge injected
    const systemPromptWithProjects = SYSTEM_PROMPT + "\n\n━━━━━━━━━━━━━━━━━━━━━━\n📊 LIVE PROJECT DATA\n━━━━━━━━━━━━━━━━━━━━━━\n" + projectData;

    const orMessages = [
      { role: "system", content: systemPromptWithProjects },
      {
        role: "assistant",
        content: "Hi! Welcome to CraftCode!\nChoose your language:\n1. English\n2. Tanglish (Tamil + English)",
      },
      ...messages.map((m: { role: string; content: string }, idx: number) => {
        const isLastUser = m.role === "user" && idx === messages.length - 1;
        if (isLastUser && imageBase64 && imageMime) {
          return {
            role: "user",
            content: [
              { type: "text", text: m.content || "Reference image share pannuren" },
              { type: "image_url", image_url: { url: `data:${imageMime};base64,${imageBase64}` } },
            ],
          };
        }
        return { role: m.role, content: m.content };
      }),
    ];

    // Primary AI call
    let orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CraftCode AI",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: orMessages,
        temperature: 0.85,
        max_tokens: 450,
        top_p: 0.9,
      }),
    });

    let rawText: string = "";

    if (!orRes.ok) {
      const errText = await orRes.text();
      console.error(`[Chat] OpenRouter error ${orRes.status}:`, errText);

      // ✅ Send Telegram alert when API credits/limit exhausted
      if (orRes.status === 402 || orRes.status === 429) {
        await sendTelegramApiLimitAlert(orRes.status, errText);
      }

      // Try fallback model for these specific error codes.
      if (orRes.status === 429 || orRes.status === 502 || orRes.status === 404) {
        console.log("[Chat] Attempting fallback model...");

        try {
          const fallbackRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
              "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "X-Title": "CraftCode AI",
            },
            body: JSON.stringify({
              model: "meta-llama/llama-3.1-8b-instruct:free",
              messages: orMessages.filter((m) => typeof m.content === "string"),
              temperature: 0.85,
              max_tokens: 450,
            }),
          });

          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            rawText = fallbackData?.choices?.[0]?.message?.content ?? "";

            if (rawText) {
              console.log("[Chat] Fallback model succeeded");
              const processed = processAIResponse(rawText);

              if (processed.leadCompleted) {
                await handleLeadCompletion(processed.leadData, referenceImage);
              }

              return NextResponse.json({
                text: processed.cleanedText || "Thank you for your response!",
                leadCompleted: processed.leadCompleted,
              });
            }
          }
        } catch (fallbackErr) {
          console.error("[Chat] Fallback model request threw:", fallbackErr);
        }
      }

      // ✅ FIX: BOTH primary and fallback failed (or errored) — instead of
      // just returning a bare 502 and losing the whole conversation, salvage
      // whatever we have and hand the user a fast-book CTA.
      await sendTelegramFallbackAlert(messages);
      return NextResponse.json({
        text: buildFastBookFallbackMessage(),
        leadCompleted: false,
        aiDown: true,
      });
    }

    // Success - parse primary response
    const orData = await orRes.json();
    rawText = orData?.choices?.[0]?.message?.content ?? "";

    if (!rawText) {
      // ✅ FIX: empty response from a 200 OK — still salvage instead of 502.
      await sendTelegramFallbackAlert(messages);
      return NextResponse.json({
        text: buildFastBookFallbackMessage(),
        leadCompleted: false,
        aiDown: true,
      });
    }

    const processed = processAIResponse(rawText);

    if (processed.leadCompleted) {
      await handleLeadCompletion(processed.leadData, referenceImage);
    }

    return NextResponse.json({
      text: processed.cleanedText || "Thank you for your response!",
      leadCompleted: processed.leadCompleted,
    });

  } catch (err) {
    console.error("[Chat] Error:", err);
    // ✅ FIX: even on an unexpected exception, try to salvage the lead using
    // whatever messages we already parsed off the request, if possible.
    try {
      const body = await req.json().catch(() => null);
      if (body?.messages && Array.isArray(body.messages)) {
        await sendTelegramFallbackAlert(body.messages);
      }
    } catch {
      // best-effort only
    }
    return NextResponse.json(
      {
        text: buildFastBookFallbackMessage(),
        leadCompleted: false,
        aiDown: true,
      },
      { status: 200 }
    );
  }
}






// import { NextRequest, NextResponse } from "next/server";

// const SYSTEM_PROMPT = `You are CraftCode's friendly AI project consultant. Speak in natural Tanglish (Tamil + English mix) — warm, respectful, casual like a trusted friend.

// ━━━━━━━━━━━━━━━━━━━━━━
// IDENTITY
// ━━━━━━━━━━━━━━━━━━━━━━
// Studio: CraftCode — Design & Development Agency
// Founder: Mr. Yaso
// If asked "owner / boss / founder yaar" → "Mr. Yaso — CraftCode founder! 🔥"
// Always respectful. Never "da/di" unless user uses it first.

// ━━━━━━━━━━━━━━━━━━━━━━
// CORE RULES
// ━━━━━━━━━━━━━━━━━━━━━━
// - ONE question at a time. Short replies — 2-3 lines max.
// - Never repeat answered questions.
// - Never collect unnecessary info — team will ask remaining details later.
// - If user says "anything / you decide / idea illa / don't know" → store "Need Consultation", move forward immediately.
// - Be conversational, never robotic.

// ━━━━━━━━━━━━━━━━━━━━━━
// 🚫 CRITICAL: NEVER SOUND LIKE A FORM (HIGHEST PRIORITY)
// ━━━━━━━━━━━━━━━━━━━━━━

// STRICTLY BANNED PATTERN:
// Never acknowledge a user's answer with the same repeated template like:
// "<value> noted 😊  <next question>"

// This makes the bot feel like a robotic form-filler, NOT a human consultant.

// ❌ WRONG (repetitive, robotic):
// "Number noted 😊 Business name enna?"
// "Murugesan noted 😊 Business enna industry?"
// "Outfit noted 😊 Logo style epdi venum?"

// ✅ CORRECT (natural, human, varied — react to what they actually said):
// "Super, Yaso! 😊 Ippo contact number share pannunga, team reach out panna."
// "Got it! Murugesan — nalla per 👍 Enna business, sollunga?"
// "Ah outfit brand-a, nice! 🔥 Logo style epdi venum — Modern, Minimal, Luxury, Bold, illa Playful?"
// "Perfect, 9360875121 save pannitten. Business name enna?"

// HOW TO ACKNOWLEDGE NATURALLY:
// - React specifically to the content, not just repeat it as "X noted"
// - Vary your opening every single time — never use the same acknowledgment phrase twice in a row
// - Use different natural fillers: "Super!", "Nice!", "Perfect!", "Got it!", "Ah okay!", "Semma!", "Great choice!", "Konjam interesting-a irukku!", or sometimes just move straight into the next question with zero filler
// - Sometimes react with a short relevant comment (e.g. "Outfit business-a, trending field 🔥") before asking next question
// - Sometimes skip acknowledgment entirely and flow straight into next question — this is GOOD, not every message needs an ack
// - NEVER use the literal word "noted" more than once in the entire conversation

// Before sending any message, check: "Did I just say '<value> noted' again?" If yes — REWRITE using a different natural reaction.

// ━━━━━━━━━━━━━━━━━━━━━━
// WHAT TO NEVER ASK
// ━━━━━━━━━━━━━━━━━━━━━━
// NEVER ask for: Email, Gmail, languages, hosting preference, SEO separately, CMS separately, admin panel separately.
// These are team's job — not chatbot's job.
// Keep it simple. Team will handle deep discovery in the call.

// =========================================
// ABSOLUTE RULE — ONE MESSAGE = ONE QUESTION
// =========================================

// Every chatbot message must have ONLY ONE purpose.
// Every chatbot message must ask ONLY ONE question.
// Never combine multiple questions in one reply.

// =========================================
// WRONG EXAMPLES
// =========================================
// ❌
// Business name enna?
// Current website irukka?

// ❌
// Name enna?
// Phone number share pannunga?

// ❌
// Business enna?
// Budget evalo?

// ❌
// Website irukka?
// Purpose enna?
// Features enna?

// =========================================
// CORRECT EXAMPLES
// =========================================

// Bot:
// Business name enna? 😊

// User:
// ABC Interiors

// Bot:
// Nice name! Current website edhavadhu irukka?

// User:
// No

// Bot:
// Okay! Main purpose enna — showcase, booking, products sell panna, illa vera edhavathu?

// =========================================
// FLOW RULES
// =========================================

// After EVERY user reply:
// 1. Extract all information.
// 2. Mark collected fields.
// 3. Find ONLY the next unanswered field.
// 4. Ask ONLY that field — with a natural, varied reaction (see banned-pattern section above), not a template.

// Never jump ahead. Never ask two questions.

// =========================================
// QUESTION LIMIT
// =========================================
// Maximum: ONE question mark (?) per message.
// One conversational objective. One input from the user.

// =========================================
// IF MULTIPLE DETAILS ARE ALREADY GIVEN
// =========================================
// Example
// User: Business name ABC Interiors. Website illa.
// Store BOTH.
// Next ask ONLY: Main purpose enna? 😊
// Do NOT ask "Current website irukka?" again.

// =========================================
// WHEN USER ASKS A QUESTION
// =========================================
// Pause the flow. Answer completely. Resume from the previous unanswered question.
// Do NOT combine the answer with another new question unless it naturally ends with resuming the single pending question.

// =========================================
// QUALITY
// =========================================
// The chatbot should feel like a human consultant. Never like a Google Form.
// Never overwhelm users. Short. Natural Tanglish. One message. One question. One step at a time.
// This rule has the highest priority and overrides all other flow rules.

// ━━━━━━━━━━━━━━━━━━━━━━
// UNIVERSAL FLOW (all services)
// ━━━━━━━━━━━━━━━━━━━━━━

// STEP 1 — Detect what they need
// If unclear → "Enna type project plan pannirukeenga?"

// STEP 2 — Name
// "Ungal per enna?"

// STEP 3 — Phone
// "Contact number share pannunga, team reach out panna"

// STEP 4 — Service-specific core questions (see below — minimum only)

// STEP 5 — Requirements (open ended)
// "Vera specific requirements or ideas irundha sollunga?"
// If "nothing / you decide" → store "Team will discuss"

// STEP 6 — Budget
// 🚫 Do NOT proactively ask the user for their budget. This is no longer a
// standard flow question. After Step 5 (requirements), if the user hasn't
// brought up budget themselves, move straight to closing/completion.
// ONLY discuss budget if the USER mentions it first (an amount, "budget evalo",
// "how much", "cost enna", "price sollunga", etc.) — then follow the
// BUDGET NEGOTIATION RULES below.
// If budget is never mentioned by the user, store budget as "Not discussed"
// and do not bring it up yourself at any point.

// ━━━━━━━━━━━━━━━━━━━━━━
// STEP 7 — MANDATORY FINAL CONFIRMATION (before any closing / [LEAD_COMPLETE])
// ━━━━━━━━━━━━━━━━━━━━━━

// This step is NOT optional and CANNOT be skipped, no matter how the
// conversation feels like it's winding down.

// Once Requirements (Step 5) and any budget discussion are done, do NOT
// immediately say a goodbye-sounding line like "Have a great day", "Team will
// connect soon", "Thanks for choosing CraftCode", etc. Saying that BEFORE the
// lead is actually confirmed and sent tricks the user into thinking the
// enquiry is already done — they stop replying, and the lead silently never
// reaches the team.

// Instead, your NEXT message after requirements/budget must ALWAYS be a
// confirmation readback — showing the collected name and phone number back to
// the user and asking them to confirm it's correct:

// Example:
// "Ok Kavin! Confirm pannunga — Name: Kavin, Number: 3928734834. Correct-a? 😊
// Correct-na 'yes' sollunga, thappா irundha correct number/name sollunga."

// Rules for this step:
// - Show ONLY name + phone (the two fields a wrong entry would actually break).
// - Do NOT add any closing phrase ("have a great day", "team will contact
//   you", "thanks") in this same message — this message's ONLY job is to ask
//   for confirmation, nothing else.
// - Wait for the user's reply to THIS SPECIFIC message.
// - If the user replies with a correction (a different name or number), store
//   the corrected value and show the confirmation readback AGAIN with the
//   updated details. Keep looping until confirmed.
// - If the user confirms (e.g. "yes", "correct", "sari", "okay", "confirm"),
//   THEN — and only then — send the real closing message (goodbye line +
//   [LEAD_COMPLETE] + [LEAD_DATA] tags) in that same reply.

// A generic "ok" or "thanks" earlier in the conversation (e.g. right after a
// budget or requirements message) must NEVER be treated as completing the
// lead. Only an affirmative reply that directly follows the Step 7
// confirmation readback triggers [LEAD_COMPLETE].

// ━━━━━━━━━━━━━━━━━━━━━━
// BUDGET NEGOTIATION RULES (CRITICAL) — ONLY when the user initiates budget talk
// ━━━━━━━━━━━━━━━━━━━━━━

// IMPORTANT: Do NOT complete lead immediately after receiving budget.
// IMPORTANT: Never bring up budget unprompted, even after this section is
// triggered once — if the user moves on to another topic, don't circle back
// to ask about budget again unless they raise it again.

// When user mentions a budget amount:
// 1. Acknowledge it conversationally (naturally, not "₹X noted")
// 2. Ask if they want to discuss or adjust
// 3. Wait for their response

// Budget negotiation flow:

// User gives budget (e.g., "10000"):
// Bot: "₹10,000 — okay super! 😊 Idhu final budget-a, illa konjam discuss pannalama?"

// If user responds with another amount (e.g., "5000" or "3000"):
// Bot: "₹5,000-la simple landing page or basic website pannalam. 😊
// 3D models, premium animations, custom UI, advanced features venumna budget konjam increase agum.
// Ungal budget-ku suitable option discuss pannalaam.
// Enna type project venumnu sonna, best suggestion tharen!"

// If user asks for discount or reduction:
// Bot: "Minimum ₹3,000 — adhukku simple website or logo design pannalam.
// Advanced features like e-commerce, animations, custom dashboard venumna budget adjust pannanum.
// Features reduce panni ungal budget-ku match pannalaam!
// Enna venumnu sollunga, alternatives suggest pannuren."

// Minimum project value: ₹3,000
// NEVER say: "₹3,000 is too low."
// Instead say: "₹3,000 is the minimum starting price for simple projects."

// PRICING REFERENCE (mention only if they ask):
// Logo: ₹3,000 – ₹8,000
// Logo + Branding: ₹8,000 – ₹20,000
// Landing page: ₹5,000 – ₹8,000
// Portfolio: ₹8,000 – ₹15,000
// Business website: ₹15,000 – ₹35,000
// E-commerce: ₹30,000 – ₹80,000
// Mobile app: ₹50,000 – ₹2,00,000
// Minimum: ₹3,000

// Negotiation: Never below ₹3,000. Scope down features. Offer 50% advance if needed.
// Never repeat same pricing paragraph multiple times.

// ━━━━━━━━━━━━━━━━━━━━━━
// LEAD COMPLETION RULES (CRITICAL)
// ━━━━━━━━━━━━━━━━━━━━━━

// ONLY mark lead as complete [LEAD_COMPLETE] when conversation is genuinely
// finished AND the Step 7 confirmation readback (name + phone shown back to
// the user) has been sent and the user has affirmatively replied to it.
// [LEAD_COMPLETE] must never appear before Step 7's confirmation message has
// been shown at least once.

// Completion triggers (user says, IN REPLY TO the Step 7 confirmation message):
// - "okay" / "fine" / "correct" / "sari" / "confirm"
// - "proceed" / "yes proceed" / "go ahead"
// - "contact me" / "call me" / "reach out pannunga"
// - "okay team call pannunga"
// - "thanks" / "thank you" / "done"
// - Any clear affirmative reply to the confirmation readback

// DO NOT complete lead when:
// - The Step 7 confirmation readback hasn't been sent yet (this takes
//   priority over every other trigger below)
// - User just gave budget (wait for the budget-adjust question's answer)
// - User is negotiating price
// - User asks questions about pricing
// - User says another budget amount
// - User asks "what about X feature"
// - User is still engaged in conversation
// - The user's "okay"/"thanks" was a reply to something OTHER than the Step 7
//   confirmation message (e.g. a reply to a requirements or budget question) —
//   in that case, respond naturally and then move into Step 7 instead of
//   completing.

// After user gives budget, ALWAYS ask (naturally, not templated): "Idhu final budget-a, illa konjam discuss pannalama?"
// Wait for their affirmative response, THEN proceed to the Step 7 confirmation
// readback before completing.

// ━━━━━━━━━━━━━━━━━━━━━━
// SERVICE-SPECIFIC QUESTIONS (minimum only)
// ━━━━━━━━━━━━━━━━━━━━━━

// BRANDING:
// Q1: "Logo already irukka?" (Yes/No)
//   If YES → "Logo redesign venum-ah, or branding (colors/fonts/guidelines) mattum venum?"
//   If NO → "Logo also design pannanum-ah?"
//     If YES → "Style epdi venum? (Modern / Minimal / Luxury / Bold / Playful / Corporate)"
//               "Preferred colors?"
//               "Reference logo edhavadhu irukka — vera brand logo pidichirundha, illa idea irundha? Irundha image share pannunga, illana no problem 😊" (Yes/No — if they share an image or describe one, store details; if No, store "No reference")
//               "Slogan irukka? Illana team suggest pannuvom"
// Q2: "Ungal business pathi konjam sollunga — enna sell pannuveengala?"
//   If "idea illa/you suggest" → "No worries! Team discuss pannuvom 😊" → store "Need Consultation"

// LOGO DESIGN:
// Q1: "Business name + enna industry?"
// Q2: "Style? (Modern / Minimal / Luxury / Bold / Playful)"
// Q3: "Preferred colors?"
// Q4: "Reference logo edhavadhu irukka — vera brand logo pidichirundha, illa idea irundha? Irundha image share pannunga, illana no problem 😊" (Yes/No — if they share an image or describe one, store details; if No, store "No reference")
// Q5: "Slogan irukka? Illana team create pannuvom"

// WEBSITE / E-COMMERCE / PORTFOLIO:
// Q1: "Business name?"
// Q2: "Current website irukka?" (Yes/No)
// Q3: "Main purpose enna — showcase, sell products, appointments, or general info?"
// Q4: "Any specific features venum? (e.g. booking, payment, gallery, blog)"
//   If "you decide/don't know" → store "Team will suggest"

// MOBILE APP:
// Q1: "App enna purpose — customer facing or internal use?"
// Q2: "Main features enna venum?"

// UI/UX:
// Q1: "Existing product redesign-ah or new design-ah?"
// Q2: "How many screens/pages roughly?"

// SEO / DIGITAL MARKETING:
// Q1: "Current website irukka?"
// Q2: "Main goal — more traffic, leads, or sales?"

// OTHER:
// Q1: "Project enna — describe pannunga"

// ━━━━━━━━━━━━━━━━━━━━━━
// TAGS (add at very end of closing message only)
// ━━━━━━━━━━━━━━━━━━━━━━
// [LEAD_COMPLETE]
// [LEAD_DATA:{"name":"...","phone":"...","service":"...","logoExists":"...","hasReferenceLogo":"...","brandStyle":"...","preferredColors":"...","slogan":"...","brandInfo":"...","websiteType":"...","currentWebsite":"...","purpose":"...","features":"...","budget":"...","requirements":"..."}]

// Only include fields that were actually collected. Skip empty ones.
// Add these tags ONLY when conversation is genuinely complete.`;

// // Types
// interface LeadData {
//   name?: string;
//   phone?: string;
//   service?: string;
//   logoExists?: string;
//   hasReferenceLogo?: string;
//   brandStyle?: string;
//   preferredColors?: string;
//   slogan?: string;
//   brandInfo?: string;
//   websiteType?: string;
//   currentWebsite?: string;
//   purpose?: string;
//   features?: string;
//   budget?: string;
//   requirements?: string;
//   [key: string]: string | undefined;
// }

// interface ProcessedAIResponse {
//   cleanedText: string;
//   leadCompleted: boolean;
//   leadData: LeadData | null;
// }

// /**
//  * Extract LEAD_DATA JSON from AI response
//  */
// function extractLeadData(text: string): LeadData | null {
//   try {
//     const match = text.match(/\[LEAD_DATA:\s*(\{[\s\S]*?\})\s*\]/);
//     if (!match || !match[1]) return null;

//     const jsonStr = match[1];
//     const parsed = JSON.parse(jsonStr) as LeadData;
//     return parsed;
//   } catch (error) {
//     console.error("[Lead Extraction] Failed to parse LEAD_DATA:", error);
//     return null;
//   }
// }

// /**
//  * Check if LEAD_COMPLETE exists in response
//  */
// function hasLeadComplete(text: string): boolean {
//   return /\[LEAD_COMPLETE\]/.test(text);
// }

// /**
//  * Remove all internal tags from AI response
//  */
// function cleanAIResponse(text: string): string {
//   // Remove LEAD_COMPLETE
//   let cleaned = text.replace(/\[LEAD_COMPLETE\]\s*/g, '');

//   // Remove LEAD_DATA with JSON (including whitespace variations)
//   cleaned = cleaned.replace(/\[LEAD_DATA:\s*\{[\s\S]*?\}\s*\]/g, '');

//   // Clean up extra whitespace
//   cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

//   return cleaned;
// }

// /**
//  * Process AI response: extract data, clean, and trigger automations
//  */
// function processAIResponse(rawText: string): ProcessedAIResponse {
//   const leadCompleted = hasLeadComplete(rawText);
//   const leadData = extractLeadData(rawText);
//   const cleanedText = cleanAIResponse(rawText);

//   return {
//     cleanedText,
//     leadCompleted,
//     leadData,
//   };
// }

// /**
//  * Send Telegram text notification for new lead
//  */
// async function sendTelegramNotification(leadData: LeadData): Promise<boolean> {
//   const botToken = process.env.TELEGRAM_BOT_TOKEN;
//   const chatId = process.env.TELEGRAM_CHAT_ID;

//   if (!botToken || !chatId) {
//     console.warn("[Telegram] Missing credentials, skipping notification");
//     return false;
//   }

//   try {
//     const message = formatLeadMessage(leadData);
//     const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text: message,
//         parse_mode: "HTML",
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.text();
//       console.error("[Telegram] Failed to send:", error);
//       return false;
//     }

//     console.log("[Telegram] Notification sent successfully");
//     return true;
//   } catch (error) {
//     console.error("[Telegram] Error:", error);
//     return false;
//   }
// }

// /**
//  * ✅ FIX: Send the actual reference image to Telegram as a photo.
//  * Previously this route only ever sent a text summary ("📎 Reference Logo: Yes")
//  * and never forwarded the real image the user uploaded, even though the image
//  * data was available on the request that produced the final [LEAD_COMPLETE].
//  * Telegram's sendPhoto needs multipart/form-data, not JSON, so we decode the
//  * base64 string into a Buffer and upload it as a file.
//  */
// async function sendTelegramPhoto(
//   imageBase64: string,
//   imageMime: string,
//   leadName: string
// ): Promise<boolean> {
//   const botToken = process.env.TELEGRAM_BOT_TOKEN;
//   const chatId = process.env.TELEGRAM_CHAT_ID;

//   if (!botToken || !chatId) {
//     console.warn("[Telegram] Missing credentials, skipping photo notification");
//     return false;
//   }

//   try {
//     const buffer = Buffer.from(imageBase64, "base64");
//     const ext = imageMime.split("/")[1] || "jpg";

//     const formData = new FormData();
//     formData.append("chat_id", chatId);
//     formData.append("caption", `📎 Reference logo image from ${leadName || "customer"}`);
//     formData.append("photo", new Blob([new Uint8Array(buffer)], { type: imageMime }), `reference.${ext}`);

//     const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
//     const response = await fetch(url, { method: "POST", body: formData });

//     if (!response.ok) {
//       const error = await response.text();
//       console.error("[Telegram] Failed to send photo:", error);
//       return false;
//     }

//     console.log("[Telegram] Photo sent successfully");
//     return true;
//   } catch (error) {
//     console.error("[Telegram] Photo error:", error);
//     return false;
//   }
// }

// /**
//  * Format lead data for Telegram message
//  */
// function formatLeadMessage(leadData: LeadData): string {
//   const lines = [
//     "🆕 <b>New Lead from CraftCode AI</b>",
//     "━━━━━━━━━━━━━━━━",
//   ];

//   const fields: Record<string, string> = {
//     name: "👤 Name",
//     phone: "📱 Phone",
//     service: "🔧 Service",
//     logoExists: "🖼️ Logo Exists",
//     hasReferenceLogo: "📎 Reference Logo",
//     brandStyle: "🎨 Brand Style",
//     preferredColors: "🎯 Preferred Colors",
//     slogan: "📝 Slogan",
//     brandInfo: "ℹ️ Brand Info",
//     websiteType: "🌐 Website Type",
//     currentWebsite: "🔗 Current Website",
//     purpose: "🎯 Purpose",
//     features: "⚙️ Features",
//     budget: "💰 Budget",
//     requirements: "📋 Requirements",
//   };

//   let hasData = false;
//   for (const [key, label] of Object.entries(fields)) {
//     const value = leadData[key];
//     if (value && value.trim() && value !== "Not specified" && value !== "Need Consultation") {
//       lines.push(`${label}: ${value}`);
//       hasData = true;
//     }
//   }

//   // If no meaningful data, add a note
//   if (!hasData) {
//     lines.push("📝 Details collected, team will follow up");
//   }

//   lines.push("━━━━━━━━━━━━━━━━");
//   lines.push(`🕐 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

//   return lines.join("\n");
// }

// /**
//  * Save lead to MongoDB (placeholder for future implementation)
//  */
// async function saveLeadToMongoDB(leadData: LeadData): Promise<boolean> {
//   // TODO: Implement MongoDB integration
//   console.log("[MongoDB] Would save lead:", leadData);
//   return true;
// }

// /**
//  * Send WhatsApp notification (placeholder for future implementation)
//  */
// async function sendWhatsAppNotification(leadData: LeadData): Promise<boolean> {
//   // TODO: Implement WhatsApp Business API integration
//   console.log("[WhatsApp] Would send notification for lead:", leadData);
//   return true;
// }

// /**
//  * Handle lead completion: trigger all automations
//  * ✅ FIX: now accepts the reference image (if any was shared during the
//  * conversation) and forwards it to Telegram right after the text summary.
//  */
// async function handleLeadCompletion(
//   leadData: LeadData | null,
//   referenceImage?: { base64: string; mime: string } | null
// ): Promise<void> {
//   if (!leadData) {
//     console.warn("[Lead Processing] No lead data extracted, skipping automations");
//     return;
//   }

//   console.log("[Lead Processing] Processing new lead:", leadData);

//   // Send text notification first, then the photo (Telegram requires
//   // separate calls — captions on sendPhoto are limited and we want the
//   // full formatted lead card regardless of image size/type).
//   const textSent = await sendTelegramNotification(leadData);

//   if (textSent && referenceImage?.base64 && referenceImage?.mime) {
//     await sendTelegramPhoto(referenceImage.base64, referenceImage.mime, leadData.name || "customer");
//   }

//   const promises = [
//     saveLeadToMongoDB(leadData),
//     sendWhatsAppNotification(leadData),
//   ];

//   try {
//     await Promise.allSettled(promises);
//     console.log("[Lead Processing] All automations completed");
//   } catch (error) {
//     console.error("[Lead Processing] Error in automations:", error);
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { messages, imageBase64, imageMime } = body;

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json({ error: "messages array required" }, { status: 400 });
//     }

//     const apiKey = process.env.OPENROUTER_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
//     }

//     // ✅ FIX: the reference image is available on THIS request's body
//     // because the frontend now resends the last-known image on every turn
//     // (see book-project page fix). Keep it handy so that if this exact
//     // request is the one that produces [LEAD_COMPLETE], we can forward the
//     // real image to Telegram instead of just a "Yes" text field.
//     const referenceImage = imageBase64 && imageMime ? { base64: imageBase64, mime: imageMime } : null;

//     const orMessages = [
//       { role: "system", content: SYSTEM_PROMPT },
//       {
//         role: "assistant",
//         content: "Vanakkam! CraftCode-la welcome! 😊\n\nWebsite, logo, branding, app — enna project plan pannirukeenga?",
//       },
//       ...messages.map((m: { role: string; content: string }, idx: number) => {
//         const isLastUser = m.role === "user" && idx === messages.length - 1;
//         if (isLastUser && imageBase64 && imageMime) {
//           return {
//             role: "user",
//             content: [
//               { type: "text", text: m.content || "Reference image share pannuren" },
//               { type: "image_url", image_url: { url: `data:${imageMime};base64,${imageBase64}` } },
//             ],
//           };
//         }
//         return { role: m.role, content: m.content };
//       }),
//     ];

//     // Primary AI call
//     let orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${apiKey}`,
//         "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
//         "X-Title": "CraftCode AI",
//       },
//       body: JSON.stringify({
//         model: "openrouter/auto",
//         messages: orMessages,
//         temperature: 0.85,
//         max_tokens: 450,
//         top_p: 0.9,
//       }),
//     });

//     let rawText: string = "";

//     // Handle fallback if primary model fails
//     if (!orRes.ok) {
//       const errText = await orRes.text();
//       console.error(`[Chat] OpenRouter error ${orRes.status}:`, errText);

//       // Only attempt fallback for specific error codes
//       if (orRes.status === 429 || orRes.status === 502 || orRes.status === 404) {
//         console.log("[Chat] Attempting fallback model...");

//         const fallbackRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${apiKey}`,
//             "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
//             "X-Title": "CraftCode AI",
//           },
//           body: JSON.stringify({
//             model: "meta-llama/llama-3.1-8b-instruct:free",
//             messages: orMessages.filter(m => typeof m.content === "string"),
//             temperature: 0.85,
//             max_tokens: 450,
//           }),
//         });

//         if (fallbackRes.ok) {
//           const fallbackData = await fallbackRes.json();
//           rawText = fallbackData?.choices?.[0]?.message?.content ?? "";

//           if (rawText) {
//             console.log("[Chat] Fallback model succeeded");
//             // Process the response from fallback model
//             const processed = processAIResponse(rawText);

//             // Trigger automations if lead completed
//             if (processed.leadCompleted) {
//               await handleLeadCompletion(processed.leadData, referenceImage);
//             }

//             return NextResponse.json({
//               text: processed.cleanedText || "Thank you for your response!",
//               leadCompleted: processed.leadCompleted,
//             });
//           }
//         }
//       }

//       return NextResponse.json({ error: "AI service error" }, { status: 502 });
//     }

//     // Success - parse primary response
//     const orData = await orRes.json();
//     rawText = orData?.choices?.[0]?.message?.content ?? "";

//     if (!rawText) {
//       return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
//     }

//     // Process the AI response
//     const processed = processAIResponse(rawText);

//     // Trigger automations if lead completed
//     if (processed.leadCompleted) {
//       await handleLeadCompletion(processed.leadData, referenceImage);
//     }

//     // Return clean response without internal tags
//     return NextResponse.json({
//       text: processed.cleanedText || "Thank you for your response!",
//       leadCompleted: processed.leadCompleted,
//     });

//   } catch (err) {
//     console.error("[Chat] Error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }