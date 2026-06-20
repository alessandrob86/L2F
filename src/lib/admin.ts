import { supabase } from './supabase';
import type { Officina, StatoOfficina } from './auth';

export interface AdminOrderItem {
    id: string;
    codice_l2f: string | null;
    nome: string | null;
    imballo: string | null;
    prezzo_unitario: number;
    quantita: number;
    immagine: string | null;
}

export interface AdminOrder {
    id: string;
    numero: string;
    stato: string;
    totale_listino: number;
    totale_netto: number;
    note: string | null;
    created_at: string;
    officine: { ragione_sociale: string; codice_cliente: string | null; citta: string | null; email: string | null } | null;
    order_items: AdminOrderItem[];
}

export const ORDER_STATI = ['inviato', 'in_lavorazione', 'evaso', 'annullato'] as const;

interface RawAdminItem extends Omit<AdminOrderItem, 'immagine'> {
    products?: { immagine: string | null }[] | { immagine: string | null } | null;
}

/** Tutti gli ordini (solo admin via RLS). */
export async function getAllOrders(): Promise<AdminOrder[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('id, numero, stato, totale_listino, totale_netto, note, created_at, officine(ragione_sociale, codice_cliente, citta, email), order_items(id, codice_l2f, nome, imballo, prezzo_unitario, quantita, products(immagine))')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((o) => {
        const order = o as unknown as Omit<AdminOrder, 'order_items'> & { order_items: RawAdminItem[] };
        return {
            ...order,
            order_items: (order.order_items ?? []).map((it) => {
                const p = it.products;
                const immagine = Array.isArray(p) ? (p[0]?.immagine ?? null) : (p?.immagine ?? null);
                const { products: _drop, ...rest } = it;
                void _drop;
                return { ...rest, immagine };
            }),
        };
    }) as AdminOrder[];
}

export async function updateOrderStato(id: string, stato: string): Promise<void> {
    const { error } = await supabase.from('orders').update({ stato }).eq('id', id);
    if (error) throw error;
}

/** Tutte le officine (solo admin via RLS). */
export async function getAllOfficine(): Promise<Officina[]> {
    const { data, error } = await supabase
        .from('officine')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Officina[];
}

export interface OfficinaPatch {
    stato?: StatoOfficina;
    codice_cliente?: string | null;
    pacchetto?: string | null;
    cashback_rate?: number;
    obiettivo_cashback?: number;
    crediti_corsi?: number;
    marketing_attivo?: boolean;
    banca_dati_attiva?: boolean;
}

export async function updateOfficina(id: string, patch: OfficinaPatch): Promise<void> {
    const { error } = await supabase.from('officine').update(patch).eq('id', id);
    if (error) throw error;
}

/* ---------- Registro modifiche account (audit, solo admin) ---------- */
export interface AuditEntry {
    id: string;
    officina_nome: string | null;
    actor_nome: string | null;
    modifiche: Record<string, { da: unknown; a: unknown }>;
    created_at: string;
}

export async function getAuditOfficine(limit = 100): Promise<AuditEntry[]> {
    const { data, error } = await supabase
        .from('audit_officine')
        .select('id, officina_nome, actor_nome, modifiche, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return (data ?? []) as AuditEntry[];
}

/* ---------- Export ordini → CSV (per import AS/400) ---------- */
function csvField(v: unknown): string {
    const s = v == null ? '' : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Una riga per articolo: pronto per l'import nel gestionale. */
export function ordersToCsv(orders: AdminOrder[]): string {
    const header = [
        'Numero ordine', 'Data', 'Codice cliente', 'Ragione sociale',
        'Codice articolo', 'Prodotto', 'Imballo', 'Quantita',
        'Prezzo unitario', 'Totale riga', 'Stato',
    ];
    const lines = [header.join(';')];
    for (const o of orders) {
        const data = new Date(o.created_at).toLocaleDateString('it-IT');
        for (const it of o.order_items) {
            lines.push([
                o.numero, data,
                o.officine?.codice_cliente ?? '', o.officine?.ragione_sociale ?? '',
                it.codice_l2f ?? '', it.nome ?? '', it.imballo ?? '', it.quantita,
                Number(it.prezzo_unitario).toFixed(2), (Number(it.prezzo_unitario) * it.quantita).toFixed(2),
                o.stato,
            ].map(csvField).join(';'));
        }
    }
    return lines.join('\r\n');
}

/** Avvia il download di un file (con BOM così Excel apre l'UTF-8 correttamente). */
export function downloadCsv(filename: string, csv: string): void {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
