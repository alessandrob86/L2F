import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
// SheetJS via npm: (host consentito dal bundler Supabase). cdn.sheetjs.com è bloccato
// dal bundler, e l'import() dinamico non è supportato dal runtime edge: entrambi
// facevano fallire la generazione dell'Excel.
import * as XLSX from "npm:xlsx@0.18.5";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
function json(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } }); }

const LOGOS: Record<string, string> = {
  AUTOMOTIVE: "https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/automotive.png",
  ACADEMY: "https://cjvtynutpsatwauocrdf.supabase.co/storage/v1/object/public/corsi/brand/academy.png",
};
function l2fEmail(o: { brand?: string; pre: string; heading: string; body: string }): string {
  const brand = o.brand ?? "AUTOMOTIVE";
  const logo = LOGOS[brand] ?? LOGOS.AUTOMOTIVE;
  return `<!doctype html><html><body style="margin:0;background:#07080b;font-family:Arial,Helvetica,sans-serif">` +
    `<div style="display:none;max-height:0;overflow:hidden">${o.pre}</div>` +
    `<table width="100%" cellpadding="0" cellspacing="0" style="background:#07080b;padding:28px 0"><tr><td align="center">` +
    `<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#12141a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">` +
    `<tr><td style="background:#0e0f14;border-top:5px solid #C32327;padding:22px 28px"><img src="${logo}" alt="L2F ${brand}" height="42" style="display:block;height:42px;width:auto;border:0;outline:none"/></td></tr>` +
    `<tr><td style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,#C32327,#E0312F 55%,#7a1518)">&nbsp;</td></tr>` +
    `<tr><td style="padding:32px 30px"><h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;border-left:3px solid #C32327;padding-left:13px">${o.heading}</h1><div style="font-size:15px;line-height:1.6;color:#c8ccd4">${o.body}</div></td></tr>` +
    `<tr><td style="padding:18px 30px;border-top:1px solid rgba(195,35,39,0.25);font-size:12px;color:#8a93a3">L2F Automotive · Centro Ricambi Auto Srl · Napoli · <span style="color:#E0312F">info@l2f.it</span></td></tr>` +
    `</table></td></tr></table></body></html>`;
}

interface OrderItem { codice_l2f: string | null; nome: string | null; imballo: string | null; prezzo_unitario: number | string; quantita: number; }

/** Marca fissa richiesta dal gestionale (BLUDAT) per l'import delle righe. */
const MARCA_GESTIONALE = "LDF";

/**
 * Casella magazzino che riceve la notifica ordine + Excel.
 * Dominio diverso dal mittente (l2f.it) di proposito: una mail @l2f.it -> @l2f.it
 * inviata da Resend viene filtrata come spoofing e finisce in spam.
 */
const ORDINE_NOTIFY_TO = "ordini@centroricambiautosrl.it";

/**
 * Genera l'Excel d'importazione, una riga per articolo.
 * Colonne (nell'ordine atteso dal gestionale): Marca | Articolo | Quantità | Prezzo unitario.
 * Riga 1 = intestazione; i dati partono dalla riga 2 (impostare "Inizia dalla riga 2" nell'import).
 * Quantità e Prezzo unitario sono celle numeriche; il prezzo è il NETTO, IVA esclusa.
 */
function buildOrderXlsx(items: OrderItem[]): string {
  const header = ["Marca", "Articolo", "Quantità", "Prezzo unitario"];
  const rows = items.map((it) => [MARCA_GESTIONALE, it.codice_l2f ?? "", Number(it.quantita), Number(it.prezzo_unitario)]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [{ wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ordine");
  return XLSX.write(wb, { type: "base64", bookType: "xlsx" });
}

function itemsTableHtml(items: OrderItem[]): string {
  const rows = items.map((it) =>
    `<tr><td style="padding:7px 8px;border-top:1px solid rgba(255,255,255,0.07);color:#9aa3b2">${it.codice_l2f ?? ""}</td><td style="padding:7px 8px;border-top:1px solid rgba(255,255,255,0.07);color:#e8e8ea">${it.nome ?? ""}${it.imballo ? " · " + it.imballo : ""}</td><td align="center" style="padding:7px 8px;border-top:1px solid rgba(255,255,255,0.07)">${it.quantita}</td><td align="right" style="padding:7px 8px;border-top:1px solid rgba(255,255,255,0.07)">€ ${(Number(it.prezzo_unitario) * it.quantita).toFixed(2)}</td></tr>`,
  ).join("");
  return `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px"><thead><tr style="color:#8a93a3;text-align:left"><th style="padding:0 8px 6px">Cod.</th><th style="padding:0 8px 6px">Prodotto</th><th style="padding:0 8px 6px" align="center">Q.tà</th><th style="padding:0 8px 6px" align="right">Totale</th></tr></thead><tbody>${rows}</tbody></table>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { order_id } = await req.json();
    if (!order_id) return json({ error: "order_id mancante" }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "non autenticato" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order, error } = await admin.from("orders").select("numero, note, totale_listino, totale_netto, created_at, officine(ragione_sociale, email, telefono, citta, piva, codice_cliente, user_id), order_items(codice_l2f, nome, imballo, prezzo_unitario, quantita)").eq("id", order_id).single();
    if (error || !order) return json({ error: "ordine non trovato" }, 404);
    const off = (order as any).officine;
    if (!off || off.user_id !== user.id) return json({ error: "non autorizzato" }, 403);

    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("CONTACT_FROM") ?? "L2F <info@l2f.it>";
    if (!RESEND) return json({ ok: true, emailed: false });

    const items = ((order as any).order_items ?? []) as OrderItem[];
    const numero = (order as any).numero;
    const totaleListino = Number((order as any).totale_listino);
    const totaleNetto = Number((order as any).totale_netto);
    const note = (order as any).note as string | null;
    const tableHtml = itemsTableHtml(items);
    const totaliHtml =
      `<p style="margin:18px 0 0;color:#9aa3b2">Totale listino: € ${totaleListino.toFixed(2)}</p>` +
      `<p style="margin:4px 0 0;font-size:18px"><strong style="color:#fff">Totale netto: € ${totaleNetto.toFixed(2)}</strong> <span style="color:#8a93a3;font-size:13px">(IVA esclusa)</span></p>` +
      (note ? `<p style="margin:14px 0 0;font-style:italic;color:#9aa3b2">Note: ${note}</p>` : "");

    async function sendEmail(payload: Record<string, unknown>): Promise<boolean> {
      const resp = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return resp.ok;
    }

    // 1) Notifica magazzino CON l'Excel d'importazione allegato.
    const intestazione = `<p style="margin:0 0 16px"><strong style="color:#fff">${off.ragione_sociale}</strong>${off.codice_cliente ? " · " + off.codice_cliente : ""}${off.citta ? " — " + off.citta : ""}<br/>${off.email ?? ""}${off.telefono ? " · " + off.telefono : ""}${off.piva ? "<br/>P.IVA " + off.piva : ""}</p>`;
    const internalHtml = l2fEmail({ brand: "AUTOMOTIVE", pre: `Nuovo ordine ${numero}`, heading: `Nuovo ordine ${numero}`, body: intestazione + tableHtml + totaliHtml + `<p style="margin:16px 0 0;font-size:13px;color:#8a93a3">In allegato l'Excel da importare nel gestionale.</p>` });
    const safeNum = String(numero).replace(/[^A-Za-z0-9_-]/g, "");
    // Genera l'Excel; un eventuale errore non blocca l'email (parte senza allegato).
    let xlsxB64: string | null = null;
    try {
      xlsxB64 = buildOrderXlsx(items);
    } catch (e) {
      console.error("Generazione Excel fallita:", e);
    }
    const internalOk = await sendEmail({
      from: FROM,
      to: [ORDINE_NOTIFY_TO],
      reply_to: off.email ? [off.email] : undefined,
      subject: `Nuovo ordine ${numero} — ${off.ragione_sociale}`,
      html: internalHtml,
      attachments: xlsxB64 ? [{ filename: `ordine-${safeNum || "L2F"}.xlsx`, content: xlsxB64 }] : undefined,
    });

    // 2) Conferma al cliente (officina), senza allegato.
    let customerOk = false;
    if (off.email) {
      const saluto = `<p style="margin:0 0 16px">Ciao <strong style="color:#fff">${off.ragione_sociale}</strong>,<br/>abbiamo ricevuto il tuo ordine <strong style="color:#fff">${numero}</strong>. Ecco il riepilogo.</p>`;
      const chiusura = `<p style="margin:18px 0 0;color:#c8ccd4">Ti contatteremo a breve per la conferma. Per qualsiasi modifica rispondi a questa email.</p>`;
      const customerHtml = l2fEmail({ brand: "AUTOMOTIVE", pre: `Conferma ordine ${numero}`, heading: `Ordine ${numero} ricevuto`, body: saluto + tableHtml + totaliHtml + chiusura });
      customerOk = await sendEmail({
        from: FROM,
        to: [off.email],
        reply_to: ["info@l2f.it"],
        subject: `Conferma ordine ${numero} — L2F`,
        html: customerHtml,
      });
    }

    return json({ ok: true, emailed: internalOk, customer_emailed: customerOk });
  } catch (e) { return json({ error: String(e) }, 500); }
});
