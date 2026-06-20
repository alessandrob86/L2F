import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Lock, AlertCircle, PackageSearch, ArrowLeft, ShoppingCart, Plus, LayoutGrid, List } from 'lucide-react';
import styles from './Catalogo.module.css';
import logoparts from '../assets/logoparts.png';
import { CategoryGallery } from '../components/sections/CategoryGallery';
import { LineShowcase } from '../components/sections/LineShowcase';
import { KelvinRangeSlider } from '../components/KelvinRangeSlider';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import {
    getCategories,
    getProducts,
    getProductLines,
    formatEuro,
    unitSuffix,
    PLACEHOLDER_IMG,
    type Product,
    type Category,
    type ProductLine,
} from '../lib/catalog';

const MotionLink = motion.create(Link);

/** Riassunto attributi chiave per la card, per famiglia. */
function attrSummary(p: Product): string {
    const a = p.attributi ?? {};
    const parts: string[] = [];
    if (a.ah) parts.push(`${a.ah}Ah`);
    if (a.spunto) parts.push(`${a.spunto}A`);
    if (a.polo) parts.push(String(a.polo));
    if (a.attacco) parts.push(String(a.attacco));
    if (a.specifica) parts.push(String(a.specifica));
    if (a.lato) parts.push(String(a.lato));
    if (a.tipo && parts.length === 0) {
        const t = String(a.tipo);
        parts.push(t.charAt(0).toUpperCase() + t.slice(1));
    }
    return parts.join(' · ');
}

/* Filtri a faccette per famiglia: chip testuali raggruppati per riga etichettata. */
interface Facet {
    dim: string;
    label: string;
    suffix?: string;
    numeric?: boolean;
    pretty?: boolean;
}
const FACETS: Record<string, Facet[]> = {
    batterie: [
        { dim: 'linea', label: 'Linea' },
        { dim: 'ah', label: 'Amperaggio', suffix: 'Ah', numeric: true },
    ],
    'lampade-led': [
        { dim: 'linea', label: 'Linea' },
        { dim: 'attacco', label: 'Attacco' },
        { dim: 'canbus', label: 'CANBUS' },
    ],
    filtri: [{ dim: 'tipo', label: 'Tipo', pretty: true }],
    lubrificanti: [{ dim: 'gradazione', label: 'Gradazione' }],
    'pastiglie-freno': [{ dim: 'lato', label: 'Lato' }],
    chimica: [{ dim: 'tipo', label: 'Tipo', pretty: true }],
};
const prettyLabel = (v: string) => v.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/* Range completo dello slider temperatura colore (Kelvin). */
const KMIN = 3300;
const KMAX = 10000;

/* Tecnologia mostrata tra parentesi sui chip di linea batterie. */
const LINEA_TECH: Record<string, string> = { Astra: 'AGM', Eclipse: 'EFB' };
const facetChipLabel = (f: Facet, v: string): string => {
    let base = (f.pretty ? prettyLabel(v) : v) + (f.suffix ?? '');
    if (f.dim === 'linea' && LINEA_TECH[v]) base += ` (${LINEA_TECH[v]})`;
    return base;
};

export const Catalogo = () => {
    const { isActive } = useAuth();
    const { add, open } = useCart();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFamily = searchParams.get('famiglia');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'rows'>('grid');

    // Quick-cart dalla card: prodotti senza varianti → aggiunge subito; con varianti → apre la scheda per scegliere il formato
    const quickAdd = (e: React.MouseEvent, p: Product) => {
        e.preventDefault();
        e.stopPropagation();
        if (p.hasVariants) { navigate(`/catalogo/${encodeURIComponent(p.codice_l2f)}`); return; }
        add({
            product_id: p.id, variant_id: null, codice_l2f: p.codice_l2f, nome: p.nome,
            imballo: null, prezzo_listino: p.prezzoDa, prezzo_netto: p.nettoDa,
            unita: p.unitaPrezzo, quantita: 1, immagine: p.immagine ?? null,
        });
        open();
    };

    const [categories, setCategories] = useState<Category[]>([]);
    const [lineInfo, setLineInfo] = useState<Record<string, ProductLine>>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [facetVals, setFacetVals] = useState<Record<string, string>>({});
    const [kRange, setKRange] = useState<[number, number]>([KMIN, KMAX]);
    const [specQuery, setSpecQuery] = useState('');
    const [specOpen, setSpecOpen] = useState(false);

    const showProducts = !!activeFamily || search.trim().length > 0;

    // Faccette (Tipologia/Linea/Amperaggio…) coi valori distinti dai prodotti caricati
    const facetData = useMemo(() => {
        const facets = activeFamily ? (FACETS[activeFamily] ?? []) : [];
        return facets.map((f) => {
            const seen = new Set<string>();
            const vals: string[] = [];
            for (const p of products) {
                const raw = (p.attributi as Record<string, unknown>)?.[f.dim];
                if (raw != null) {
                    const s = String(raw);
                    if (!seen.has(s)) {
                        seen.add(s);
                        vals.push(s);
                    }
                }
            }
            vals.sort((a, b) => (f.numeric ? Number(a) - Number(b) : a.localeCompare(b)));
            return { ...f, values: vals };
        });
    }, [products, activeFamily]);

    // Solo i valori validi per la famiglia corrente (auto-reset cambiando famiglia)
    const effectiveFacets: Record<string, string> = {};
    for (const f of facetData) {
        const v = facetVals[f.dim];
        if (v && f.values.includes(v)) effectiveFacets[f.dim] = v;
    }
    const activeFacetEntries = Object.entries(effectiveFacets);

    // Vetrina "grande" della linea selezionata (es. linea LED)
    const activeLinea = effectiveFacets['linea'];
    const activeLine = activeLinea && activeFamily ? lineInfo[`${activeFamily}|${activeLinea}`] : undefined;

    // Filtro temperatura colore (slider a due maniglie): attivo se il range è stato ristretto
    const [kLow, kHigh] = kRange;
    const hasKelvin = useMemo(
        () => activeFamily === 'lampade-led' && products.some((p) => (p.attributi as Record<string, unknown>)?.kelvin),
        [products, activeFamily]
    );
    const kelvinActive = hasKelvin && (kLow > KMIN || kHigh < KMAX);
    // quante lampade rientrano nell'intervallo di colore (solo per il messaggio live)
    const kelvinMatchCount = useMemo(() => {
        if (!kelvinActive) return null;
        return products.filter((p) => {
            const k = Number(String((p.attributi as Record<string, unknown>)?.kelvin ?? '').replace(/\D/g, ''));
            return Number.isFinite(k) && k >= kLow && k <= kHigh;
        }).length;
    }, [products, kelvinActive, kLow, kHigh]);

    // Specifiche lubrificanti: opzioni del menu (token puliti) ricavate dal DB
    const allSpecs = useMemo(() => {
        if (activeFamily !== 'lubrificanti') return [];
        const set = new Set<string>();
        for (const p of products) {
            const arr = (p.attributi as Record<string, unknown>)?.specifiche;
            if (Array.isArray(arr)) {
                for (const s of arr) {
                    const str = String(s);
                    if (str.length <= 28) set.add(str); // esclude la prosa lunga dal menu
                }
            }
        }
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [products, activeFamily]);

    const specQ = activeFamily === 'lubrificanti' ? specQuery.trim().toLowerCase() : '';
    const specMatches = (specQ
        ? allSpecs.filter((s) => s.toLowerCase().includes(specQ))
        : allSpecs
    ).slice(0, 14);

    const visibleProducts = products.filter((p) => {
        const a = p.attributi as Record<string, unknown>;
        for (const [dim, val] of activeFacetEntries) {
            if (String(a?.[dim] ?? '') !== val) return false;
        }
        if (specQ && !String(a?.omologazioni ?? '').toLowerCase().includes(specQ)) return false;
        if (kelvinActive) {
            const k = Number(String(a?.kelvin ?? '').replace(/\D/g, ''));
            if (!Number.isFinite(k) || k < kLow || k > kHigh) return false;
        }
        return true;
    });

    const toggleFacet = (dim: string, val: string) =>
        setFacetVals((prev) => {
            const next = { ...prev };
            if (next[dim] === val) delete next[dim];
            else next[dim] = val;
            return next;
        });
    const clearFacet = (dim: string) =>
        setFacetVals((prev) => {
            const next = { ...prev };
            delete next[dim];
            return next;
        });

    const familyName = useMemo(() => {
        const map = new Map(categories.map((c) => [c.id, c.nome]));
        return (id: string | null) => (id ? map.get(id) ?? '' : '');
    }, [categories]);

    // Categorie (sempre caricate: servono per griglia e per i nomi)
    useEffect(() => {
        getCategories().then(setCategories).catch(() => setCategories([]));
    }, []);

    // Descrizioni "grandi" per linea (es. linee LED)
    useEffect(() => {
        getProductLines()
            .then((rows) => {
                const m: Record<string, ProductLine> = {};
                for (const r of rows) m[`${r.family_id}|${r.linea}`] = r;
                setLineInfo(m);
            })
            .catch(() => setLineInfo({}));
    }, []);

    // Prodotti (solo quando si è in vista prodotti)
    useEffect(() => {
        if (!showProducts) return;
        let active = true;
        const run = () => {
            setLoading(true);
            setError(false);
            getProducts({ familyId: activeFamily, search }, isActive)
                .then((data) => active && setProducts(data))
                .catch(() => active && setError(true))
                .finally(() => active && setLoading(false));
        };
        const t = setTimeout(run, search ? 250 : 0);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [activeFamily, search, showProducts, isActive]);

    const selectFamily = (id: string | null) => {
        setSearch('');
        if (id) setSearchParams({ famiglia: id });
        else setSearchParams({});
    };

    const backToCategories = () => {
        setSearch('');
        setSearchParams({});
    };

    return (
        <main className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <img src={logoparts} alt="L2F Parts" className={styles.logo} />
                    <h1 className={styles.title}>Catalogo</h1>
                    <p className={styles.subtitle}>
                        La gamma private label L2F. Prezzi di listino visibili a tutti;
                        i <strong>prezzi netti riservati</strong> alle officine del network.
                    </p>
                </header>

                {/* Ricerca globale (sempre visibile) */}
                <div className={styles.searchRow}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            type="search"
                            placeholder="Cerca per codice, OE o applicazione…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Cerca nel catalogo"
                        />
                    </div>
                </div>

                {!showProducts ? (
                    /* ---------- VISTA MACROCATEGORIE — "La Galleria" ---------- */
                    <CategoryGallery categories={categories} />
                ) : (
                    /* ---------- VISTA PRODOTTI ---------- */
                    <>
                        <div className={styles.toolbar}>
                            <button className={styles.backCats} onClick={backToCategories}>
                                <ArrowLeft size={16} /> Tutte le categorie
                            </button>
                            <div className={styles.families}>
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        className={`${styles.chip} ${activeFamily === c.id ? styles.chipActive : ''}`}
                                        onClick={() => selectFamily(c.id)}
                                    >
                                        {c.nome}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeFamily === 'batterie' && (
                            <p className={styles.familyNote}>
                                Tre tecnologie: <strong>AGM</strong> (linea Astra) per veicoli con Start&amp;Stop
                                e forti assorbimenti elettrici; <strong>EFB</strong> (linea Eclipse) per lo
                                Start&amp;Stop di base; <strong>Standard</strong> (Syncro, Titan, Top Performance)
                                per gli impieghi tradizionali.
                            </p>
                        )}

                        {(facetData.some((f) => f.values.length > 1) ||
                            (activeFamily === 'lubrificanti' && allSpecs.length > 0)) && (
                            <div className={styles.facets}>
                                {facetData
                                    .filter((f) => f.values.length > 1)
                                    .map((f) => (
                                        <div key={f.dim} className={styles.facetRow}>
                                            <span className={styles.subLabel}>{f.label}</span>
                                            <button
                                                className={`${styles.subChip} ${!effectiveFacets[f.dim] ? styles.subChipActive : ''}`}
                                                onClick={() => clearFacet(f.dim)}
                                            >
                                                Tutte
                                            </button>
                                            {f.values.map((v) => (
                                                <button
                                                    key={v}
                                                    className={`${styles.subChip} ${effectiveFacets[f.dim] === v ? styles.subChipActive : ''}`}
                                                    onClick={() => toggleFacet(f.dim, v)}
                                                >
                                                    {facetChipLabel(f, v)}
                                                </button>
                                            ))}
                                        </div>
                                    ))}

                                {hasKelvin && (
                                    <div className={styles.facetRow}>
                                        <span className={styles.subLabel}>Temperatura</span>
                                        <KelvinRangeSlider
                                            min={KMIN}
                                            max={KMAX}
                                            low={kLow}
                                            high={kHigh}
                                            onChange={(lo, hi) => setKRange([lo, hi])}
                                        />
                                        <span className={styles.kVal}>
                                            {kelvinActive ? `${kLow}–${kHigh}K` : `${KMIN}–${KMAX}K`}
                                            {kelvinActive && (
                                                <em className={kelvinMatchCount ? styles.kCount : styles.kCountZero}>
                                                    {kelvinMatchCount
                                                        ? `${kelvinMatchCount} lampad${kelvinMatchCount === 1 ? 'a' : 'e'}`
                                                        : 'nessuna lampada di questo colore'}
                                                </em>
                                            )}
                                            {kelvinActive && (
                                                <button
                                                    type="button"
                                                    className={styles.kReset}
                                                    onClick={() => setKRange([KMIN, KMAX])}
                                                    aria-label="Azzera filtro temperatura"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {activeFamily === 'lubrificanti' && allSpecs.length > 0 && (
                                    <div className={styles.facetRow}>
                                        <span className={styles.subLabel}>Specifica</span>
                                        <div className={styles.combobox}>
                                            <input
                                                className={styles.specInput}
                                                type="text"
                                                placeholder="Seleziona o scrivi una specifica (es. ACEA C3, VW 504.00, MB 229.51)…"
                                                value={specQuery}
                                                onChange={(e) => {
                                                    setSpecQuery(e.target.value);
                                                    setSpecOpen(true);
                                                }}
                                                onFocus={() => setSpecOpen(true)}
                                                onBlur={() => window.setTimeout(() => setSpecOpen(false), 120)}
                                            />
                                            {specQuery && (
                                                <button
                                                    type="button"
                                                    className={styles.specClear}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => setSpecQuery('')}
                                                    aria-label="Cancella specifica"
                                                >
                                                    ×
                                                </button>
                                            )}
                                            {specOpen && specMatches.length > 0 && (
                                                <ul className={styles.specMenu}>
                                                    {specMatches.map((s) => (
                                                        <li key={s}>
                                                            <button
                                                                type="button"
                                                                className={styles.specOption}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => {
                                                                    setSpecQuery(s);
                                                                    setSpecOpen(false);
                                                                }}
                                                            >
                                                                {s}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeLine && (
                            <LineShowcase line={activeLine} familyLabel={familyName(activeFamily)} />
                        )}

                        {error ? (
                            <div className={styles.state}>
                                <AlertCircle size={32} />
                                <p>Non riusciamo a caricare il catalogo in questo momento.</p>
                                <button className={styles.retry} onClick={() => setSearch((s) => s + '')}>Riprova</button>
                            </div>
                        ) : loading ? (
                            <div className={styles.grid} aria-busy="true">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className={`${styles.card} ${styles.skeleton}`} />
                                ))}
                            </div>
                        ) : visibleProducts.length === 0 ? (
                            <div className={styles.state}>
                                <PackageSearch size={32} />
                                <p>Nessun prodotto trovato{search ? ` per “${search}”` : ''}.</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.resultsBar}>
                                    <div className={styles.count}>
                                        {visibleProducts.length} prodotti
                                        {activeFamily ? ` · ${familyName(activeFamily)}` : ''}
                                        {activeFacetEntries
                                            .map(([dim, v]) => {
                                                const f = facetData.find((x) => x.dim === dim);
                                                return ` · ${f ? facetChipLabel(f, v) : v}`;
                                            })
                                            .join('')}
                                        {specQ ? ` · ${specQuery.trim()}` : ''}
                                        {kelvinActive ? ` · ${kLow}–${kHigh}K` : ''}
                                    </div>
                                    <div className={styles.viewToggle} role="group" aria-label="Visualizzazione">
                                        <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnOn : ''}`} onClick={() => setViewMode('grid')} aria-label="Vista griglia" aria-pressed={viewMode === 'grid'}><LayoutGrid size={16} /></button>
                                        <button className={`${styles.viewBtn} ${viewMode === 'rows' ? styles.viewBtnOn : ''}`} onClick={() => setViewMode('rows')} aria-label="Vista a righe" aria-pressed={viewMode === 'rows'}><List size={16} /></button>
                                    </div>
                                </div>
                                <div className={viewMode === 'grid' ? styles.grid : styles.rowsList}>
                                    {visibleProducts.map((p, i) => (
                                        <MotionLink
                                            key={p.id}
                                            to={`/catalogo/${encodeURIComponent(p.codice_l2f)}`}
                                            className={`${styles.card} ${viewMode === 'rows' ? styles.cardRow : ''}`}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.3) }}
                                        >
                                            <div className={`${styles.thumb} ${p.family_id === 'lampade-led' ? styles.thumbLight : ''}`}>
                                                <img
                                                    className={p.immagine ? styles.thumbImg : styles.thumbPlaceholder}
                                                    src={p.immagine || PLACEHOLDER_IMG}
                                                    alt={p.nome}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <div className={styles.cardTop}>
                                                    <span className={styles.familyTag}>{familyName(p.family_id)}</span>
                                                    <span className={styles.codice}>{p.codice_l2f}</span>
                                                </div>
                                                <h2 className={styles.name}>{p.nome}</h2>
                                                {attrSummary(p) && <div className={styles.attrs}>{attrSummary(p)}</div>}
                                                {p.applicazione && <div className={styles.appl}>{p.applicazione}</div>}
                                                <div className={styles.priceRow}>
                                                    <div className={styles.listino}>
                                                        <span className={styles.priceLabel}>
                                                            Listino{p.hasVariants ? ' · da' : ''}
                                                        </span>
                                                        <span className={styles.priceValue}>
                                                            {formatEuro(p.prezzoDa)}
                                                            <span className={styles.unit}>{unitSuffix(p.unitaPrezzo)}</span>
                                                        </span>
                                                    </div>
                                                    {isActive && p.nettoDa != null ? (
                                                        <div className={styles.nettoActive}>
                                                            <span className={styles.priceLabel}>
                                                                Netto{p.hasVariants ? ' · da' : ''}
                                                            </span>
                                                            <span className={styles.nettoValue}>
                                                                {formatEuro(p.nettoDa)}
                                                                <span className={styles.unit}>{unitSuffix(p.unitaPrezzo)}</span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.netto}>
                                                            <Lock size={13} />
                                                            <span>netto riservato</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isActive && (
                                                <button
                                                    type="button"
                                                    className={styles.quickCart}
                                                    onClick={(e) => quickAdd(e, p)}
                                                    aria-label={p.hasVariants ? 'Scegli il formato' : 'Aggiungi al carrello'}
                                                    title={p.hasVariants ? 'Scegli il formato' : 'Aggiungi al carrello'}
                                                >
                                                    {p.hasVariants ? <Plus size={17} aria-hidden="true" /> : <ShoppingCart size={17} aria-hidden="true" />}
                                                </button>
                                            )}
                                        </MotionLink>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};
