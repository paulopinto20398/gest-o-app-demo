import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Beneficiary, MOCK_BENEFICIARIES, ContactRequest } from "@/types/beneficiary";

type CreateContactRequestInput = Omit<ContactRequest, "id" | "status" | "createdAt" | "closedAt">;

type BeneficiariesCtx = {
    beneficiaries: Beneficiary[];
    getBeneficiary: (id: string) => Beneficiary | undefined;
    addBeneficiary: (b: Beneficiary) => void;
    updateBeneficiary: (id: string, b: Beneficiary) => void;

    // ✅ novo: adicionar pedido (vários em curso)
    addContactRequest: (beneficiaryId: string, data: CreateContactRequestInput) => string;

    // ✅ novo: fechar pedido específico
    closeContactRequest: (beneficiaryId: string, requestId: string) => void;
};

const Ctx = createContext<BeneficiariesCtx | null>(null);

export function BeneficiariesProvider({ children }: { children: React.ReactNode }) {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(MOCK_BENEFICIARIES);

    const getBeneficiary = useCallback(
        (id: string) => beneficiaries.find((b) => b.id === id),
        [beneficiaries]
    );

    const addBeneficiary = useCallback((b: Beneficiary) => {
        setBeneficiaries((prev) => [b, ...prev]);
    }, []);

    const updateBeneficiary = useCallback((id: string, b: Beneficiary) => {
        setBeneficiaries((prev) => prev.map((x) => (x.id === id ? b : x)));
    }, []);

    // ✅ Adicionar pedido (tab Contacto -> Guardar Pedido)
    const addContactRequest = useCallback((beneficiaryId: string, data: CreateContactRequestInput) => {
        const now = new Date().toISOString();
        const req: ContactRequest = {
            id: crypto.randomUUID(),
            ...data,
            status: "Em curso",
            createdAt: now,
        };

        setBeneficiaries((prev) =>
            prev.map((b) => {
                if (b.id !== beneficiaryId) return b;
                const current = b.contactRequests ?? [];
                return { ...b, contactRequests: [req, ...current] };
            })
        );

        return req.id;
    }, []);

    // ✅ Fechar pedido específico (Dashboard/Tab -> Fechar)
    const closeContactRequest = useCallback((beneficiaryId: string, requestId: string) => {
        const now = new Date().toISOString();

        setBeneficiaries((prev) =>
            prev.map((b) => {
                if (b.id !== beneficiaryId) return b;

                const list: ContactRequest[] = b.contactRequests ?? [];

                const updated: ContactRequest[] = list.map((r) => {
                    if (r.id !== requestId) return r;

                    const closed: ContactRequest = {
                        ...r,
                        status: "Fechado",      // ✅ agora fica literal correto
                        closedAt: now,
                    };

                    return closed;
                });

                return { ...b, contactRequests: updated };
            })
        );
    }, []);


    const value = useMemo(
        () => ({
            beneficiaries,
            getBeneficiary,
            addBeneficiary,
            updateBeneficiary,
            addContactRequest,
            closeContactRequest,
        }),
        [beneficiaries, getBeneficiary, addBeneficiary, updateBeneficiary, addContactRequest, closeContactRequest]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBeneficiaries() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useBeneficiaries must be used inside BeneficiariesProvider");
    return ctx;
}

