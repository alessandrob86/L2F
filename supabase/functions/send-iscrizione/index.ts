// Recuperato dal server il 26 agosto 2026 perché mancava dal repository.
// È il codice in produzione così com'è: può differire da come lo si scriverebbe oggi.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
function json(b: unknown, s = 200): Response { return new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } }); }

const LOGOS: Record<string,string> = {
  AUTOMOTIVE: "https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/automotive.png",
  ACADEMY: "https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/academy.png",
};
function l2fEmail(o: { brand?: string; pre: string; heading: string; body: string }): string {
  const brand = o.brand ?? "ACADEMY";
  const logo = LOGOS[brand] ?? LOGOS.AUTOMOTIVE;
  return `<!doctype html><html><body style="margin:0;background:#07080b;font-family:Arial,Helvetica,sans-serif">`+
  `<div style="display:none;max-height:0;overflow:hidden">${o.pre}</div>`+
  `<table width="100%" cellpadding="0" cellspacing="0" style="background:#07080b;padding:28px 0"><tr><td align="center">`+
  `<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#12141a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">`+
  `<tr><td style="background:#0e0f14;border-top:5px solid #C32327;padding:22px 28px"><img src="${logo}" alt="L2F ${brand}" height="42" style="display:block;height:42px;width:auto;border:0;outline:none"/></td></tr>`+
  `<tr><td style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,#C32327,#E0312F 55%,#7a1518)">&nbsp;</td></tr>`+
  `<tr><td style="padding:32px 30px"><h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;border-left:3px solid #C32327;padding-left:13px">${o.heading}</h1><div style="font-size:15px;line-height:1.65;color:#c8ccd4">${o.body}</div></td></tr>`+
  `<tr><td style="padding:18px 30px;border-top:1px solid rgba(195,35,39,0.25);font-size:12px;color:#8a93a3">L2F Automotive · Centro Ricambi Auto Srl · Napoli · <span style="color:#E0312F">info@l2f.it</span></td></tr>`+
  `</table></td></tr></table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { corso_id } = await req.json();
    if (!corso_id) return json({ error: "corso_id mancante" }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "non autenticato" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: off } = await admin.from("officine").select("ragione_sociale, email, telefono, citta, codice_cliente").eq("user_id", user.id).maybeSingle();
    if (!off) return json({ error: "officina non trovata" }, 404);
    const { data: corso } = await admin.from("corsi").select("titolo, data_corso, sede, durata").eq("id", corso_id).single();
    if (!corso) return json({ error: "corso non trovato" }, 404);
    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("CONTACT_FROM") ?? "L2F <info@l2f.it>";
    if (!RESEND) return json({ ok: true, emailed: false });
    const dataStr = (corso as any).data_corso ? new Date((corso as any).data_corso).toLocaleString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "data da definire";
    const body = `<p style="margin:0 0 14px">Una nuova officina si è iscritta a un corso L2F Academy.</p>`+
      `<div style="padding:14px 16px;background:#07080b;border-radius:10px;border:1px solid rgba(255,255,255,0.08)"><strong style="color:#fff;font-size:16px">${(corso as any).titolo}</strong><br/><span style="color:#9aa3b2">📅 ${dataStr}${(corso as any).durata ? " · " + (corso as any).durata : ""}${(corso as any).sede ? " · " + (corso as any).sede : ""}</span></div>`+
      `<p style="margin:16px 0 0"><strong style="color:#fff">${off.ragione_sociale}</strong>${off.codice_cliente ? " · " + off.codice_cliente : ""}${off.citta ? " — " + off.citta : ""}<br/>${off.email ?? ""}${off.telefono ? " · " + off.telefono : ""}</p>`;
    const html = l2fEmail({ brand: "ACADEMY", pre: `Adesione: ${off.ragione_sociale}`, heading: "Nuova adesione corso", body });
    const resp = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: ["info@l2f.it"], reply_to: off.email ? [off.email] : undefined, subject: `Adesione corso: ${(corso as any).titolo} — ${off.ragione_sociale}`, html }) });
    return json({ ok: true, emailed: resp.ok });
  } catch (e) { return json({ error: String(e) }, 500); }
});
