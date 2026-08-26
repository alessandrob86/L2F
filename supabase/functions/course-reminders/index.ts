// Recuperato dal server il 26 agosto 2026 perché mancava dal repository.
// È il codice in produzione così com'è: può differire da come lo si scriverebbe oggi.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };
function json(b: unknown, s = 200): Response { return new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } }); }

const LOGOS: Record<string,string> = {
  AUTOMOTIVE: "https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/automotive.png",
  ACADEMY: "https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/academy.png",
};
function l2fEmail(o: { brand?: string; pre: string; heading: string; body: string; ctaLabel?: string; ctaUrl?: string }): string {
  const brand = o.brand ?? "AUTOMOTIVE";
  const logo = LOGOS[brand] ?? LOGOS.AUTOMOTIVE;
  const cta = o.ctaUrl ? `<div style="margin-top:26px"><a href="${o.ctaUrl}" style="display:inline-block;background:#C32327;color:#fff;text-decoration:none;font-weight:700;padding:14px 30px;border-radius:999px;box-shadow:0 6px 18px rgba(195,35,39,0.4)">${o.ctaLabel ?? "Apri"}</a></div>` : "";
  return `<!doctype html><html><body style="margin:0;background:#07080b;font-family:Arial,Helvetica,sans-serif">`+
  `<div style="display:none;max-height:0;overflow:hidden">${o.pre}</div>`+
  `<table width="100%" cellpadding="0" cellspacing="0" style="background:#07080b;padding:28px 0"><tr><td align="center">`+
  `<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#12141a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">`+
  `<tr><td style="background:#0e0f14;border-top:5px solid #C32327;padding:22px 28px"><img src="${logo}" alt="L2F ${brand}" height="42" style="display:block;height:42px;width:auto;border:0;outline:none"/></td></tr>`+
  `<tr><td style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,#C32327,#E0312F 55%,#7a1518)">&nbsp;</td></tr>`+
  `<tr><td style="padding:32px 30px"><h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;border-left:3px solid #C32327;padding-left:13px">${o.heading}</h1><div style="font-size:15px;line-height:1.65;color:#c8ccd4">${o.body}</div>${cta}</td></tr>`+
  `<tr><td style="padding:18px 30px;border-top:1px solid rgba(195,35,39,0.25);font-size:12px;color:#8a93a3">L2F Automotive · Centro Ricambi Auto Srl · Napoli · <span style="color:#E0312F">info@l2f.it</span></td></tr>`+
  `</table></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const secret = req.headers.get("x-cron-secret");
    const { data: cfg } = await admin.from("app_config").select("value").eq("key", "cron_secret").maybeSingle();
    if (!secret || !cfg || secret !== cfg.value) return json({ error: "unauthorized" }, 401);
    const { data: siteCfg } = await admin.from("app_config").select("value").eq("key", "site_url").maybeSingle();
    const siteUrl = siteCfg?.value || "https://www.l2f.it";
    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("CONTACT_FROM") ?? "L2F <info@l2f.it>";
    const now = Date.now();
    const within = new Date(now + 8 * 86400000).toISOString();
    const { data: corsi } = await admin.from("corsi").select("id, titolo, data_corso, sede, durata").eq("attivo", true).not("data_corso", "is", null).gte("data_corso", new Date(now).toISOString()).lte("data_corso", within);
    let sent = 0;
    for (const c of corsi ?? []) {
      const giorni = Math.ceil((new Date((c as any).data_corso).getTime() - now) / 86400000);
      const soglia = giorni <= 1 ? "1g" : (giorni <= 7 ? "7g" : null);
      if (!soglia) continue;
      const { data: iscr } = await admin.from("iscrizioni_corsi").select("id, officine(email, ragione_sociale)").eq("corso_id", (c as any).id);
      const ids = (iscr ?? []).map((i: any) => i.id);
      if (!ids.length) continue;
      const { data: done } = await admin.from("corso_promemoria").select("iscrizione_id").eq("soglia", soglia).in("iscrizione_id", ids);
      const doneSet = new Set((done ?? []).map((d: any) => d.iscrizione_id));
      const dataStr = new Date((c as any).data_corso).toLocaleString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
      const quando = giorni <= 1 ? "domani" : `tra ${giorni} giorni`;
      for (const i of iscr ?? []) {
        if (doneSet.has((i as any).id)) continue;
        const off = (i as any).officine; const email = Array.isArray(off) ? off[0]?.email : off?.email; const nome = Array.isArray(off) ? off[0]?.ragione_sociale : off?.ragione_sociale;
        if (!email || !RESEND) continue;
        const html = l2fEmail({ brand: "ACADEMY", pre: `Promemoria: il tuo corso L2F Academy è ${quando}`, heading: `Il tuo corso è ${quando}`, body: `Ciao <strong style=\"color:#fff\">${nome ?? ""}</strong>,<br/>ti ricordiamo che sei iscritto al corso <strong style=\"color:#fff\">${(c as any).titolo}</strong>.<br/><br/>📅 ${dataStr}${(c as any).durata ? ` · ${(c as any).durata}` : ""}${(c as any).sede ? `<br/>📍 ${(c as any).sede}` : ""}<br/><br/>Ti aspettiamo!`, ctaLabel: "I miei corsi", ctaUrl: `${siteUrl}/area-clienti` });
        const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [email], subject: `Promemoria corso L2F Academy: ${(c as any).titolo} ${quando}`, html }) });
        if (r.ok) { await admin.from("corso_promemoria").insert({ iscrizione_id: (i as any).id, soglia }); sent++; }
      }
    }
    return json({ ok: true, corsi: (corsi ?? []).length, sent });
  } catch (e) { return json({ error: String(e) }, 500); }
});
