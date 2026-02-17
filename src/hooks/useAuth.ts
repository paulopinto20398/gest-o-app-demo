import { useEffect, useState } from "react";

export type Session =
    | { role: "cidadao"; beneficiaryId: string }
    | { role: "gestor"; managerId: string };

const KEY = "session";

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem(KEY);
        setSession(raw ? (JSON.parse(raw) as Session) : null);
        setLoadingSession(false);
    }, []);

    const loginCidadao = (beneficiaryId: string) => {
        const s: Session = { role: "cidadao", beneficiaryId };
        localStorage.setItem(KEY, JSON.stringify(s));
        setSession(s);
    };

    const loginGestor = (managerId: string) => {
        const s: Session = { role: "gestor", managerId };
        localStorage.setItem(KEY, JSON.stringify(s));
        setSession(s);
    };

    const logout = () => {
        localStorage.removeItem(KEY);
        setSession(null);
    };

    return { session, loadingSession, loginCidadao, loginGestor, logout };
}
