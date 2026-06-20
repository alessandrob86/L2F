/** Conversione temperatura colore (Kelvin) → colore percepito e descrizione del tipo di luce. */

/** Approssimazione corpo nero (Tanner Helland) → "rgb(r, g, b)". Clamp 1000–40000K. */
export function kelvinToRgb(kelvin: number): string {
    const t = Math.min(40000, Math.max(1000, kelvin)) / 100;
    let r: number, g: number, b: number;

    if (t <= 66) {
        r = 255;
        g = 99.4708025861 * Math.log(t) - 161.1195681661;
    } else {
        r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
        g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    }

    if (t >= 66) {
        b = 255;
    } else if (t <= 19) {
        b = 0;
    } else {
        b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    }

    const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
    return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

export interface LightType {
    label: string;
    ref: string;
}

/** Descrizione del tipo di luce in base ai Kelvin. */
export function kelvinLightType(kelvin: number): LightType {
    if (kelvin < 2700) return { label: 'Luce calda', ref: 'tono ambrato, come una candela o l’alba' };
    if (kelvin < 3500) return { label: 'Bianco caldo', ref: 'tono accogliente, da interni' };
    if (kelvin < 4500) return { label: 'Bianco neutro', ref: 'tono bilanciato' };
    if (kelvin < 5500) return { label: 'Bianco naturale', ref: 'simile alla luce diurna' };
    if (kelvin <= 6500) return { label: 'Bianco freddo', ref: 'brillante, come la luce di mezzogiorno' };
    return { label: 'Bianco freddo intenso', ref: 'tono bluastro, come un cielo terso' };
}

/** Gradiente della scala Kelvin (caldo a sinistra → freddo a destra), ~1500K→10000K. */
export const KELVIN_GRADIENT =
    'linear-gradient(90deg, #ff7b00 0%, #ffa347 14%, #ffc488 27%, #ffe0c4 41%, #fff4e8 53%, #fbfdff 65%, #e8f0ff 80%, #cfe0ff 100%)';

/** Posizione 0–100% del valore sulla scala (1500K→10000K). */
export function kelvinScalePct(kelvin: number): number {
    const min = 1500;
    const max = 10000;
    return Math.min(100, Math.max(0, ((kelvin - min) / (max - min)) * 100));
}

/** Estrae i Kelvin da una stringa tipo "6000K (bianco freddo puro)" → 6000. */
export function parseKelvin(s: string | null | undefined): number | null {
    if (!s) return null;
    const m = s.match(/(\d[\d.]*)\s*K/i);
    if (!m) return null;
    const n = Number(m[1].replace(/\./g, ''));
    return Number.isFinite(n) ? n : null;
}
