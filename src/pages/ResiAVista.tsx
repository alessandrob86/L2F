import { Check, X } from 'lucide-react';
import { CONTACT } from '../lib/contact';

/* Sintesi pubblica del Regolamento Resi a Vista L2F v1.1
   (documento ufficiale: L2f Regolamento Resi A Vista) */

const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
};

const hStyle: React.CSSProperties = {
    fontSize: '1.35rem',
    fontWeight: 700,
    marginBottom: '12px',
};

const pStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    maxWidth: '70ch',
};

export const ResiAVista = () => {
    return (
        <main style={{ paddingTop: '140px', paddingBottom: '96px' }}>
            <div className="container" style={{ maxWidth: '880px' }}>
                <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, marginBottom: '8px' }}>
                    Reso a Vista — Regolamento
                </h1>
                <p style={{ ...pStyle, fontSize: '1.1rem', marginBottom: '48px' }}>
                    Il Reso a Vista è il benefit riservato alle officine aderenti a L2F:
                    gli articoli difettosi vengono presi in carico subito in filiale,
                    senza pratiche né attese.
                </p>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>A chi è riservato</h2>
                    <p style={pStyle}>
                        Esclusivamente alle officine aderenti a L2F (pacchetto HOME o FLEX),
                        in regola con i pagamenti e con rapporto commerciale attivo
                        con {CONTACT.company}.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>Come funziona</h2>
                    <ul style={{ ...pStyle, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '10px' }}>
                        {[
                            'Restituzione immediata del materiale difettoso presso il punto vendita',
                            'Nessuna apertura di pratiche o autorizzazioni preventive',
                            'Nessuna attesa di risposta: gestione diretta dal ricambista L2F',
                        ].map((t) => (
                            <li key={t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <Check size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                                {t}
                            </li>
                        ))}
                    </ul>
                    <p style={{ ...pStyle, marginTop: '16px' }}>
                        Vale solo per articoli <strong style={{ color: 'var(--text-primary)' }}>difettosi</strong>:
                        vizi o malfunzionamenti riconducibili a difetto del prodotto.
                        Gli errori di ordinazione non rientrano nel Reso a Vista.
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>Esclusioni</h2>
                    <p style={pStyle}>
                        Per questi articoli il Reso a Vista non si applica (resta possibile la
                        pratica di reso standard, con i tempi ordinari del distributore o produttore):
                    </p>
                    <ul style={{ ...pStyle, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '10px', marginTop: '12px' }}>
                        {[
                            'Frizioni e super kit volano + frizione',
                            'Iniettori e pompe di iniezione',
                            'Ricambi Originali (OEM)',
                        ].map((t) => (
                            <li key={t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <X size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>Cosa è bene sapere</h2>
                    <p style={pStyle}>
                        Il materiale difettoso può rientrare anche sporco, già montato o senza
                        imballo originale. Il Reso a Vista riguarda solo il materiale: manodopera,
                        fermo vettura e costi di smontaggio non sono mai rimborsati. Il punto
                        vendita L2F ha facoltà decisionale finale sul reso. Nei rapporti B2B la
                        garanzia è regolata dal Codice Civile (artt. 1490 e 1495 c.c.).
                    </p>
                </section>

                <section style={sectionStyle}>
                    <h2 style={hStyle}>Domande sul regolamento?</h2>
                    <p style={pStyle}>
                        Scrivi a <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--accent-hover)' }}>{CONTACT.email}</a> o
                        chiama il <a href={CONTACT.phoneHref} style={{ color: 'var(--accent-hover)' }}>{CONTACT.phone}</a>:
                        il regolamento completo (v1.1) è disponibile in filiale.
                    </p>
                </section>
            </div>
        </main>
    );
};
