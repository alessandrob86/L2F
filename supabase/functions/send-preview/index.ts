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
  `<tr><td style="padding:18px 30px;border-top:1px solid rgba(195,35,39,0.25);font-size:12px;color:#8a93a3">L2F Automotive · Centro Ricambi Auto Srl · Via Nuova Poggioreale 48/a, Napoli · <span style="color:#E0312F">info@l2f.it</span></td></tr>`+
  `</table></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const secret = req.headers.get("x-cron-secret");
    const { data: cfg } = await admin.from("app_config").select("value").eq("key", "cron_secret").maybeSingle();
    if (!secret || !cfg || secret !== cfg.value) return json({ error: "unauthorized" }, 401);
    const body = await req.json().catch(() => ({}));
    const to: string[] = body.to ?? ["info@l2f.it"];
    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("CONTACT_FROM") ?? "L2F <info@l2f.it>";
    if (!RESEND) return json({ error: "no RESEND key" }, 500);
    const html = l2fEmail({
      brand: "ACADEMY",
      pre: "Anteprima template email L2F",
      heading: "Il tuo corso è tra 7 giorni",
      body: `Ciao <strong style=\"color:#fff\">Centro Ricambi Auto Srl</strong>,<br/>ti ricordiamo che sei iscritto al corso <strong style=\"color:#fff\">Diagnosi avanzata e ricarica climatizzatori</strong>.<br/><br/>📅 15 luglio 2026 alle ore 09:30 · 4 ore<br/>📍 Napoli — Sede CRA<br/><br/>Questa è un'anteprima del template email L2F.`,
      ctaLabel: "I miei corsi",
      ctaUrl: "https://www.l2f.it/area-clienti",
    });
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to, subject: "Anteprima template email L2F — Academy", html }) });
    return json({ ok: r.ok, status: r.status });
  } catch (e) { return json({ error: String(e) }, 500); }
});
