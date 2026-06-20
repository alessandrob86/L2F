/* Contatti ufficiali L2F / Centro Ricambi Auto Srl */

export const CONTACT = {
    email: 'info@l2f.it',
    phone: '+39 081 281732',
    phoneHref: 'tel:+39081281732',
    company: 'Centro Ricambi Auto Srl',
    address: 'Via Nuova Poggioreale 48/a, 80143 Napoli',
    piva: 'IT 06795941217',
    youtube: 'https://www.youtube.com/@l2fautomotive42',
} as const;

/** mailto: precompilato per la richiesta di accesso, con eventuale pacchetto scelto. */
export function accessRequestMailto(packageName?: string): string {
    const subject = packageName
        ? `Richiesta attivazione pacchetto ${packageName}`
        : 'Richiesta di accesso L2F';
    const body = [
        'Buongiorno,',
        '',
        packageName
            ? `vorrei attivare il pacchetto ${packageName} per la mia officina.`
            : 'vorrei entrare nel network L2F con la mia officina.',
        '',
        'Ragione sociale: ',
        'Città: ',
        'Telefono: ',
    ].join('\n');
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** mailto: per richiesta di cambio piano (upgrade/downgrade) da officina già attiva. */
export function planChangeMailto(opts: {
    officina?: string;
    current?: string | null;
    requested: string;
    kind: 'upgrade' | 'downgrade' | 'cambio';
}): string {
    const verbo = opts.kind === 'upgrade' ? 'upgrade' : opts.kind === 'downgrade' ? 'downgrade' : 'cambio piano';
    const subject = `Richiesta ${verbo} → ${opts.requested}`;
    const body = [
        'Buongiorno,',
        '',
        `siamo l'officina ${opts.officina ?? ''}.`.trim(),
        `Vorremmo richiedere un ${verbo} del nostro pacchetto.`,
        opts.current ? `Piano attuale: ${opts.current}` : '',
        `Piano richiesto: ${opts.requested}`,
        '',
        'Grazie.',
    ].filter(Boolean).join('\n');
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
