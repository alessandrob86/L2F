import { CONTACT } from '../lib/contact';

/* Informativa Privacy L2F (titolare: Centro Ricambi Auto Srl).
   Bozza allineata al GDPR, da sottoporre a revisione legale prima del go-live.
   Ultimo aggiornamento: 18 giugno 2026. */

const sectionStyle: React.CSSProperties = { marginBottom: '40px' };
const hStyle: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 700, marginBottom: '12px' };
const pStyle: React.CSSProperties = { color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '70ch' };
const liStyle: React.CSSProperties = { display: 'flex', gap: '8px', alignItems: 'flex-start' };
const ulStyle: React.CSSProperties = { ...pStyle, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '10px', marginTop: '12px' };
const strong: React.CSSProperties = { color: 'var(--text-primary)' };

export const Privacy = () => {
    return (
        <main style={{ paddingTop: '140px', paddingBottom: '96px' }}>
            <div className="container" style={{ maxWidth: '880px' }}>
                <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, marginBottom: '8px' }}>
                    Informativa Privacy
                </h1>
                <p style={{ ...pStyle, fontSize: '1.1rem', marginBottom: '48px' }}>
                    La presente informativa descrive come trattiamo i dati personali degli utenti e
                    delle officine che utilizzano il sito e i servizi L2F, ai sensi del Regolamento
                    UE 2016/679 (GDPR).
                </p>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>1. Titolare del trattamento</h2>
                    <p style={pStyle}>
                        Titolare del trattamento è <strong style={strong}>{CONTACT.company}</strong> —
                        {' '}{CONTACT.address} · P.IVA {CONTACT.piva}. «L2F» è un marchio
                        di {CONTACT.company}. Per qualsiasi questione relativa ai dati personali
                        puoi scrivere a <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--accent-hover)' }}>{CONTACT.email}</a>.
                        Non è stato nominato un Responsabile della Protezione dei Dati (DPO), non
                        ricorrendone l'obbligo di legge.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>2. Quali dati trattiamo</h2>
                    <ul style={ulStyle}>
                        <li style={liStyle}><span style={strong}>Dati di registrazione e account:</span>&nbsp;ragione sociale, partita IVA/codice cliente, nome del referente, email, telefono.</li>
                        <li style={liStyle}><span style={strong}>Dati di ordini e servizi:</span>&nbsp;ordini effettuati, importi, cashback maturato, iscrizioni ai corsi L2F Academy.</li>
                        <li style={liStyle}><span style={strong}>Dati tecnici:</span>&nbsp;informazioni strettamente necessarie al funzionamento del sito (es. token di sessione per il login) ed eventuali log tecnici.</li>
                        <li style={liStyle}><span style={strong}>Comunicazioni:</span>&nbsp;contenuto delle richieste che ci invii via form o email.</li>
                    </ul>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>3. Finalità e basi giuridiche</h2>
                    <ul style={ulStyle}>
                        <li style={liStyle}>Gestione dell'account, del rapporto commerciale, evasione degli ordini ed erogazione dei servizi (cashback, Academy, Reso a Vista) — <span style={strong}>esecuzione del contratto</span> (art. 6.1.b GDPR).</li>
                        <li style={liStyle}>Adempimenti fiscali, contabili e di legge — <span style={strong}>obbligo legale</span> (art. 6.1.c).</li>
                        <li style={liStyle}>Assistenza e comunicazioni di servizio — <span style={strong}>esecuzione del contratto / legittimo interesse</span> (art. 6.1.b/f).</li>
                        <li style={liStyle}>Eventuali comunicazioni commerciali — <span style={strong}>consenso</span> (art. 6.1.a), revocabile in qualsiasi momento.</li>
                    </ul>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>4. Fornitori e modalità del trattamento</h2>
                    <p style={pStyle}>
                        I dati sono trattati con strumenti informatici e misure di sicurezza adeguate.
                        Ci avvaliamo di fornitori che agiscono come <strong style={strong}>responsabili del trattamento</strong>:
                    </p>
                    <ul style={ulStyle}>
                        <li style={liStyle}><span style={strong}>Supabase</span>&nbsp;(Supabase Pte Ltd) — hosting del database, autenticazione e archiviazione. Trattamento regolato da accordo sul trattamento dei dati (DPA) e, per i trasferimenti extra-UE, da Clausole Contrattuali Standard (SCC).</li>
                        <li style={liStyle}><span style={strong}>Resend</span>&nbsp;(Resend, Inc.) — invio delle email transazionali (conferme, notifiche). Trattamento regolato da DPA e, per i trasferimenti extra-UE, da Clausole Contrattuali Standard (SCC).</li>
                        <li style={liStyle}><span style={strong}>Fornitore di hosting del sito</span>&nbsp;— per la pubblicazione e l'erogazione del sito web.</li>
                    </ul>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>5. Trasferimento dei dati</h2>
                    <p style={pStyle}>
                        Alcuni fornitori (ad esempio Supabase e Resend) hanno sede o possono trattare
                        dati al di fuori dell'Unione Europea: in tali casi il trasferimento è garantito
                        dalle Clausole Contrattuali Standard approvate dalla Commissione Europea e da
                        misure supplementari adeguate.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>6. Periodo di conservazione</h2>
                    <p style={pStyle}>
                        I dati sono conservati per la durata del rapporto e, successivamente, per il
                        tempo necessario ad adempiere agli obblighi di legge (ad esempio i documenti
                        contabili e fiscali per 10 anni, art. 2220 c.c.). I dati trattati sulla base
                        del consenso sono conservati fino alla revoca dello stesso.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>7. I tuoi diritti</h2>
                    <p style={pStyle}>
                        In qualità di interessato puoi esercitare i diritti previsti dagli artt. 15–22
                        del GDPR: accesso, rettifica, cancellazione, limitazione, portabilità,
                        opposizione e revoca del consenso. Per esercitarli scrivi
                        a <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--accent-hover)' }}>{CONTACT.email}</a>.
                        Hai inoltre diritto di proporre reclamo all'Autorità Garante per la protezione
                        dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-hover)' }}>garanteprivacy.it</a>).
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>8. Modifiche</h2>
                    <p style={pStyle}>
                        La presente informativa può essere aggiornata nel tempo. La data dell'ultima
                        revisione è indicata qui sotto; le modifiche rilevanti saranno comunicate
                        attraverso il sito.
                    </p>
                </section>

                <p style={{ ...pStyle, fontSize: '0.9rem', marginTop: '48px', opacity: 0.7 }}>
                    Ultimo aggiornamento: 18 giugno 2026.
                </p>
            </div>
        </main>
    );
};
