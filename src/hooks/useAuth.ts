import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const DEMO_EMAIL = "visitante@sistema.local";
const DEMO_PASSWORD = "visitante123";

interface AuthState {
    user: User | null;
    displayName: string;
    loading: boolean;
    isDemoMode: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        displayName: "",
        loading: true,
        isDemoMode: false,
    });
    const manualLogout = useRef(false);

    const resolveProfile = useCallback(async (user: User) => {
        const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", user.id)
            .single();
        return (
            data?.display_name ?? user.user_metadata?.display_name ?? "Operador"
        );
    }, []);

    const demoLogin = useCallback(async () => {
        // Ensure demo user exists
        try {
            await supabase.functions.invoke("manage-users", {
                body: { action: "ensure-demo" },
            });
        } catch {
            /* ignore */
        }
        const { error } = await supabase.auth.signInWithPassword({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
        });
        if (error) {
            // If demo login fails, show login page
            setState({
                user: null,
                displayName: "",
                loading: false,
                isDemoMode: false,
            });
        }
    }, []);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const displayName = await resolveProfile(session.user);
                setState({
                    user: session.user,
                    displayName,
                    loading: false,
                    isDemoMode: session.user.email === DEMO_EMAIL,
                });
            } else {
                // No session: auto-login as demo unless user manually logged out
                if (!manualLogout.current) {
                    setState((prev) => ({ ...prev, loading: true }));
                    demoLogin();
                } else {
                    setState({
                        user: null,
                        displayName: "",
                        loading: false,
                        isDemoMode: false,
                    });
                }
            }
        });

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const displayName = await resolveProfile(session.user);
                setState({
                    user: session.user,
                    displayName,
                    loading: false,
                    isDemoMode: session.user.email === DEMO_EMAIL,
                });
            } else if (!manualLogout.current) {
                demoLogin();
            } else {
                setState({
                    user: null,
                    displayName: "",
                    loading: false,
                    isDemoMode: false,
                });
            }
        });

        return () => subscription.unsubscribe();
    }, [resolveProfile, demoLogin]);

    const login = useCallback(async (usuario: string, senha: string) => {
        manualLogout.current = false;
        const email = usuario.includes("@")
            ? usuario
            : `${usuario}@sistema.local`;
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });
        if (error) throw error;
    }, []);

    const logout = useCallback(async () => {
        manualLogout.current = true;
        await supabase.auth.signOut();
    }, []);

    const isAdmin = state.user?.email === "admin@sistema.local";

    return { ...state, isAdmin, login, logout };
}
