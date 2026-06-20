import { supabase } from './supabase';
import type { CartItem } from './cart';

export interface SubmittedOrder {
    id: string;
    numero: string;
}

/** Inserisce ordine + righe. La RLS richiede officina attiva proprietaria. */
export async function submitOrder(params: {
    officinaId: string;
    items: CartItem[];
    note?: string;
    totaleListino: number;
    totaleNetto: number;
}): Promise<SubmittedOrder> {
    const { officinaId, items, note, totaleListino, totaleNetto } = params;

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            officina_id: officinaId,
            note: note?.trim() || null,
            totale_listino: totaleListino,
            totale_netto: totaleNetto,
        })
        .select('id, numero')
        .single();
    if (error) throw error;

    const rows = items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        codice_l2f: it.codice_l2f,
        nome: it.nome,
        imballo: it.imballo,
        prezzo_unitario: it.prezzo_netto ?? it.prezzo_listino ?? 0,
        quantita: it.quantita,
    }));
    const { error: e2 } = await supabase.from('order_items').insert(rows);
    if (e2) throw e2;

    // Notifica email (best-effort): non blocca la conferma se fallisce.
    try {
        await supabase.functions.invoke('send-order', { body: { order_id: order.id } });
    } catch {
        /* l'ordine è comunque registrato a DB */
    }

    return order as SubmittedOrder;
}

export interface OrderItemRow {
    id: string;
    codice_l2f: string | null;
    nome: string | null;
    imballo: string | null;
    prezzo_unitario: number;
    quantita: number;
    immagine: string | null;
}

export interface OrderSummary {
    id: string;
    numero: string;
    stato: string;
    totale_listino: number;
    totale_netto: number;
    note: string | null;
    created_at: string;
    order_items: OrderItemRow[];
}

/** Ordini dell'officina loggata (RLS: solo i propri). */
interface RawItem {
    id: string; codice_l2f: string | null; nome: string | null; imballo: string | null;
    prezzo_unitario: number; quantita: number;
    products?: { immagine: string | null }[] | { immagine: string | null } | null;
}

export async function getMyOrders(): Promise<OrderSummary[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('id, numero, stato, totale_listino, totale_netto, note, created_at, order_items(id, codice_l2f, nome, imballo, prezzo_unitario, quantita, products(immagine))')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((o) => {
        const order = o as unknown as Omit<OrderSummary, 'order_items'> & { order_items: RawItem[] };
        return {
            ...order,
            order_items: (order.order_items ?? []).map((it) => {
                const p = it.products;
                const immagine = Array.isArray(p) ? (p[0]?.immagine ?? null) : (p?.immagine ?? null);
                return {
                    id: it.id, codice_l2f: it.codice_l2f, nome: it.nome, imballo: it.imballo,
                    prezzo_unitario: it.prezzo_unitario, quantita: it.quantita, immagine,
                };
            }),
        };
    }) as OrderSummary[];
}

const STATO_LABEL: Record<string, string> = {
    inviato: 'Inviato',
    in_lavorazione: 'In lavorazione',
    evaso: 'Evaso',
    annullato: 'Annullato',
};
export const statoLabel = (s: string): string => STATO_LABEL[s] ?? s;
