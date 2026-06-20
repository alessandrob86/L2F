import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Download, ChevronDown, Save, Package, Building2, AlertCircle, Check, GraduationCap, Plus, Trash2, Users, Pencil, X, ImagePlus, History } from 'lucide-react';
import styles from './Admin.module.css';
import { useAuth } from '../lib/auth';
import { formatEuro, PLACEHOLDER_IMG } from '../lib/catalog';
import { statoLabel } from '../lib/orders';
import {
    getAllOrders, getAllOfficine, updateOrderStato, updateOfficina,
    ordersToCsv, downloadCsv, ORDER_STATI, getAuditOfficine,
    type AdminOrder, type AuditEntry,
} from '../lib/admin';
import {
    getAllCorsi, createCorso, updateCorso, deleteCorso, getIscrizioni, formatDataCorso,
    uploadCorsoImage, iscrizioniChiuse, getCorsiStatByOfficina,
    type CorsoAdmin, type IscrittoRow, type OfficinaCorsiStat,
} from '../lib/academy';
import type { Officina, StatoOfficina } from '../lib/auth';

type Tab = 'ordini' | 'officine' | 'corsi';

export const Admin = () => {
    const { loading, isAdmin } = useAuth();
    const [tab, setTab] = useState<Tab>('ordini');
    const [orders, setOrders] = useState<AdminOrder[] | null>(null);
    const [officine, setOfficine] = useState<Officina[] | null>(null);
    const [corsi, setCorsi] = useState<CorsoAdmin[] | null>(null);
    const [corsiStat, setCorsiStat] = useState<Record<string, OfficinaCorsiStat>>({});
    const [audit, setAudit] = useState<AuditEntry[] | null>(null);
    const [showLog, setShowLog] = useState(false);
    const [err, setErr] = useState(false);
    const [openOrder, setOpenOrder] = useState<string | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);
    const EMPTY_FORM = { titolo: '', data_corso: '', data_fine: '', iscrizioni_entro: '', durata: '', sede: '', posti: '', prezzo: '', min_partecipanti: '', descrizione: '', punti: '', immagine: '' };
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [iscrOpen, setIscrOpen] = useState<string | null>(null);
    const [iscritti, setIscritti] = useState<Record<string, IscrittoRow[]>>({});

    useEffect(() => {
        if (!isAdmin) return;
        Promise.all([getAllOrders(), getAllOfficine(), getAllCorsi(), getCorsiStatByOfficina()])
            .then(([o, f, c, cnt]) => { setOrders(o); setOfficine(f); setCorsi(c); setCorsiStat(cnt); })
            .catch(() => setErr(true));
    }, [isAdmin]);

    const toggleLog = async () => {
        const next = !showLog;
        setShowLog(next);
        if (next && audit === null) {
            try { setAudit(await getAuditOfficine()); } catch { setErr(true); }
        }
    };

    /* datetime ISO → valore per <input datetime-local> in ora locale */
    const toLocalInput = (iso: string | null) => {
        if (!iso) return '';
        const d = new Date(iso);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };
    const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };
    const buildPatch = () => ({
        titolo: form.titolo.trim(),
        descrizione: form.descrizione.trim() || null,
        data_corso: form.data_corso ? new Date(form.data_corso).toISOString() : null,
        data_fine: form.data_fine ? new Date(form.data_fine).toISOString() : null,
        iscrizioni_entro: form.iscrizioni_entro ? new Date(form.iscrizioni_entro).toISOString() : null,
        durata: form.durata.trim() || null,
        sede: form.sede.trim() || null,
        posti: form.posti ? Number(form.posti) : null,
        prezzo: form.prezzo ? Number(form.prezzo) : 0,
        min_partecipanti: form.min_partecipanti ? Number(form.min_partecipanti) : 1,
        immagine: form.immagine || null,
        punti: form.punti.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    const saveCorso = async () => {
        if (!form.titolo.trim()) return;
        try {
            if (editingId) await updateCorso(editingId, buildPatch());
            else await createCorso({ ...buildPatch(), attivo: true });
            resetForm();
            setCorsi(await getAllCorsi());
        } catch { setErr(true); }
    };
    const editCorso = (c: CorsoAdmin) => {
        setForm({
            titolo: c.titolo ?? '', durata: c.durata ?? '', sede: c.sede ?? '',
            posti: c.posti != null ? String(c.posti) : '', descrizione: c.descrizione ?? '',
            prezzo: c.prezzo != null ? String(c.prezzo) : '', min_partecipanti: c.min_partecipanti != null ? String(c.min_partecipanti) : '',
            immagine: c.immagine ?? '', punti: (c.punti ?? []).join('\n'),
            data_corso: toLocalInput(c.data_corso), data_fine: toLocalInput(c.data_fine),
            iscrizioni_entro: toLocalInput(c.iscrizioni_entro),
        });
        setEditingId(c.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const onUploadImg = async (file?: File) => {
        if (!file) return;
        setUploading(true);
        try { const url = await uploadCorsoImage(file); setForm((f) => ({ ...f, immagine: url })); }
        catch { setErr(true); } finally { setUploading(false); }
    };
    const toggleCorso = async (c: CorsoAdmin) => {
        try { await updateCorso(c.id, { attivo: !c.attivo }); setCorsi(await getAllCorsi()); } catch { setErr(true); }
    };
    const removeCorso = async (id: string) => {
        try { await deleteCorso(id); setCorsi((prev) => prev?.filter((c) => c.id !== id) ?? prev); } catch { setErr(true); }
    };
    const openIscritti = async (corsoId: string) => {
        if (iscrOpen === corsoId) { setIscrOpen(null); return; }
        setIscrOpen(corsoId);
        if (!iscritti[corsoId]) {
            try { const r = await getIscrizioni(corsoId); setIscritti((p) => ({ ...p, [corsoId]: r })); } catch { setErr(true); }
        }
    };

    if (loading) return <main className={styles.page}><div className="container"><div className={styles.spinner} /></div></main>;

    if (!isAdmin) {
        return (
            <main className={styles.page}>
                <div className="container">
                    <div className={styles.gate}>
                        <ShieldCheck size={44} />
                        <h1>Area riservata</h1>
                        <p>Questa sezione è accessibile solo agli amministratori L2F.</p>
                        <Link to="/" className={styles.primaryBtn}>Torna alla home</Link>
                    </div>
                </div>
            </main>
        );
    }

    const onStato = async (id: string, stato: string) => {
        setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, stato } : o)) ?? prev);
        try { await updateOrderStato(id, stato); } catch { setErr(true); }
    };

    const patchOfficina = (id: string, patch: Partial<Officina>) =>
        setOfficine((prev) => prev?.map((o) => (o.id === id ? { ...o, ...patch } : o)) ?? prev);

    const saveOfficina = async (o: Officina) => {
        try {
            await updateOfficina(o.id, {
                stato: o.stato,
                codice_cliente: o.codice_cliente || null,
                pacchetto: o.pacchetto || null,
                cashback_rate: Number(o.cashback_rate) || 0,
                obiettivo_cashback: Number(o.obiettivo_cashback) || 0,
                crediti_corsi: Number(o.crediti_corsi) || 0,
                marketing_attivo: !!o.marketing_attivo,
                banca_dati_attiva: !!o.banca_dati_attiva,
            });
            setSavedId(o.id);
            setTimeout(() => setSavedId((s) => (s === o.id ? null : s)), 1800);
        } catch { setErr(true); }
    };

    const exportCsv = () => {
        if (!orders) return;
        downloadCsv(`ordini-l2f-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(orders));
    };

    return (
        <main className={styles.page}>
            <div className="container">
                <header className={styles.head}>
                    <div>
                        <span className={styles.eyebrow}><ShieldCheck size={14} /> Back-office L2F</span>
                        <h1 className={styles.title}>Amministrazione</h1>
                    </div>
                    {tab === 'ordini' && orders && orders.length > 0 && (
                        <button className={styles.exportBtn} onClick={exportCsv}><Download size={16} /> Esporta ordini (CSV)</button>
                    )}
                </header>

                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${tab === 'ordini' ? styles.tabActive : ''}`} onClick={() => setTab('ordini')}>
                        <Package size={16} /> Ordini {orders && <span className={styles.tabCount}>{orders.length}</span>}
                    </button>
                    <button className={`${styles.tab} ${tab === 'officine' ? styles.tabActive : ''}`} onClick={() => setTab('officine')}>
                        <Building2 size={16} /> Officine {officine && <span className={styles.tabCount}>{officine.length}</span>}
                    </button>
                    <button className={`${styles.tab} ${tab === 'corsi' ? styles.tabActive : ''}`} onClick={() => setTab('corsi')}>
                        <GraduationCap size={16} /> Corsi {corsi && <span className={styles.tabCount}>{corsi.length}</span>}
                    </button>
                </div>

                {err && <div className={styles.err}><AlertCircle size={16} /> Si è verificato un errore. Ricarica la pagina.</div>}

                {/* ---------- ORDINI ---------- */}
                {tab === 'ordini' && (
                    !orders ? <div className={styles.spinner} /> :
                    orders.length === 0 ? <div className={styles.state}>Nessun ordine ricevuto.</div> :
                    <div className={styles.list}>
                        {orders.map((o) => {
                            const isOpen = openOrder === o.id;
                            return (
                                <div key={o.id} className={styles.row}>
                                    <div className={styles.rowHead}>
                                        <button className={styles.rowInfo} onClick={() => setOpenOrder(isOpen ? null : o.id)}>
                                            <div className={styles.rowMain}>
                                                <span className={styles.num}>{o.numero}</span>
                                                <span className={styles.sub}>
                                                    {o.officine?.ragione_sociale ?? '—'}
                                                    {o.officine?.codice_cliente ? ` · ${o.officine.codice_cliente}` : ''}
                                                    {' · '}{new Date(o.created_at).toLocaleDateString('it-IT')}
                                                </span>
                                            </div>
                                            <ChevronDown size={16} className={`${styles.chev} ${isOpen ? styles.chevOpen : ''}`} />
                                        </button>
                                        <span className={styles.tot}>{formatEuro(o.totale_netto)}</span>
                                        <select className={`${styles.statoSelect} ${styles['st_' + o.stato] ?? ''}`} value={o.stato} onChange={(e) => onStato(o.id, e.target.value)}>
                                            {ORDER_STATI.map((s) => <option key={s} value={s}>{statoLabel(s)}</option>)}
                                        </select>
                                    </div>
                                    {isOpen && (
                                        <div className={styles.rowBody}>
                                            {o.order_items.map((it) => (
                                                <div key={it.id} className={styles.item}>
                                                    <img className={styles.itemThumb} src={it.immagine || PLACEHOLDER_IMG} alt="" loading="lazy" />
                                                    <div className={styles.itemInfo}>
                                                        <span className={styles.itemName}>{it.nome}{it.imballo ? ` · ${it.imballo}` : ''}</span>
                                                        <span className={styles.itemCode}>{it.codice_l2f}</span>
                                                    </div>
                                                    <span className={styles.itemQty}>×{it.quantita}</span>
                                                    <span className={styles.itemPrice}>{formatEuro(it.prezzo_unitario * it.quantita)}</span>
                                                </div>
                                            ))}
                                            {o.note && <p className={styles.note}>Note: {o.note}</p>}
                                            <p className={styles.contact}>{o.officine?.email} · {o.officine?.citta}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ---------- OFFICINE ---------- */}
                {tab === 'officine' && (
                    !officine ? <div className={styles.spinner} /> :
                    officine.length === 0 ? <div className={styles.state}>Nessuna officina registrata.</div> :
                    <div className={styles.list}>
                        {officine.map((o) => (
                            <div key={o.id} className={styles.offRow}>
                                <div className={styles.offMain}>
                                    <span className={styles.num}>{o.ragione_sociale}{o.is_admin ? ' ·  ADMIN' : ''}</span>
                                    <span className={styles.sub}>{o.email ?? '—'}{o.citta ? ` · ${o.citta}` : ''}{o.piva ? ` · ${o.piva}` : ''}</span>
                                    <span className={styles.offCorsi}>
                                        <GraduationCap size={14} /> Corsi: <strong>{corsiStat[o.id]?.totale ?? 0}</strong>
                                        {' · '}crediti usati: <strong>{corsiStat[o.id]?.crediti ?? 0}/{o.crediti_corsi ?? 0}</strong>
                                        {' · '}acquistati: <strong>{corsiStat[o.id]?.acquisti ?? 0}</strong>
                                    </span>
                                </div>
                                <div className={styles.offFields}>
                                    <label className={`${styles.fld} ${styles.fldWide}`}>
                                        <span>Ragione sociale (dal cliente)</span>
                                        <input type="text" value={o.ragione_sociale} readOnly className={styles.fldReadonly}
                                            title="Nome inserito dal cliente in fase di registrazione — non modificabile" />
                                    </label>
                                    <label className={styles.fld}>
                                        <span>Stato</span>
                                        <select value={o.stato} onChange={(e) => patchOfficina(o.id, { stato: e.target.value as StatoOfficina })}>
                                            <option value="in_attesa">In attesa</option>
                                            <option value="attiva">Attiva</option>
                                            <option value="sospesa">Sospesa</option>
                                        </select>
                                    </label>
                                    <label className={styles.fld}>
                                        <span>Cod. cliente</span>
                                        <input type="text" value={o.codice_cliente ?? ''} placeholder="es. CRA-0001"
                                            onChange={(e) => patchOfficina(o.id, { codice_cliente: e.target.value })} />
                                    </label>
                                    <label className={styles.fld}>
                                        <span>Pacchetto</span>
                                        <select value={o.pacchetto ?? ''} onChange={(e) => patchOfficina(o.id, { pacchetto: e.target.value || null })}>
                                            <option value="">—</option>
                                            <option value="home">home</option>
                                            <option value="flex">flex</option>
                                        </select>
                                    </label>
                                    <div className={`${styles.fld} ${styles.fldWide}`}>
                                        <span>Add-on FLEX</span>
                                        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', paddingBottom: '8px' }}>
                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 0 }}>
                                                <input type="checkbox" checked={!!o.marketing_attivo}
                                                    onChange={(e) => patchOfficina(o.id, { marketing_attivo: e.target.checked })} /> Marketing
                                            </label>
                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 0 }}>
                                                <input type="checkbox" checked={!!o.banca_dati_attiva}
                                                    onChange={(e) => patchOfficina(o.id, { banca_dati_attiva: e.target.checked })} /> Banca dati · L2F Tech
                                            </label>
                                        </div>
                                    </div>
                                    <label className={styles.fld}>
                                        <span>Cashback %</span>
                                        <input type="number" min={0} max={100} step={1} value={o.cashback_rate ?? 0}
                                            onChange={(e) => patchOfficina(o.id, { cashback_rate: Number(e.target.value) })} />
                                    </label>
                                    <label className={styles.fld}>
                                        <span>Obiettivo €</span>
                                        <input type="number" min={0} step={50} value={o.obiettivo_cashback ?? 1000}
                                            onChange={(e) => patchOfficina(o.id, { obiettivo_cashback: Number(e.target.value) })} />
                                    </label>
                                    <label className={styles.fld}>
                                        <span>Crediti corsi</span>
                                        <input type="number" min={0} step={1} value={o.crediti_corsi ?? 1}
                                            onChange={(e) => patchOfficina(o.id, { crediti_corsi: Number(e.target.value) })} />
                                    </label>
                                    <button className={styles.saveBtn} onClick={() => saveOfficina(o)}>
                                        {savedId === o.id ? <><Check size={15} /> Salvato</> : <><Save size={15} /> Salva</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* registro modifiche account (discreto) */}
                {tab === 'officine' && (
                    <div className={styles.logBox}>
                        <button className={styles.logToggle} onClick={toggleLog} aria-expanded={showLog}>
                            <History size={15} /> Registro modifiche account
                            <ChevronDown size={16} className={`${styles.chev} ${showLog ? styles.chevOpen : ''}`} style={{ marginLeft: 'auto' }} />
                        </button>
                        {showLog && (
                            !audit ? <div className={styles.spinner} /> :
                                audit.length === 0 ? <p className={styles.contact} style={{ padding: '0 4px 8px' }}>Nessuna modifica registrata.</p> :
                                    <div className={styles.logList}>
                                        {audit.map((a) => (
                                            <div key={a.id} className={styles.logRow}>
                                                <span className={styles.logWhen}>{new Date(a.created_at).toLocaleString('it-IT')}</span>
                                                <span className={styles.logWho}>{a.actor_nome ?? '—'}</span>
                                                <span className={styles.logWhat}>
                                                    <strong>{a.officina_nome}</strong>: {Object.entries(a.modifiche).map(([k, v]) => `${k} ${String(v.da ?? '∅')}→${String(v.a ?? '∅')}`).join(' · ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                        )}
                    </div>
                )}

                {/* ---------- CORSI ---------- */}
                {tab === 'corsi' && (
                    <div>
                        <div className={styles.corsoForm}>
                            <div className={styles.formTitleRow}>
                                <h3 className={styles.formTitle}>{editingId ? <><Pencil size={16} /> Modifica corso</> : <><Plus size={16} /> Nuovo corso</>}</h3>
                                {editingId && <button className={styles.miniBtn} onClick={resetForm}><X size={14} /> Annulla modifica</button>}
                            </div>

                            <div className={styles.formGrid}>
                                <label className={`${styles.fld} ${styles.fldWide}`}><span>Titolo *</span>
                                    <input type="text" value={form.titolo} onChange={(e) => setForm({ ...form, titolo: e.target.value })} placeholder="Diagnosi avanzata…" /></label>
                                <label className={styles.fld}><span>Durata</span>
                                    <input type="text" value={form.durata} onChange={(e) => setForm({ ...form, durata: e.target.value })} placeholder="es. 4 ore" /></label>
                                <label className={styles.fld}><span>Sede</span>
                                    <input type="text" value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} placeholder="Napoli" /></label>
                                <label className={styles.fld}><span>Posti</span>
                                    <input type="number" min={1} value={form.posti} onChange={(e) => setForm({ ...form, posti: e.target.value })} placeholder="20" /></label>
                                <label className={styles.fld}><span>Prezzo € (senza credito)</span>
                                    <input type="number" min={0} step={1} value={form.prezzo} onChange={(e) => setForm({ ...form, prezzo: e.target.value })} placeholder="es. 120" /></label>
                                <label className={styles.fld}><span>Min. partecipanti</span>
                                    <input type="number" min={1} step={1} value={form.min_partecipanti} onChange={(e) => setForm({ ...form, min_partecipanti: e.target.value })} placeholder="es. 6" /></label>
                                <label className={styles.fld}><span>Inizio</span>
                                    <input type="datetime-local" value={form.data_corso} onChange={(e) => setForm({ ...form, data_corso: e.target.value })} /></label>
                                <label className={styles.fld}><span>Fine</span>
                                    <input type="datetime-local" value={form.data_fine} onChange={(e) => setForm({ ...form, data_fine: e.target.value })} /></label>
                                <label className={styles.fld}><span>Iscrizioni entro</span>
                                    <input type="datetime-local" value={form.iscrizioni_entro} onChange={(e) => setForm({ ...form, iscrizioni_entro: e.target.value })} /></label>
                            </div>

                            <div className={styles.formMedia}>
                                <label className={styles.uploadBtn}>
                                    <ImagePlus size={16} /> {uploading ? 'Carico…' : form.immagine ? 'Cambia foto' : 'Carica foto'}
                                    <input type="file" accept="image/*" hidden onChange={(e) => onUploadImg(e.target.files?.[0])} />
                                </label>
                                {form.immagine && (
                                    <span className={styles.mediaPreviewWrap}>
                                        <img src={form.immagine} alt="" className={styles.mediaPreview} />
                                        <button className={styles.mediaClear} onClick={() => setForm({ ...form, immagine: '' })} aria-label="Rimuovi foto"><X size={13} /></button>
                                    </span>
                                )}
                            </div>

                            <label className={styles.fldFull}><span>Descrizione / contenuto</span>
                                <textarea rows={3} value={form.descrizione} onChange={(e) => setForm({ ...form, descrizione: e.target.value })} placeholder="Cosa si impara, programma, docente…" /></label>
                            <label className={styles.fldFull}><span>Punti chiave (uno per riga)</span>
                                <textarea rows={3} value={form.punti} onChange={(e) => setForm({ ...form, punti: e.target.value })} placeholder={'Diagnosi sistemi climatizzazione\nRicarica gas R134a / R1234yf\nProcedura guidata con strumenti'} /></label>

                            <button className={styles.exportBtn} onClick={saveCorso} style={{ alignSelf: 'flex-start' }}>
                                {editingId ? <><Save size={16} /> Salva modifiche</> : <><Plus size={16} /> Crea corso</>}
                            </button>
                        </div>

                        {!corsi ? <div className={styles.spinner} /> :
                            corsi.length === 0 ? <div className={styles.state}>Nessun corso. Creane uno qui sopra.</div> :
                                <div className={styles.list}>
                                    {corsi.map((c) => {
                                        const chiuso = iscrizioniChiuse(c);
                                        return (
                                            <div key={c.id} className={styles.row}>
                                                <div className={styles.rowHead}>
                                                    {c.immagine && <img src={c.immagine} alt="" className={styles.corsoThumb} />}
                                                    <button className={styles.rowInfo} onClick={() => openIscritti(c.id)}>
                                                        <div className={styles.rowMain}>
                                                            <span className={styles.num}>
                                                                {c.titolo}
                                                                {!c.attivo && <span className={styles.tagMuted}>nascosto</span>}
                                                                {c.attivo && chiuso && <span className={styles.tagClosed}>iscrizioni chiuse</span>}
                                                                {c.iscritti >= c.min_partecipanti
                                                                    ? <span className={styles.tagOk}>confermato</span>
                                                                    : <span className={styles.tagMuted}>{c.iscritti}/{c.min_partecipanti} min</span>}
                                                            </span>
                                                            <span className={styles.sub}>
                                                                {formatDataCorso(c.data_corso)}{c.durata ? ` · ${c.durata}` : ''}{c.sede ? ` · ${c.sede}` : ''}{c.posti != null ? ` · ${c.posti} posti` : ''}
                                                                {c.prezzo > 0 ? ` · €${c.prezzo} senza credito` : ' · gratis con credito'}
                                                                {c.iscrizioni_entro ? ` · entro ${formatDataCorso(c.iscrizioni_entro)}` : ''}
                                                            </span>
                                                        </div>
                                                        <span className={styles.iscrCount}><Users size={14} /> {c.iscritti}</span>
                                                    </button>
                                                    <button className={styles.miniBtn} onClick={() => editCorso(c)}><Pencil size={14} /> Modifica</button>
                                                    <button className={styles.miniBtn} onClick={() => toggleCorso(c)}>{c.attivo ? 'Nascondi' : 'Pubblica'}</button>
                                                    <button className={styles.miniDanger} onClick={() => removeCorso(c.id)} aria-label="Elimina"><Trash2 size={15} /></button>
                                                </div>
                                                {iscrOpen === c.id && (
                                                    <div className={styles.rowBody}>
                                                        {(iscritti[c.id] ?? []).length === 0 ? <p className={styles.contact}>Nessuna adesione.</p> :
                                                            (iscritti[c.id] ?? []).map((r) => (
                                                                <div key={r.id} className={styles.item}>
                                                                    <span className={styles.itemName}>{r.officine?.ragione_sociale}{r.officine?.codice_cliente ? ` · ${r.officine.codice_cliente}` : ''}</span>
                                                                    <span className={styles.contact}>{r.officine?.email}</span>
                                                                    <span className={r.con_credito ? styles.tagOk : styles.tagBuy}>
                                                                        {r.con_credito ? 'A credito' : `Acquistato €${r.prezzo_pagato}`}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                        }
                    </div>
                )}
            </div>
        </main>
    );
};
