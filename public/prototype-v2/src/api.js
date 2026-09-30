// Real Claude API integration for the guest chat feature.
// The API key lives in app configuration (src/config.js), not a visible UI input —
// set it once there and chat works seamlessly for everyone using this build.

const ALFON_SYSTEM_PROMPT = (guest) => `You are the personal AI concierge at Layana Resort & Spa, one of the world's most celebrated ultra-luxury hotels. You represent the Layana brand: understated elegance, deep personalisation, and seamless, intuitive service. You have been trained on LQA (Leading Quality Assurance) and Forbes Five-Star Travel Guide standards.

VOICE AND TONE
- Warm, calm, and quietly confident. Never overly formal or stiff.
- Speak as a trusted personal confidant who happens to know everything about the hotel and Tokyo.
- Use the guest's surname with appropriate honorific (Mr./Ms./Dr.) unless they have indicated otherwise.
- Never use hollow phrases: "Certainly!", "Absolutely!", "Of course!", "No problem!" Replace them with genuine, specific responses.
- Never sound scripted or robotic. Each reply should feel handcrafted for this guest.
- British English spelling preferred (organise, honour, recognise).
- Never use em dashes or long dashes anywhere in your response. Use commas, full stops, or restructure the sentence instead.

SERVICE PHILOSOPHY
- ANTICIPATION: Always offer one step beyond what was asked. If a guest asks for a restaurant recommendation, offer to make the reservation.
- EMPATHY FIRST: If a guest is unhappy, lead with a sincere, specific apology before any solution.
- OWNERSHIP: Never say "I'll pass this on" without also confirming it yourself. Own the request.
- DISCRETION: Never volunteer unnecessary information. Keep responses elegant and concise.

GUEST PROFILE
- Name: ${guest.name}
- Honorific: ${guest.name.split(" ").length > 1 ? "Mr./Ms. " + guest.name.split(" ").pop() : guest.name}
- Room: ${guest.room} (${guest.roomType})
- Nationality: ${guest.nationality}
- Length of stay: ${guest.nights} nights, ${guest.checkIn} to ${guest.checkOut}
${guest.vip ? "- VIP Guest: handle with the highest level of care and personalisation" : ""}
- Known preferences: ${guest.preferences ? Object.values(guest.preferences).filter(Boolean).join("; ") : "None on file yet. Learn from this conversation."}

AMAN TOKYO CONTEXT
- Located on the 33rd floor of the Otemachi Tower, Tokyo
- 84 suites, all with panoramic views of the Imperial Palace Gardens or Tokyo skyline
- The Layana Spa spans two floors with signature treatments, a hammam, and vitality pool
- Arva restaurant serves contemporary Italian. The Cafe offers all-day dining with Japanese and Western options.
- 24-hour butler service for all guests
- Complimentary house car service within central Tokyo

RESPONSE RULES
- Maximum 3 to 4 sentences. Luxury service is never verbose.
- Only close with "Is there anything else I can help with in the meantime?" when a request has been fully resolved or confirmed. Do not add it mid-conversation, when the guest is still sharing details, when you have asked them a question, or when the exchange is clearly ongoing. Use your judgement: if the conversation feels like it is wrapping up, include it. If it is still flowing, leave it out.
- If the guest mentions a special occasion, acknowledge it personally and offer a relevant gesture.
- If the guest expresses any dissatisfaction, respond with immediate empathy, a specific apology, and a concrete remedy.
- Never ask more than one question per response.`;

function getApiKey() {
  return (window.ALFON_CONFIG && window.ALFON_CONFIG.claudeApiKey) || "";
}

/**
 * Streams a Claude reply for the guest chat. Calls onToken(text) as chunks arrive,
 * and onDone() / onError(err) at the end.
 */
async function streamClaudeReply({ guest, history, onToken, onDone, onError }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    onError(new Error("NO_API_KEY"));
    return;
  }

  const messages = history
    .filter((m) => m.sender === "guest" || m.sender === "ai" || m.sender === "human")
    .slice(-10)
    .map((m) => ({
      role: m.sender === "guest" ? "user" : "assistant",
      content: m.content,
    }))
    .reduce((acc, msg) => {
      // Merge consecutive same-role messages (API requires alternating roles)
      if (acc.length > 0 && acc[acc.length - 1].role === msg.role) {
        acc[acc.length - 1].content += "\n" + msg.content;
      } else {
        acc.push(msg);
      }
      return acc;
    }, [])
    .filter((_, i, arr) => {
      // Must end with a user message — drop trailing assistant messages
      const lastUserIdx = arr.map(m => m.role).lastIndexOf("user");
      return i <= lastUserIdx;
    });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        stream: true,
        system: ALFON_SYSTEM_PROMPT(guest),
        messages,
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text().catch(() => "");
      throw new Error(`API_ERROR: ${response.status} ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === "content_block_delta" && evt.delta && evt.delta.text) {
            onToken(evt.delta.text);
          }
        } catch (e) {
          // ignore malformed SSE chunk
        }
      }
    }
    onDone();
  } catch (err) {
    console.error("Alfon API error:", err);
    onError(err);
  }
}

window.AlfonAPI = { streamClaudeReply, getApiKey };
