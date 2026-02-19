import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { Beneficiary, MOCK_BENEFICIARIES, ContactRequest } from "@/types/beneficiary";
import type { ChangeRequest } from "@/types/changerequest";
import { readLS, writeLS } from "@/lib/storage";
import { setByPath } from "@/lib/objectPath";

type CreateContactRequestInput = Omit<ContactRequest, "id" | "status" | "createdAt" | "closedAt">;

type CreateChangeRequestInput = {
    beneficiaryId: string;
    fieldPath: string; // ex: "documentacao.nif"
    oldValue: unknown;
    newValue: unknown;
};

type BeneficiariesCtx = {
    beneficiaries: Beneficiary[];
    getBeneficiary: (id: string) => Beneficiary | undefined;
    addBeneficiary: (b: Beneficiary) => void;
    updateBeneficiary: (id: string, b: Beneficiary) => void;

    // ✅ já tens
    addContactRequest: (beneficiaryId: string, data: CreateContactRequestInput) => string;
    closeContactRequest: (beneficiaryId: string, requestId: string) => void;

    // ✅ NOVO: pedidos de alteração (aprovação do gestor)
    changeRequests: ChangeRequest[];
    createChangeRequest: (input: CreateChangeRequestInput) => string;

    // listas úteis
    listRequestsByBeneficiary: (beneficiaryId: string) => ChangeRequest[];
    listPendingRequests: () => ChangeRequest[];

    // decisões do gestor
    approveChangeRequest: (requestId: string, decidedBy: string, note?: string) => void;
    rejectChangeRequest: (requestId: string, decidedBy: string, note?: string) => void;
};

const Ctx = createContext<BeneficiariesCtx | null>(null);

const BENEF_KEY = "beneficiaries";
const CR_KEY = "change_requests";

export function BeneficiariesProvider({ children }: { children: React.ReactNode }) {
    // ✅ Agora beneficiaries vêm do LS (com fallback para mock)
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
        () => readLS<Beneficiary[]>(BENEF_KEY, MOCK_BENEFICIARIES)
    );

    // ✅ changeRequests no LS (novo)
    const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(
        () => readLS<ChangeRequest[]>(CR_KEY, [])
    );

    // persistência
    useEffect(() => {
        writeLS(BENEF_KEY, beneficiaries);
    }, [beneficiaries]);

    useEffect(() => {
        writeLS(CR_KEY, changeRequests);
    }, [changeRequests]);

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
                        status: "Fechado",
                        closedAt: now,
                    };

                    return closed;
                });

                return { ...b, contactRequests: updated };
            })
        );
    }, []);

    // ----------------------------
    // ✅ NOVO: Change Requests
    // ----------------------------

    const createChangeRequest = useCallback((input: CreateChangeRequestInput) => {
        const req: ChangeRequest = {
            id: crypto.randomUUID(),
            beneficiaryId: input.beneficiaryId,
            fieldPath: input.fieldPath,
            oldValue: input.oldValue,
            newValue: input.newValue,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        setChangeRequests((prev) => {
            // opcional: impedir duplicados pendentes no mesmo campo
            const hasPendingSameField = prev.some(
                (r) =>
                    r.beneficiaryId === input.beneficiaryId &&
                    r.fieldPath === input.fieldPath &&
                    r.status === "pending"
            );
            if (hasPendingSameField) return prev;

            return [req, ...prev];
        });

        return req.id;
    }, []);

    const listRequestsByBeneficiary = useCallback(
        (beneficiaryId: string) => changeRequests.filter((r) => r.beneficiaryId === beneficiaryId),
        [changeRequests]
    );

    const listPendingRequests = useCallback(
        () => changeRequests.filter((r) => r.status === "pending"),
        [changeRequests]
    );

    const approveChangeRequest = useCallback(
        (requestId: string, decidedBy: string, note?: string) => {
            // 1) obter pedido atual
            const req = changeRequests.find((r) => r.id === requestId);
            if (!req) return;

            // 2) marcar como aprovado
            setChangeRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId
                        ? {
                            ...r,
                            status: "approved",
                            decidedAt: new Date().toISOString(),
                            decidedBy,
                            decisionNote: note,
                        }
                        : r
                )
            );

            // 3) aplicar alteração no beneficiário
            setBeneficiaries((prev) =>
                prev.map((b) => {
                    if (b.id !== req.beneficiaryId) return b;
                    return setByPath(b as any, req.fieldPath, req.newValue);
                })
            );
        },
        [changeRequests]
    );

    const rejectChangeRequest = useCallback(
        (requestId: string, decidedBy: string, note?: string) => {
            setChangeRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId
                        ? {
                            ...r,
                            status: "rejected",
                            decidedAt: new Date().toISOString(),
                            decidedBy,
                            decisionNote: note,
                        }
                        : r
                )
            );
        },
        []
    );

    const value = useMemo(
        () => ({
            beneficiaries,
            getBeneficiary,
            addBeneficiary,
            updateBeneficiary,
            addContactRequest,
            closeContactRequest,

            // novo
            changeRequests,
            createChangeRequest,
            listRequestsByBeneficiary,
            listPendingRequests,
            approveChangeRequest,
            rejectChangeRequest,
        }),
        [
            beneficiaries,
            getBeneficiary,
            addBeneficiary,
            updateBeneficiary,
            addContactRequest,
            closeContactRequest,
            changeRequests,
            createChangeRequest,
            listRequestsByBeneficiary,
            listPendingRequests,
            approveChangeRequest,
            rejectChangeRequest,
        ]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBeneficiaries() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useBeneficiaries must be used inside BeneficiariesProvider");
    return ctx;
}


