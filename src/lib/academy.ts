import { supabase } from './supabase';

export interface Corso {
    id: string;
    titolo: string;
    descrizione: string | null;
    data_corso: string | null;
    data_fine: string | null;
    iscrizioni_entro: string | null;
    durata: string | null;
    sede: string | null;
    posti: number | null;
    immagine: string | null;
    punti: string[];
    prezzo: number;
    min_partecipanti: number;
    iscritti_count: number;
    attivo: boolean;
    created_at: string;
}

export interface MyIscrizione {
    corso_id: string;
    con_credito: boolean;
}

/** true se le iscrizioni sono chiuse (scadenza superata o corso non attivo). */
export function iscrizioniChiuse(c: Corso): boolean {
    if (!c.attivo) return true;
    if (c.iscrizioni_entro) return new Date(c.iscrizioni_entro).getTime() < Date.now();
    return false;
}

/** Carica una foto del corso nello Storage e ritorna l'URL pubblico. */
export async function uploadCorsoImage(file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('corsi').upload(path, file, { contentType: file.type });
    if (error) throw error;
    return supabase.storage.from('corsi').getPublicUrl(path).data.publicUrl;
}

/* ---------- lato officina ---------- */

/** Corsi visibili (RLS: attivi, per officine attive). */
export async function getCorsi(): Promise<Corso[]> {
    const { data, error } = await supabase
        .from('corsi')
        .select('*')
        .order('data_corso', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as Corso[];
}

/** Iscrizioni dell'officina (con tipo credito/acquisto), per calcolare i crediti usati. */
export async function getMyIscrizioni(): Promise<MyIscrizione[]> {
    const { data, error } = await supabase.from('iscrizioni_corsi').select('corso_id, con_credito');
    if (error) throw error;
    return (data ?? []) as MyIscrizione[];
}

/** Aderisce a un corso: con un credito gratuito oppure come acquisto (prezzo). */
export async function aderisci(corsoId: string, officinaId: string, conCredito: boolean, prezzo = 0): Promise<void> {
    const { error } = await supabase.from('iscrizioni_corsi').insert({
        corso_id: corsoId,
        officina_id: officinaId,
        con_credito: conCredito,
        prezzo_pagato: conCredito ? 0 : prezzo,
    });
    if (error) throw error;
    try {
        await supabase.functions.invoke('send-iscrizione', { body: { corso_id: corsoId } });
    } catch {
        /* iscrizione comunque registrata a DB */
    }
}

/* ---------- lato admin ---------- */

export interface CorsoAdmin extends Corso {
    iscritti: number;
}

export async function getAllCorsi(): Promise<CorsoAdmin[]> {
    const { data, error } = await supabase
        .from('corsi')
        .select('*')
        .order('data_corso', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return ((data ?? []) as Corso[]).map((c) => ({ ...c, iscritti: c.iscritti_count }));
}

export interface OfficinaCorsiStat { totale: number; crediti: number; acquisti: number; }

/** Statistica corsi per officina (totale / a credito / acquistati) per il pannello admin. */
export async function getCorsiStatByOfficina(): Promise<Record<string, OfficinaCorsiStat>> {
    const { data, error } = await supabase.from('iscrizioni_corsi').select('officina_id, con_credito');
    if (error) throw error;
    const out: Record<string, OfficinaCorsiStat> = {};
    for (const r of (data ?? []) as { officina_id: string; con_credito: boolean }[]) {
        const s = (out[r.officina_id] ??= { totale: 0, crediti: 0, acquisti: 0 });
        s.totale++;
        if (r.con_credito) s.crediti++; else s.acquisti++;
    }
    return out;
}

export async function createCorso(c: Partial<Corso>): Promise<void> {
    const { error } = await supabase.from('corsi').insert(c);
    if (error) throw error;
}

export async function updateCorso(id: string, patch: Partial<Corso>): Promise<void> {
    const { error } = await supabase.from('corsi').update(patch).eq('id', id);
    if (error) throw error;
}

export async function deleteCorso(id: string): Promise<void> {
    const { error } = await supabase.from('corsi').delete().eq('id', id);
    if (error) throw error;
}

export interface IscrittoRow {
    id: string;
    created_at: string;
    con_credito: boolean;
    prezzo_pagato: number;
    officine: { ragione_sociale: string; codice_cliente: string | null; email: string | null } | null;
}

export async function getIscrizioni(corsoId: string): Promise<IscrittoRow[]> {
    const { data, error } = await supabase
        .from('iscrizioni_corsi')
        .select('id, created_at, con_credito, prezzo_pagato, officine(ragione_sociale, codice_cliente, email)')
        .eq('corso_id', corsoId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as IscrittoRow[];
}

/* ---------- util ---------- */
export const formatDataCorso = (iso: string | null): string =>
    iso
        ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Data da definire';
