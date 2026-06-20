import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type StatoOfficina = 'in_attesa' | 'attiva' | 'sospesa';

export interface Officina {
    id: string;
    user_id: string;
    ragione_sociale: string;
    piva: string | null;
    email: string | null;
    telefono: string | null;
    citta: string | null;
    pacchetto: string | null;
    agente: string | null;
    cashback_rate: number;
    obiettivo_cashback: number;
    crediti_corsi: number;
    stato: StatoOfficina;
    codice_cliente: string | null;
    is_admin: boolean;
    /** Add-on FLEX (decisi dall'admin). */
    marketing_attivo: boolean;
    banca_dati_attiva: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    ragione_sociale: string;
    piva?: string;
    telefono?: string;
    citta?: string;
}

interface AuthState {
    session: Session | null;
    user: User | null;
    officina: Officina | null;
    /** Caricamento iniziale della sessione. */
    loading: boolean;
    /** Officina approvata: vede i prezzi netti e può ordinare. */
    isActive: boolean;
    /** Loggato ma non ancora attivo (in attesa o sospeso). */
    isPending: boolean;
    /** Account amministratore L2F (back-office). */
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (data: RegisterData) => Promise<{ error?: string; needsConfirm?: boolean }>;
    signOut: () => Promise<void>;
    refreshOfficina: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [officina, setOfficina] = useState<Officina | null>(null);
    const [loading, setLoading] = useState(true);

    const loadOfficina = useCallback(async (userId: string | undefined) => {
        if (!userId) {
            setOfficina(null);
            return;
        }
        const { data } = await supabase
            .from('officine')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        setOfficina((data as Officina) ?? null);
    }, []);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) return;
            setSession(data.session);
            await loadOfficina(data.session?.user?.id);
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            loadOfficina(s?.user?.id);
        });
        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, [loadOfficina]);

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message };
    }, []);

    const signUp = useCallback(async (d: RegisterData) => {
        // I dati officina viaggiano nei user_metadata: un trigger DB crea la riga
        // officine (stato 'in_attesa') alla creazione utente, senza problemi di RLS.
        const { data, error } = await supabase.auth.signUp({
            email: d.email,
            password: d.password,
            options: {
                data: {
                    ragione_sociale: d.ragione_sociale,
                    piva: d.piva ?? '',
                    telefono: d.telefono ?? '',
                    citta: d.citta ?? '',
                },
            },
        });
        if (error) return { error: error.message };
        if (data.session?.user?.id) {
            await loadOfficina(data.session.user.id);
            return {};
        }
        // Nessuna sessione → è richiesta la conferma email prima del login.
        return { needsConfirm: true };
    }, [loadOfficina]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setOfficina(null);
    }, []);

    const refreshOfficina = useCallback(
        () => loadOfficina(session?.user?.id),
        [loadOfficina, session],
    );

    const value: AuthState = {
        session,
        user: session?.user ?? null,
        officina,
        loading,
        isActive: officina?.stato === 'attiva',
        isPending: !!session && officina?.stato !== 'attiva',
        isAdmin: officina?.is_admin === true,
        signIn,
        signUp,
        signOut,
        refreshOfficina,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthState => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
    return ctx;
};
