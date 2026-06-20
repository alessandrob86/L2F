import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, AlertCircle, ShieldCheck, FileText, FileWarning, Minus, Plus, ShoppingCart } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { KelvinScale } from '../components/KelvinScale';
import { parseKelvin } from '../lib/kelvin';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import {
    getProduct,
    formatEuro,
    unitSuffix,
    PLACEHOLDER_IMG,
    type Product,
    type ProductVariant,
} from '../lib/catalog';

/** Etichette leggibili per le chiavi degli attributi semplici. */
const ATTR_LABELS: Record<string, string> = {
    linea: 'Linea',
    tecnologia: 'Tecnologia',
    box: 'Box',
    ah: 'Capacità (Ah)',
    spunto: 'Spunto (A)',
    polo: 'Polo positivo',
    dimensioni: 'Dimensioni (mm)',
    attacco: 'Attacco',
    specifica: 'Flusso / potenza',
    lumen: 'Flusso luminoso',
    temperatura: 'Temperatura colore',
    potenza: 'Potenza',
    voltaggio: 'Voltaggio',
    chip: 'Chip LED',
    raffreddamento: 'Raffreddamento',
    utilizzo: 'Utilizzo',
    colore: 'Colore',
    canbus: 'CANBUS',
    tipo: 'Tipo',
    gradazione: 'Gradazione',
    categoria: 'Categoria',
    lato: 'Lato',
    imballo: 'Formato',
};

/* Chiavi gestite a parte o non mostrate nella tabella attributi semplici. */
const SPECIAL_KEYS = new Set(['caratteristiche', 'omologazioni', 'unita_prezzo', 'rif_brembo', 'temperatura', 'kelvin']);

export const ProductDetail = () => {
    const { codice } = useParams<{ codice: string }>();
    const { isActive } = useAuth();
    const { add, open } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState<Product | null>(null);
    const [variant, setVariant] = useState<ProductVariant | null>(null);
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    /* Un passo indietro nella cronologia; se si è arrivati con un link diretto,
       fallback al catalogo. */
    const goBack = () => {
        if (location.key !== 'default') navigate(-1);
        else navigate('/catalogo');
    };

    useEffect(() => {
        if (!codice) return;
        let active = true;
        const t = setTimeout(() => {
            setLoading(true);
            setError(false);
            getProduct(codice, isActive)
                .then((p) => {
                    if (!active) return;
                    setProduct(p);
                    setVariant(p?.variants[0] ?? null);
                    setImgIdx(0);
                })
                .catch(() => active && setError(true))
                .finally(() => active && setLoading(false));
        }, 0);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [codice, isActive]);

    const attr = product?.attributi ?? {};
    const caratteristiche = attr.caratteristiche as Record<string, string> | undefined;
    const omologazioni = attr.omologazioni as string | undefined;
    const temperaturaStr = typeof attr.temperatura === 'string' ? attr.temperatura : null;
    const kelvin = parseKelvin(temperaturaStr);
    const kelvinLabel = temperaturaStr?.match(/\(([^)]+)\)/)?.[1];
    const specs = Object.entries(attr).filter(
        ([k, v]) => !SPECIAL_KEYS.has(k) && typeof v !== 'object'
    );

    // Render mockup batteria (per linea), mostrato accanto all'etichetta
    const lineaSlug = typeof attr.linea === 'string' ? attr.linea.toLowerCase().replace(/\s+/g, '-') : null;
    const battRender = product?.family_id === 'batterie' && lineaSlug ? `/renders/batt-${lineaSlug}.webp` : null;

    // Galleria angoli (non batterie): più immagini → selettore con miniature
    const gallery = !battRender && product?.immagini && product.immagini.length > 1 ? product.immagini : null;
    const heroSrc = gallery ? gallery[Math.min(imgIdx, gallery.length - 1)] : null;
    // Lampade LED: foto su fondo bianco (studio)
    const lightBg = product?.family_id === 'lampade-led';

    // Prezzo corrente: variante selezionata o prodotto
    const listino = variant ? variant.prezzo_listino : product?.prezzo_listino ?? null;
    const netto = variant ? variant.prezzo_netto ?? null : product?.prezzo_netto ?? null;
    const unita = variant ? variant.unita_prezzo : product?.unitaPrezzo ?? 'pezzo';

    return (
        <main className={styles.page}>
            <div className="container">
                <button type="button" className={styles.back} onClick={goBack}>
                    <ArrowLeft size={16} /> Torna al catalogo
                </button>

                {loading ? (
                    <div className={styles.loading} aria-busy="true" />
                ) : error ? (
                    <div className={styles.state}>
                        <AlertCircle size={32} />
                        <p>Non riusciamo a caricare il prodotto.</p>
                    </div>
                ) : !product ? (
                    <div className={styles.state}>
                        <p>Prodotto <strong>{codice}</strong> non trovato.</p>
                        <Link to="/catalogo" className={styles.cta}>Vai al catalogo</Link>
                    </div>
                ) : (
                    <article className={styles.article}>
                        {battRender ? (
                            <div className={`${styles.hero} ${styles.heroDual}`}>
                                <img className={styles.heroRender} src={battRender} alt={`${product.nome} — mockup`} />
                                {product.immagine && (
                                    <img className={styles.heroLabel} src={product.immagine} alt={`${product.nome} — etichetta`} />
                                )}
                            </div>
                        ) : gallery && heroSrc ? (
                            <div className={styles.galleryWrap}>
                                <div className={`${styles.hero} ${lightBg ? styles.heroLight : ''}`}>
                                    <img className={styles.heroImg} src={heroSrc} alt={product.nome} />
                                </div>
                                <div className={styles.thumbs}>
                                    {gallery.map((src, i) => (
                                        <button
                                            key={src}
                                            type="button"
                                            className={`${styles.thumbBtn} ${lightBg ? styles.thumbBtnLight : ''} ${i === imgIdx ? styles.thumbBtnActive : ''}`}
                                            onClick={() => setImgIdx(i)}
                                            aria-label={`Vista ${i + 1}`}
                                            aria-pressed={i === imgIdx}
                                        >
                                            <img src={src} alt="" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`${styles.hero} ${lightBg && product.immagine ? styles.heroLight : ''}`}>
                                <img
                                    className={product.immagine ? styles.heroImg : styles.heroPlaceholder}
                                    src={product.immagine || PLACEHOLDER_IMG}
                                    alt={product.nome}
                                />
                            </div>
                        )}

                        <div className={styles.detail}>
                            <div className={styles.main}>
                                <span className={styles.codice}>{product.codice_l2f}</span>
                                <h1 className={styles.name}>{product.nome}</h1>

                                {product.applicazione && (
                                    <p className={styles.appl}>
                                        <span className={styles.fieldLabel}>Applicazione</span>
                                        {product.applicazione}
                                    </p>
                                )}
                                {product.riferimento_oe && (
                                    <p className={styles.oe}>
                                        <span className={styles.fieldLabel}>Riferimento</span>
                                        {product.riferimento_oe}
                                    </p>
                                )}

                                {product.descrizione && (
                                    <p className={styles.descr}>{product.descrizione}</p>
                                )}

                                {omologazioni && (
                                    <div className={styles.omolog}>
                                        <span className={styles.fieldLabel}>Omologazioni e specifiche</span>
                                        <p>{omologazioni}</p>
                                    </div>
                                )}

                                {kelvin != null && (
                                    <KelvinScale kelvin={kelvin} label={kelvinLabel} />
                                )}

                                {specs.length > 0 && (
                                    <table className={styles.specs}>
                                        <tbody>
                                            {specs.map(([k, v]) => (
                                                <tr key={k}>
                                                    <th>{ATTR_LABELS[k] ?? k}</th>
                                                    <td>{String(v)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {caratteristiche && Object.keys(caratteristiche).length > 0 && (
                                    <div className={styles.caratt}>
                                        <h2 className={styles.carattTitle}>Caratteristiche tecniche</h2>
                                        <table className={styles.specs}>
                                            <tbody>
                                                {Object.entries(caratteristiche).map(([k, v]) => (
                                                    <tr key={k}>
                                                        <th>{k}</th>
                                                        <td>{v}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {product.garanzia && (
                                    <div className={styles.warranty}>
                                        <ShieldCheck size={18} /> Garanzia {product.garanzia}
                                    </div>
                                )}

                                {(product.scheda_tecnica_url || product.scheda_sicurezza_url) && (
                                    <div className={styles.docs}>
                                        {product.scheda_tecnica_url && (
                                            <a className={styles.docBtn} href={product.scheda_tecnica_url} target="_blank" rel="noopener noreferrer">
                                                <FileText size={16} /> Scheda tecnica
                                            </a>
                                        )}
                                        {product.scheda_sicurezza_url && (
                                            <a className={styles.docBtn} href={product.scheda_sicurezza_url} target="_blank" rel="noopener noreferrer">
                                                <FileWarning size={16} /> Scheda di sicurezza
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <aside className={styles.buy}>
                                {product.variants.length > 0 && (
                                    <div className={styles.formats}>
                                        <span className={styles.formatLabel}>Formato</span>
                                        <div className={styles.pills}>
                                            {product.variants.map((v) => (
                                                <button
                                                    key={v.id}
                                                    className={`${styles.pill} ${variant?.id === v.id ? styles.pillActive : ''}`}
                                                    onClick={() => setVariant(v)}
                                                >
                                                    {v.imballo}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.priceBlock}>
                                    <span className={styles.priceLabel}>Prezzo di listino</span>
                                    <span className={styles.priceValue}>
                                        {formatEuro(listino)}
                                        <span className={styles.unit}>{unitSuffix(unita)}</span>
                                    </span>
                                    <span className={styles.iva}>IVA esclusa</span>
                                </div>

                                {netto != null ? (
                                    <div className={styles.nettoBlock}>
                                        <span className={styles.priceLabel}>Il tuo prezzo netto</span>
                                        <span className={styles.nettoValue}>
                                            {formatEuro(netto)}
                                            <span className={styles.unit}>{unitSuffix(unita)}</span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className={styles.gated}>
                                        <Lock size={16} />
                                        <div>
                                            <strong>Prezzo netto riservato</strong>
                                            <p>Accedi con l'account della tua officina per vedere il netto e ordinare.</p>
                                        </div>
                                    </div>
                                )}

                                {isActive ? (
                                    <div className={styles.addRow}>
                                        <div className={styles.qtyStepper}>
                                            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuisci"><Minus size={16} /></button>
                                            <span>{qty}</span>
                                            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Aumenta"><Plus size={16} /></button>
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.cta}
                                            onClick={() => {
                                                add({
                                                    product_id: product.id,
                                                    variant_id: variant?.id ?? null,
                                                    codice_l2f: variant?.codice_l2f ?? product.codice_l2f,
                                                    nome: product.nome,
                                                    imballo: variant?.imballo ?? null,
                                                    prezzo_listino: listino,
                                                    prezzo_netto: netto,
                                                    unita,
                                                    quantita: qty,
                                                    immagine: product.immagine ?? product.immagini?.[0] ?? null,
                                                });
                                                setQty(1);
                                                open();
                                            }}
                                        >
                                            <ShoppingCart size={18} /> Aggiungi al carrello
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/accedi" className={styles.cta}>
                                        Accedi per ordinare
                                    </Link>
                                )}
                            </aside>
                        </div>
                    </article>
                )}
            </div>
        </main>
    );
};
