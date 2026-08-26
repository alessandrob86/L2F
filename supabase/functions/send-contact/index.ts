// Recuperato dal server il 26 agosto 2026 perché mancava dal repository.
// È il codice in produzione così com'è: può differire da come lo si scriverebbe oggi.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } }); }
const LOGOS: Record<string,string> = {
  AUTOMOTIVE: 'https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/automotive.png',
  ACADEMY: 'https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/academy.png',
};
function l2fEmail(o: { brand?: string; pre: string; heading: string; body: string }): string {
  const brand = o.brand ?? 'AUTOMOTIVE';
  const logo = LOGOS[brand] ?? LOGOS.AUTOMOTIVE;
  return `<!doctype html><html><body style="margin:0;background:#07080b;font-family:Arial,Helvetica,sans-serif">`+
  `<div style="display:none;max-height:0;overflow:hidden">${o.pre}</div>`+
  `<table width="100%" cellpadding="0" cellspacing="0" style="background:#07080b;padding:28px 0"><tr><td align="center">`+
  `<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#12141a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">`+
  `<tr><td style="background:#0e0f14;border-top:5px solid #C32327;padding:22px 28px"><img src="${logo}" alt="L2F ${brand}" height="42" style="display:block;height:42px;width:auto;border:0;outline:none"/></td></tr>`+
  `<tr><td style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,#C32327,#E0312F 55%,#7a1518)">&nbsp;</td></tr>`+
  `<tr><td style="padding:32px 30px"><h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;border-left:3px solid #C32327;padding-left:13px">${o.heading}</h1><div style="font-size:15px;line-height:1.65;color:#c8ccd4">${o.body}</div></td></tr>`+
  `<tr><td style="padding:18px 30px;border-top:1px solid rgba(195,35,39,0.25);font-size:12px;color:#8a93a3">L2F Automotive · Centro Ricambi Auto Srl · Via Nuova Poggioreale 48/a, Napoli · <span style="color:#E0312F">info@l2f.it</span></td></tr>`+
  `</table></td></tr></table></body></html>`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let payload: Record<string, string> = {};
  try { payload = await req.json(); } catch { return json({ error: 'Body non valido' }, 400); }
  const nome = (payload.nome ?? '').trim();
  const email = (payload.email ?? '').trim();
  const telefono = (payload.telefono ?? '').trim();
  const officina = (payload.officina ?? '').trim();
  const messaggio = (payload.messaggio ?? '').trim();
  if (!nome || !email || !messaggio) return json({ error: 'Compila nome, email e messaggio.' }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: 'Email non valida.' }, 400);
  if (messaggio.length > 5000) return json({ error: 'Messaggio troppo lungo.' }, 400);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await supabase.from('messaggi').insert({ nome, email, telefono: telefono || null, officina: officina || null, messaggio });
  } catch (e) { console.error('Insert messaggi fallito:', e); }
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('CONTACT_FROM') ?? 'L2F Sito <onboarding@resend.dev>';
  const to = Deno.env.get('CONTACT_TO') ?? 'info@l2f.it';
  let emailSent = false;
  if (key) {
    try {
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const body = `<p style="margin:0 0 14px"><strong style="color:#fff">${esc(nome)}</strong>${officina ? ' · ' + esc(officina) : ''}</p>`+
        `<p style="margin:0 0 6px">📧 ${esc(email)}${telefono ? ' · 📞 ' + esc(telefono) : ''}</p>`+
        `<div style="margin-top:16px;padding:14px 16px;background:#07080b;border-radius:10px;border:1px solid rgba(255,255,255,0.08);white-space:pre-wrap;color:#e8e8ea">${esc(messaggio)}</div>`;
      const html = l2fEmail({ brand: 'AUTOMOTIVE', pre: `Nuovo messaggio da ${nome}`, heading: 'Nuovo messaggio dal sito', body });
      const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Sito L2F — ${nome}${officina ? ' (' + officina + ')' : ''}`, html }) });
      emailSent = res.ok;
      if (!res.ok) console.error('Resend errore:', res.status, await res.text());
    } catch (e) { console.error('Invio email fallito:', e); }
  }
  return json({ ok: true, emailSent });
});
