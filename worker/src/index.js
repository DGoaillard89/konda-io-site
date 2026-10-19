// Konda enquiry relay.
// Receives the website's "Get in touch" form and creates a record in Airtable.
// The Airtable token lives here as a secret (AIRTABLE_TOKEN), never in the website.

const LIMITS = { name: 120, email: 200, phone: 40, postcode: 12, message: 5000, enquiryType: 50 };

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
    const reply = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply(405, { error: "Method not allowed" });
    if (!allowed.includes(origin)) return reply(403, { error: "Forbidden" });

    let data;
    try {
      data = await request.json();
    } catch {
      return reply(400, { error: "Invalid JSON" });
    }

    // Spam trap filled in: pretend it worked, store nothing
    if (data.company_website) return reply(200, { ok: true });

    const clean = {};
    for (const [key, max] of Object.entries(LIMITS)) {
      const value = typeof data[key] === "string" ? data[key].trim() : "";
      if (!value) return reply(400, { error: `Missing ${key}` });
      clean[key] = value.slice(0, max);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return reply(400, { error: "Invalid email" });

    // Map form values to Airtable column names (set in wrangler.toml)
    const fields = {
      [env.FIELD_NAME]: clean.name,
      [env.FIELD_EMAIL]: clean.email,
      [env.FIELD_PHONE]: clean.phone,
      [env.FIELD_POSTCODE]: clean.postcode,
      [env.FIELD_ENQUIRY_TYPE]: clean.enquiryType,
      [env.FIELD_MESSAGE]: clean.message,
    };
    // CRM extras so the enquiry appears in the interface: starting status and owner.
    // If Airtable rejects either, the enquiry is still saved without them.
    const extras = {};
    if (env.FIELD_STATUS && env.STATUS_VALUE) extras[env.FIELD_STATUS] = env.STATUS_VALUE;
    if (env.FIELD_LEAD_OWNER && env.LEAD_OWNER_EMAIL) extras[env.FIELD_LEAD_OWNER] = { email: env.LEAD_OWNER_EMAIL };
    // Which site the enquiry came from, as a bare domain, e.g. "konda.io". Taken from
    // the Origin header, which is already checked against ALLOWED_ORIGINS above.
    const website = {};
    if (env.FIELD_WEBSITE) website[env.FIELD_WEBSITE] = new URL(origin).hostname.replace(/^www\./, "");

    const save = (fields) =>
      fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(env.AIRTABLE_TABLE)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      });

    // Try with everything, then drop the optional extras one group at a time,
    // so a missing or renamed column never loses the enquiry itself.
    const attempts = [{ ...fields, ...extras, ...website }, { ...fields, ...extras }, fields];
    let res;
    for (const [i, attempt] of attempts.entries()) {
      if (i > 0 && Object.keys(attempt).length === Object.keys(attempts[i - 1]).length) continue;
      res = await save(attempt);
      if (res.ok) break;
      console.error("Airtable rejected attempt", i, res.status, await res.text());
    }

    if (!res.ok) {
      return reply(502, { error: "Could not save enquiry" });
    }
    return reply(200, { ok: true });
  },
};
