import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/* «Vorremmo cambiare pacchetto.»
 *
 * Prima era un `mailto:`: si premeva il pulsante e si apriva il programma
 * di posta dell'officina, che poi doveva premere invia una seconda volta.
 * Su un telefono funziona quasi sempre, su un computer d'officina quasi
 * mai — e la richiesta si perdeva senza che nessuno lo sapesse, né chi la
 * mandava né chi doveva riceverla.
 *
 * Adesso parte da qui, e prima ancora si scrive in `richieste_piano`: se
 * Resend fa i capricci, la richiesta resta e si vede.
 *
 * Chi chiama passa solo il pacchetto che vuole. Chi è, che piano ha oggi e
 * se è un upgrade o una retrocessione lo stabilisce questa funzione
 * leggendo il database: sono le tre cose su cui non ci si può fidare del
 * browser.
 *
 * Segreti (gli stessi delle altre funzioni L2F):
 *   RESEND_API_KEY   la chiave Resend del dominio l2f.it
 *   CONTACT_FROM     mittente, facoltativo
 *   CONTACT_TO       destinatario, facoltativo (di riserva info@l2f.it)
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (v: unknown) =>
  String(v ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));

const ROSSO = "#C32327";
const SCURO = "#141414";

const euro = (n: number) => new Intl.NumberFormat("it-IT").format(n);

const TITOLO: Record<string, string> = {
  attivazione: "Richiesta di attivazione",
  upgrade: "Richiesta di upgrade",
  downgrade: "Richiesta di retrocessione",
  cambio: "Richiesta di cambio pacchetto",
};

function corpoEmail(o: {
  genere: string; officina: string; codice: string; dove: string;
  email: string; telefono: string; da: string | null; a: string; prezzo: number;
}) {
  const riga = (e: string, v: string) =>
    `<tr><td style="padding:7px 0;color:#6b7280;font-size:13px;white-space:nowrap">${esc(e)}</td>` +
    `<td style="padding:7px 0 7px 18px;color:#111827;font-size:14px;font-weight:600">${esc(v)}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:${SCURO};border-top:4px solid ${ROSSO};border-radius:10px 10px 0 0;padding:20px 24px">
      <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:.08em">L2F AUTOMOTIVE</div>
      <div style="color:${ROSSO};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-top:4px">${esc(TITOLO[o.genere] ?? "Richiesta")}</div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:24px">

      <div style="border:2px solid ${SCURO};margin:0 0 22px">
        <div style="background:${SCURO};color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;padding:9px 16px">
          Pacchetto richiesto
        </div>
        <div style="padding:16px">
          <div style="color:#111827;font-size:24px;font-weight:800;line-height:1.1">${esc(o.a)}</div>
          <div style="color:#374151;font-size:15px;margin-top:6px">${esc(euro(o.prezzo))} € + IVA/anno</div>
          ${o.da ? `<div style="color:#6b7280;font-size:13px;margin-top:10px">Oggi ha: <b>${esc(o.da)}</b></div>` : ""}
        </div>
      </div>

      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${riga("Officina", o.officina)}
        ${o.codice ? riga("Codice cliente", o.codice) : ""}
        ${o.dove ? riga("Località", o.dove) : ""}
        ${o.telefono ? riga("Telefono", o.telefono) : ""}
        ${o.email ? riga("Email", o.email) : ""}
      </table>

      <p style="margin:22px 0 0;color:#374151;font-size:14px;line-height:1.6">
        La richiesta è partita dal sito, con la spunta di conferma. Il pacchetto
        <b>non è stato cambiato</b>: si cambia a mano dopo che avete parlato.
      </p>
      <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">
        Rispondendo a questa email rispondi direttamente all'officina.
      </p>
    </div>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "solo POST" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const { data: ute } = await admin.auth.getUser(jwt);
    if (!ute?.user) return json({ error: "accesso richiesto" }, 401);

    const { data: off } = await admin.from("officine")
      .select("id, ragione_sociale, codice_cliente, citta, provincia, email, telefono, pacchetto, stato")
      .eq("user_id", ute.user.id).maybeSingle();
    if (!off) return json({ error: "nessuna officina collegata a questo accesso" }, 403);

    const b = await req.json().catch(() => ({}));
    const voluto = String(b.pacchetto ?? "").trim();
    if (!voluto) return json({ error: "pacchetto mancante" }, 400);

    /* Il pacchetto dev'essere uno di quelli che esistono. Senza questo
       controllo l'email direbbe quello che ha scritto il browser. */
    const { data: pacchetti } = await admin.from("packages")
      .select("id, name, price, livello");
    const a = (pacchetti ?? []).find((p) => p.id === voluto);
    if (!a) return json({ error: "pacchetto inesistente" }, 400);

    // «flex» è il vecchio valore generico: vale come primo gradino.
    const attuale = off.pacchetto === "flex" ? null : off.pacchetto;
    const da = attuale ? (pacchetti ?? []).find((p) => p.id === attuale) : null;
    const livelloDa = da ? Number(da.livello) : (off.pacchetto === "flex" ? 1 : null);

    if (attuale && attuale === voluto) {
      return json({ error: "è già il vostro pacchetto" }, 400);
    }

    const genere = livelloDa === null ? "attivazione"
      : Number(a.livello) > livelloDa ? "upgrade"
        : Number(a.livello) < livelloDa ? "downgrade" : "cambio";

    // Tre richieste al giorno bastano e avanzano: oltre è un doppio clic.
    const ieri = new Date(Date.now() - 86400_000).toISOString();
    const { count } = await admin.from("richieste_piano")
      .select("id", { count: "exact", head: true })
      .eq("officina_id", off.id).gte("created_at", ieri);
    if ((count ?? 0) >= 3) {
      return json({ error: "avete già mandato questa richiesta: vi richiamiamo noi" }, 429);
    }

    // Prima la riga, poi l'email: se il mittente cade, la richiesta resta.
    const { data: riga } = await admin.from("richieste_piano").insert({
      officina_id: off.id,
      user_id: ute.user.id,
      da_pacchetto: off.pacchetto ?? null,
      a_pacchetto: voluto,
      genere,
    }).select("id").single();

    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("CONTACT_FROM") ?? "L2F <info@l2f.it>";
    const TO = Deno.env.get("CONTACT_TO") ?? "info@l2f.it";
    if (!RESEND) {
      await admin.from("richieste_piano").update({ errore: "RESEND_API_KEY non configurata" })
        .eq("id", riga?.id ?? "");
      return json({ ok: true, salvato: true, spedito: false, genere });
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: off.email || undefined,
        subject: `${TITOLO[genere]} — ${off.ragione_sociale} → ${a.name}`,
        html: corpoEmail({
          genere,
          officina: off.ragione_sociale ?? "—",
          codice: off.codice_cliente ?? "",
          dove: [off.citta, off.provincia && `(${off.provincia})`].filter(Boolean).join(" "),
          email: off.email ?? "",
          telefono: off.telefono ?? "",
          da: da?.name ?? (off.pacchetto === "flex" ? "Flex (pacchetto storico)" : null),
          a: a.name,
          prezzo: Number(a.price),
        }),
      }),
    });

    if (!r.ok) {
      const t = (await r.text()).slice(0, 300);
      await admin.from("richieste_piano").update({ errore: t }).eq("id", riga?.id ?? "");
      /* Per chi ha premuto il pulsante è andata bene lo stesso: la
         richiesta è registrata e verrà letta. Dirgli il contrario lo
         farebbe riprovare tre volte. */
      return json({ ok: true, salvato: true, spedito: false, genere });
    }

    await admin.from("richieste_piano")
      .update({ inviato_il: new Date().toISOString() }).eq("id", riga?.id ?? "");
    return json({ ok: true, salvato: true, spedito: true, genere });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
