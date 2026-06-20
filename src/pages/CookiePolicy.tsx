import { CONTACT } from '../lib/contact';

/* Cookie Policy L2F (titolare: Centro Ricambi Auto Srl).
   Il sito usa solo strumenti tecnici necessari (sessione di login via
   localStorage di Supabase): nessuna profilazione, nessun banner richiesto.
   Da rivedere se in futuro si aggiungono analytics/marketing.
   Ultimo aggiornamento: 18 giugno 2026. */

const sectionStyle: React.CSSProperties = { marginBottom: '40px' };
const hStyle: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 700, marginBottom: '12px' };
const pStyle: React.CSSProperties = { color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '70ch' };
const liStyle: React.CSSProperties = { display: 'flex', gap: '8px', alignItems: 'flex-start' };
const ulStyle: React.CSSProperties = { ...pStyle, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '10px', marginTop: '12px' };
const strong: React.CSSProperties = { color: 'var(--text-primary)' };

export const CookiePolicy = () => {
    return (
        <main style={{ paddingTop: '140px', paddingBottom: '96px' }}>
            <div className="container" style={{ maxWidth: '880px' }}>
                <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, marginBottom: '8px' }}>
                    Cookie Policy
                </h1>
                <p style={{ ...pStyle, fontSize: '1.1rem', marginBottom: '48px' }}>
                    Questa pagina spiega quali cookie e strumenti di archiviazione utilizza il sito L2F.
                </p>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>1. Cosa sono i cookie</h2>
                    <p style={pStyle}>
                        I cookie e gli strumenti di archiviazione locale sono piccoli file o dati salvati
                        sul tuo dispositivo dal browser, utilizzati per far funzionare il sito o per
                        memorizzare informazioni utili alla navigazione.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>2. Strumenti utilizzati da questo sito</h2>
                    <p style={pStyle}>
                        Il sito utilizza <strong style={strong}>esclusivamente strumenti tecnici</strong>,
                        necessari al suo funzionamento:
                    </p>
                    <ul style={ulStyle}>
                        <li style={liStyle}><span style={strong}>Archiviazione locale tecnica (localStorage):</span>&nbsp;mantiene attiva la sessione di login delle officine registrate (token di autenticazione gestito da Supabase). Senza, non sarebbe possibile restare autenticati nell'area riservata.</li>
                        <li style={liStyle}><span style={strong}>Eventuali cookie tecnici di sessione:</span>&nbsp;necessari alla sicurezza e alla corretta navigazione.</li>
                    </ul>
                    <p style={{ ...pStyle, marginTop: '16px' }}>
                        Trattandosi di strumenti <strong style={strong}>strettamente necessari</strong>, ai
                        sensi della normativa vigente non richiedono un consenso preventivo: per questo
                        il sito non mostra un banner di consenso.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>3. Cookie di profilazione e analytics</h2>
                    <p style={pStyle}>
                        Questo sito <strong style={strong}>non utilizza</strong> cookie di profilazione,
                        cookie pubblicitari né strumenti di analisi statistica di terze parti (come
                        Google Analytics). Nessun dato di navigazione viene usato per profilarti.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>4. Servizi di terze parti</h2>
                    <p style={pStyle}>
                        Il sito si appoggia a <strong style={strong}>Supabase</strong> (autenticazione e
                        database) e <strong style={strong}>Resend</strong> (invio email), descritti
                        nell'<a href="/privacy" style={{ color: 'var(--accent-hover)' }}>Informativa Privacy</a>.
                        Gli eventuali link esterni (ad esempio il canale YouTube) rimandano a siti di
                        terzi, che applicano proprie cookie policy: il semplice link non installa cookie
                        di terze parti su questo sito.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>5. Come gestire i cookie</h2>
                    <p style={pStyle}>
                        Puoi gestire o eliminare cookie e dati di archiviazione locale dalle impostazioni
                        del tuo browser. La rimozione dei dati tecnici di sessione comporterà
                        semplicemente la disconnessione dall'area riservata.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>6. Titolare e contatti</h2>
                    <p style={pStyle}>
                        Titolare: <strong style={strong}>{CONTACT.company}</strong> — {CONTACT.address} ·
                        P.IVA {CONTACT.piva}. Per informazioni
                        scrivi a <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--accent-hover)' }}>{CONTACT.email}</a>.
                    </p>
                </section>

                <p style={{ ...pStyle, fontSize: '0.9rem', marginTop: '48px', opacity: 0.7 }}>
                    Ultimo aggiornamento: 18 giugno 2026.
                </p>
            </div>
        </main>
    );
};
