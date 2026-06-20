import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
    type ReactNode,
} from 'react';

export interface CartItem {
    /** Chiave univoca riga: variant_id se presente, altrimenti product_id. */
    key: string;
    product_id: string;
    variant_id: string | null;
    codice_l2f: string;
    nome: string;
    imballo: string | null;
    prezzo_listino: number | null;
    prezzo_netto: number | null;
    unita: string;
    quantita: number;
    immagine: string | null;
}

export type NewCartItem = Omit<CartItem, 'key' | 'quantita'> & { quantita?: number };

interface CartState {
    items: CartItem[];
    count: number;
    totaleListino: number;
    totaleNetto: number;
    add: (item: NewCartItem) => void;
    setQty: (key: string, qty: number) => void;
    remove: (key: string) => void;
    clear: () => void;
    /** UI drawer */
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const STORAGE_KEY = 'l2f_cart_v1';
const CartContext = createContext<CartState | undefined>(undefined);

function load(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(load);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            /* quota / private mode: ignora */
        }
    }, [items]);

    const add = useCallback((item: NewCartItem) => {
        const key = item.variant_id ?? item.product_id;
        const qty = item.quantita ?? 1;
        setItems((prev) => {
            const i = prev.findIndex((x) => x.key === key);
            if (i >= 0) {
                const next = [...prev];
                next[i] = { ...next[i], quantita: next[i].quantita + qty };
                return next;
            }
            return [...prev, { ...item, key, quantita: qty }];
        });
    }, []);

    const setQty = useCallback((key: string, qty: number) => {
        setItems((prev) =>
            qty <= 0
                ? prev.filter((x) => x.key !== key)
                : prev.map((x) => (x.key === key ? { ...x, quantita: qty } : x)),
        );
    }, []);

    const remove = useCallback((key: string) => {
        setItems((prev) => prev.filter((x) => x.key !== key));
    }, []);

    const clear = useCallback(() => setItems([]), []);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const value = useMemo<CartState>(() => {
        const count = items.reduce((s, x) => s + x.quantita, 0);
        const totaleListino = items.reduce((s, x) => s + (x.prezzo_listino ?? 0) * x.quantita, 0);
        const totaleNetto = items.reduce((s, x) => s + (x.prezzo_netto ?? x.prezzo_listino ?? 0) * x.quantita, 0);
        return { items, count, totaleListino, totaleNetto, add, setQty, remove, clear, isOpen, open, close };
    }, [items, add, setQty, remove, clear, isOpen, open, close]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartState => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart deve essere usato dentro <CartProvider>');
    return ctx;
};
