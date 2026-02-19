export type ChangeRequestStatus = "pending" | "approved" | "rejected";

export type ChangeRequest = {
    id: string;
    beneficiaryId: string;

    // qual campo mudou
    fieldPath: string; // ex: "documentacao.nif" ou "contacto.telefone"

    // valores
    oldValue: unknown;
    newValue: unknown;

    // meta
    status: ChangeRequestStatus;
    createdAt: string; // ISO
    decidedAt?: string; // ISO
    decidedBy?: string; // ex: "G001"
    decisionNote?: string; // motivo/rejeição
};
