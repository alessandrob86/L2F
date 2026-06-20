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
        supabase.from('products').select('family_id').eq('attivo', true),
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
    let query = supabase
        .from('products')
        .select(select)
        .eq('attivo', true)
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

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as unknown as ProductRow[]).map(normalize);
}

export async function getProduct(codice: string, withNetto = false): Promise<Product | null> {
    const select = withNetto
        ? '*, product_netto(prezzo_netto), product_variants(*, product_variant_netto(prezzo_netto))'
        : '*, product_variants(*)';
    const { data, error } = await supabase
        .from('products')
        .select(select)
        .eq('codice_l2f', codice)
        .maybeSingle();
    if (error) throw error;
    return data ? normalize(data as unknown as ProductRow) : null;
}

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
export const formatEuro = (n: number | null | undefined): string =>
    n == null ? '—' : euro.format(n);

/** Suffisso unità di misura per il prezzo (es. "/L" per i lubrificanti). */
export const unitSuffix = (unita: string): string => (unita === 'litro' ? '/L' : '');
