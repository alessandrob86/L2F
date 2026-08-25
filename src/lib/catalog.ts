import { supabase } from './supabase';

export const PLACEHOLDER_IMG = '/labels/_placeholder.webp';

export interface ProductFamily {
    id: string;
    nome: string;
    descrizione: string | null;
    sort_order: number;
}

export interface ProductVariant {
    id: string;
    codice_l2f: string;
    imballo: string;
    prezzo_listino: number | null;
    unita_prezzo: string;
    sort_order: number;
    /** Solo officine attive (RLS). */
    prezzo_netto?: number | null;
}

export interface Product {
    id: string;
    codice_l2f: string;
    nome: string;
    family_id: string | null;
    applicazione: string | null;
    riferimento_oe: string | null;
    prezzo_listino: number | null;
    immagine: string | null;
    /** Galleria angoli prodotto (il primo è l'immagine principale). */
    immagini: string[] | null;
    attributi: Record<string, unknown>;
    garanzia: string | null;
    descrizione: string | null;
    scheda_tecnica_url: string | null;
    scheda_sicurezza_url: string | null;
    /** 'L2F' per il private label, altrimenti il marchio (Brembo, TRW…). */
    marchio: string;
    /** Visibile sul sito L2F: vero solo per il private label (vincolo a DB). */
    su_l2f: boolean;
    /** Visibile sul CRA Store. */
    su_cra: boolean;
    /** Solo officine attive (RLS). */
    prezzo_netto?: number | null;
    variants: ProductVariant[];
    /** Calcolati lato client per la card. */
    hasVariants: boolean;
    prezzoDa: number | null;
    /** Prezzo netto "da" (minimo tra le varianti, o del prodotto). Solo officine attive. */
    nettoDa: number | null;
    unitaPrezzo: string;
}

interface VariantRow {
    id: string;
    codice_l2f: string;
    imballo: string;
    prezzo_listino: number | null;
    unita_prezzo: string;
    sort_order: number;
    product_variant_netto?: { prezzo_netto: number }[] | { prezzo_netto: number } | null;
}

interface ProductRow extends Omit<Product, 'prezzo_netto' | 'variants' | 'hasVariants' | 'prezzoDa' | 'unitaPrezzo'> {
    product_netto?: { prezzo_netto: number }[] | { prezzo_netto: number } | null;
    product_variants?: VariantRow[] | null;
}

function unwrapNetto(pn: { prezzo_netto: number }[] | { prezzo_netto: number } | null | undefined): number | null {
    return Array.isArray(pn) ? pn[0]?.prezzo_netto ?? null : pn?.prezzo_netto ?? null;
}

interface NettoUtenteRow {
    product_id: string | null;
    variant_id: string | null;
    prezzo_netto: number;
}

/**
 * Netti risolti per l'utente loggato: prezzo del listino assegnato alla sua
 * categoria cliente, con fallback al netto universale. Le tabelle
 * listino_prezzi_* sono admin-only: si passa dalla funzione SECURITY DEFINER,
 * così il client non può vedere i prezzi di altri segmenti.
 */
async function nettiUtente(): Promise<{ prodotti: Map<string, number>; varianti: Map<string, number> }> {
    const { data, error } = await supabase.rpc('l2f_netto_utente');
    if (error) throw error;
    const prodotti = new Map<string, number>();
    const varianti = new Map<string, number>();
    for (const r of (data ?? []) as NettoUtenteRow[]) {
        if (r.product_id) prodotti.set(r.product_id, r.prezzo_netto);
        else if (r.variant_id) varianti.set(r.variant_id, r.prezzo_netto);
    }
    return { prodotti, varianti };
}

/** Sovrascrive i netti universali arrivati dal join con quelli del cliente. */
function applicaNetti(
    rows: ProductRow[],
    netti: { prodotti: Map<string, number>; varianti: Map<string, number> },
): void {
    for (const r of rows) {
        const p = netti.prodotti.get(r.id);
        if (p != null) r.product_netto = { prezzo_netto: p };
        for (const v of r.product_variants ?? []) {
            const pv = netti.varianti.get(v.id);
            if (pv != null) v.product_variant_netto = { prezzo_netto: pv };
        }
    }
}

function normalize(row: ProductRow): Product {
    const variants: ProductVariant[] = (row.product_variants ?? [])
        .map((v) => ({
            id: v.id,
            codice_l2f: v.codice_l2f,
            imballo: v.imballo,
            prezzo_listino: v.prezzo_listino,
            unita_prezzo: v.unita_prezzo,
            sort_order: v.sort_order,
            prezzo_netto: unwrapNetto(v.product_variant_netto),
        }))
        .sort((a, b) => a.sort_order - b.sort_order);

    const hasVariants = variants.length > 0;
    const variantPrices = variants.map((v) => v.prezzo_listino).filter((p): p is number => p != null);
    const prezzoDa = hasVariants
        ? (variantPrices.length ? Math.min(...variantPrices) : null)
        : row.prezzo_listino;
    const unitaPrezzo = hasVariants
        ? variants[0].unita_prezzo
        : (typeof row.attributi?.unita_prezzo === 'string' ? (row.attributi.unita_prezzo as string) : 'pezzo');

    const { product_netto, product_variants, ...rest } = row;
    void product_variants;
    const prodNetto = unwrapNetto(product_netto);
    const variantNetti = variants.map((v) => v.prezzo_netto).filter((p): p is number => p != null);
    const nettoDa = hasVariants
        ? (variantNetti.length ? Math.min(...variantNetti) : null)
        : prodNetto;
    return {
        ...rest,
        prezzo_netto: prodNetto,
        variants,
        hasVariants,
        prezzoDa,
        nettoDa,
        unitaPrezzo,
    };
}

export async function getFamilies(): Promise<ProductFamily[]> {
    const { data, error } = await supabase
        .from('product_families')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export interface Category extends ProductFamily {
    count: number;
    cover: string;
}

export interface LineHighlight {
    /** Valore in evidenza (numero o parola), es. "4.500". */
    v: string;
    /** Unità opzionale, es. "lm", "K". */
    u?: string;
    /** Didascalia, es. "Flusso luminoso". */
    l: string;
}

export interface ProductLine {
    family_id: string;
    linea: string;
    descrizione: string;
    sort_order: number;
    tagline: string | null;
    highlights: LineHighlight[];
    /** Diagramma esplicativo opzionale (es. schema lente Focus). */
    diagram: string | null;
    diagram_nota: string | null;
}

/** Descrizioni "grandi" per linea (es. linee LED), mostrate quando si filtra per linea. */
export async function getProductLines(): Promise<ProductLine[]> {
    const { data, error } = await supabase.from('product_lines').select('*');
    if (error) throw error;
    return data ?? [];
}

/** Famiglie con numero prodotti e immagine copertina, per la vista a macrocategorie. */
export async function getCategories(): Promise<Category[]> {
    const [famRes, prodRes] = await Promise.all([
        supabase.from('product_families').select('*').order('sort_order', { ascending: true }),
        // Stesso filtro dell'elenco, altrimenti la home dichiara numeri che la lista smentisce.
        supabase.from('products').select('family_id').eq('attivo', true).eq('su_l2f', true),
    ]);
    if (famRes.error) throw famRes.error;
    if (prodRes.error) throw prodRes.error;
    const counts = new Map<string, number>();
    for (const p of prodRes.data ?? []) {
        const fid = (p as { family_id: string | null }).family_id;
        if (fid) counts.set(fid, (counts.get(fid) ?? 0) + 1);
    }
    return (famRes.data ?? []).map((f) => ({
        ...f,
        count: counts.get(f.id) ?? 0,
        cover: `/categories/${f.id}.webp`,
    }));
}

interface GetProductsOpts {
    familyId?: string | null;
    search?: string;
}

export async function getProducts(opts: GetProductsOpts = {}, withNetto = false): Promise<Product[]> {
    const { familyId, search } = opts;
    // Il netto si richiede solo da loggati: il ruolo anon non ha SELECT sulle tabelle netto.
    // Per le officine attive la RLS restituisce i valori; per quelle in attesa restituisce vuoto.
    const select = withNetto
        ? '*, product_netto(prezzo_netto), product_variants(id, codice_l2f, imballo, prezzo_listino, unita_prezzo, sort_order, product_variant_netto(prezzo_netto))'
        : '*, product_variants(id, codice_l2f, imballo, prezzo_listino, unita_prezzo, sort_order)';
    // su_l2f: questo è il sito ufficiale del private label, i marchi generici
    // (Brembo, TRW…) vivono solo sul portale CRA. La RLS applica la stessa
    // regola lato database, ma per un utente admin lascia passare tutto:
    // il filtro qui non è ridondante.
    let query = supabase
        .from('products')
        .select(select)
        .eq('attivo', true)
        .eq('su_l2f', true)
        .order('codice_l2f', { ascending: true });

    if (familyId) query = query.eq('family_id', familyId);

    const s = search?.trim();
    if (s) {
        const sNoSpace = s.replace(/\s+/g, ''); // "207 x 175" -> "207x175" (misure)
        const sDigits = s.replace(/[^0-9]/g, ''); // "80Ah" -> "80" (amperaggio)
        const conds = [
            `codice_l2f.ilike.*${s}*`,
            `nome.ilike.*${s}*`,
            `riferimento_oe.ilike.*${s}*`,
            `applicazione.ilike.*${s}*`,
            `attributi->>dimensioni.ilike.*${sNoSpace}*`,
            `attributi->>tecnologia.ilike.*${s}*`,
        ];
        if (sDigits) conds.push(`attributi->>ah.ilike.*${sDigits}*`);
        query = query.or(conds.join(','));
    }

    const [res, netti] = await Promise.all([
        query,
        withNetto ? nettiUtente() : Promise.resolve(null),
    ]);
    if (res.error) throw res.error;
    const rows = (res.data ?? []) as unknown as ProductRow[];
    if (netti) applicaNetti(rows, netti);
    return rows.map(normalize);
}

export async function getProduct(codice: string, withNetto = false): Promise<Product | null> {
    const select = withNetto
        ? '*, product_netto(prezzo_netto), product_variants(*, product_variant_netto(prezzo_netto))'
        : '*, product_variants(*)';
    const [res, netti] = await Promise.all([
        // Anche qui attivo + su_l2f: senza, un prodotto spento o a marchio
        // generico resta raggiungibile scrivendo l'URL a mano.
        supabase.from('products').select(select)
            .eq('codice_l2f', codice).eq('attivo', true).eq('su_l2f', true).maybeSingle(),
        withNetto ? nettiUtente() : Promise.resolve(null),
    ]);
    if (res.error) throw res.error;
    if (!res.data) return null;
    const row = res.data as unknown as ProductRow;
    if (netti) applicaNetti([row], netti);
    return normalize(row);
}

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
export const formatEuro = (n: number | null | undefined): string =>
    n == null ? '—' : euro.format(n);

/** Suffisso unità di misura per il prezzo (es. "/L" per i lubrificanti). */
export const unitSuffix = (unita: string): string => (unita === 'litro' ? '/L' : '');

/* ---------- Unità di vendita ---------- */

/** Che cosa si porta a casa con una unità di questa variante.
 *
 *  I lubrificanti hanno il prezzo **al litro**, ma non si vendono a litri
 *  sfusi: si vendono a fusti e a latte. Senza questa conversione un fusto da
 *  200 L finisce in carrello al prezzo di un litro — 3,60 € invece di 720 €.
 *
 *  Le scatole "12×1 L" restano moltiplicatore 1: lì l'unità di vendita è la
 *  bottiglia da 1 L, e il prezzo al litro è già il prezzo di una bottiglia.
 *  Il cartone da 12 resta scritto nell'etichetta perché si veda. */
export interface UnitaVendita {
    /** Quanti litri (o pezzi) di prezzo entrano in una unità di vendita. */
    fattore: number;
    /** Che cosa è una unità: "Fusto 200 L", "1 L · cartone da 12". Null = pezzo semplice. */
    etichetta: string | null;
    /** Come si legge la quantità: "La quantità è in fusti da 200 L". */
    nota: string | null;
    /** true quando il prezzo di riga è al litro e va moltiplicato per il contenitore. */
    aContenitore: boolean;
}

const UNITA_SEMPLICE: UnitaVendita = { fattore: 1, etichetta: null, nota: null, aContenitore: false };

/** Nome del contenitore in base alla capacità: sotto i 60 L è una latta. */
const contenitore = (litri: number) => (litri >= 60 ? 'fusto' : 'latta');

export function unitaVendita(
    v: { imballo: string | null; unita_prezzo: string } | null | undefined,
): UnitaVendita {
    const imballo = String(v?.imballo ?? '').trim();
    if (!imballo) return UNITA_SEMPLICE;

    // "12×1 L" / "12x1 Kg": confezione multipla, si vende il singolo pezzo.
    const multi = imballo.match(/^(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(l|kg)\b/i);
    if (multi) {
        const [, pezzi, taglio, um] = multi;
        const unita = `${taglio} ${um.toUpperCase() === 'KG' ? 'Kg' : 'L'}`;
        return {
            fattore: 1,
            etichetta: `${unita} · cartone da ${pezzi}`,
            nota: `La quantità è in confezioni da ${unita} (cartone da ${pezzi}).`,
            aContenitore: false,
        };
    }

    // "200 L" col prezzo al litro: una unità è il contenitore intero.
    if (v?.unita_prezzo !== 'litro') return UNITA_SEMPLICE;
    const solo = imballo.match(/^(\d+(?:[.,]\d+)?)\s*l\b/i);
    if (!solo) return UNITA_SEMPLICE;
    const litri = Number(solo[1].replace(',', '.'));
    if (!(litri > 1)) return UNITA_SEMPLICE;
    const nome = contenitore(litri);
    return {
        fattore: litri,
        etichetta: `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${litri} L`,
        nota: `La quantità è in ${nome === 'fusto' ? 'fusti' : 'latte'} da ${litri} L.`,
        aContenitore: true,
    };
}

/** Prezzo di una unità di vendita, arrotondato al centesimo. */
export const prezzoVendita = (
    prezzo: number | null | undefined,
    uv: UnitaVendita,
): number | null => (prezzo == null ? null : Math.round(prezzo * uv.fattore * 100) / 100);
