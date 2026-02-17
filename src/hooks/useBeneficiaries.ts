import { useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Beneficiary, MOCK_BENEFICIARIES } from "../types/beneficiary";
import type { ContactRequest, ContactRequestStatus } from "../types/beneficiary";

type CreateContactRequestInput = Omit<ContactRequest, "id" | "status" | "createdAt" | "closedAt">;

function uid() {
  // randomUUID é ótimo quando existe; fallback garante compatibilidade
  return (globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}


function asStatus(v: any): ContactRequestStatus {
  return v === "Fechado" ? "Fechado" : "Em curso";
}

function normalizeContactRequest(cr: any): ContactRequest | null {
  if (!cr) return null;

  return {
    id: cr.id ?? uid(),
    type: cr.type ?? "",
    scheduledDate: cr.scheduledDate ?? "",
    subject: cr.subject ?? "",
    status: asStatus(cr.status),
    createdAt: cr.createdAt ?? new Date().toISOString(),
    closedAt: cr.closedAt,
  };
}

function normalizeContactRequestArray(arr: any): ContactRequest[] {
  // suporta: array, objeto único, undefined
  if (Array.isArray(arr)) {
    return arr.map(normalizeContactRequest).filter(Boolean) as ContactRequest[];
  }
  const one = normalizeContactRequest(arr);
  return one ? [one] : [];
}

function splitOpenClosed(list: ContactRequest[]) {
  const open = list.filter((r) => r.status !== "Fechado");
  const closed = list.filter((r) => r.status === "Fechado");
  return { open, closed };
}

function normalizeBeneficiary(b: any): Beneficiary {
  // normaliza listas
  const req = normalizeContactRequestArray(b.contactRequests);
  const reqAima = normalizeContactRequestArray(b.contactRequestsAIMA);

  const hist = normalizeContactRequestArray(b.contactRequestsHistory);
  const histAima = normalizeContactRequestArray(b.contactRequestsAIMAHistory);

  // migração automática: se existirem "Fechados" dentro da lista ativa, empurra para o histórico
  const reqSplit = splitOpenClosed(req);
  const reqAimaSplit = splitOpenClosed(reqAima);

  const nextHistory = [...hist, ...reqSplit.closed];
  const nextHistoryAima = [...histAima, ...reqAimaSplit.closed];

  return {
    ...b,
    contactRequests: reqSplit.open,
    contactRequestsAIMA: reqAimaSplit.open,
    contactRequestsHistory: nextHistory,
    contactRequestsAIMAHistory: nextHistoryAima,
  } as Beneficiary;
}

export const useBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  const saveBeneficiaries = (newData: Beneficiary[]) => {
    const normalized = newData.map(normalizeBeneficiary);
    setBeneficiaries(normalized);
    localStorage.setItem("beneficiaries", JSON.stringify(normalized));
  };

  useEffect(() => {
    const stored = localStorage.getItem("beneficiaries");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = Array.isArray(parsed) ? parsed.map(normalizeBeneficiary) : [];
        setBeneficiaries(normalized);
        localStorage.setItem("beneficiaries", JSON.stringify(normalized));
      } catch (e) {
        console.error("Failed to parse beneficiaries", e);
        const normalizedMocks = MOCK_BENEFICIARIES.map(normalizeBeneficiary);
        setBeneficiaries(normalizedMocks);
        localStorage.setItem("beneficiaries", JSON.stringify(normalizedMocks));
      }
    } else {
      const normalizedMocks = MOCK_BENEFICIARIES.map(normalizeBeneficiary);
      setBeneficiaries(normalizedMocks);
      localStorage.setItem("beneficiaries", JSON.stringify(normalizedMocks));
    }

    setLoading(false);
  }, []);

  const addBeneficiary = (beneficiary: Beneficiary) => {
    const newData = [...beneficiaries, normalizeBeneficiary(beneficiary)];
    saveBeneficiaries(newData);
    toast.success("Beneficiário adicionado com sucesso");
  };

  const updateBeneficiary = (id: string, updates: Partial<Beneficiary>) => {
    const newData = beneficiaries.map((b) =>
      b.id === id ? normalizeBeneficiary({ ...b, ...updates }) : b
    );
    saveBeneficiaries(newData);
    toast.success("Dados atualizados com sucesso");
  };

  const deleteBeneficiary = (id: string) => {
    const newData = beneficiaries.filter((b) => b.id !== id);
    saveBeneficiaries(newData);
    toast.success("Beneficiário removido");
  };

  const getBeneficiary = (id: string) => {
    const b = beneficiaries.find((x) => x.id === id);
    return b ? normalizeBeneficiary(b) : undefined;
  };

  // =========================
  // CIDADÃO
  // =========================
  const addContactRequest = (beneficiaryId: string, data: CreateContactRequestInput) => {
    const now = new Date().toISOString();
    const req: ContactRequest = {
      id: uid(),
      ...data,
      status: "Em curso",
      createdAt: now,
    };

    const newData = beneficiaries.map((b) => {
      if (b.id !== beneficiaryId) return b;
      const current = Array.isArray(b.contactRequests) ? b.contactRequests : [];
      return normalizeBeneficiary({ ...b, contactRequests: [req, ...current] });
    });

    saveBeneficiaries(newData);
    toast.success("Pedido de contacto criado");
    return req.id;
  };

  const closeContactRequest = (beneficiaryId: string, requestId: string) => {
    const now = new Date().toISOString();

    const newData = beneficiaries.map((b) => {
      if (b.id !== beneficiaryId) return b;

      const current = Array.isArray(b.contactRequests) ? b.contactRequests : [];
      const toClose = current.find((r) => r.id === requestId);
      if (!toClose) return b;

      const closed: ContactRequest = { ...toClose, status: "Fechado", closedAt: now };

      const stillOpen = current.filter((r) => r.id !== requestId);
      const history = Array.isArray(b.contactRequestsHistory) ? b.contactRequestsHistory : [];

      return normalizeBeneficiary({
        ...b,
        contactRequests: stillOpen,
        contactRequestsHistory: [...history, closed],
      });
    });

    saveBeneficiaries(newData);
    toast.success("Pedido de contacto fechado");
  };

  // =========================
  // AIMA / GESTOR
  // =========================
  const addContactRequestAIMA = (beneficiaryId: string, data: CreateContactRequestInput) => {
    const now = new Date().toISOString();
    const req: ContactRequest = {
      id: uid(),
      ...data,
      status: "Em curso",
      createdAt: now,
    };

    const newData = beneficiaries.map((b) => {
      if (b.id !== beneficiaryId) return b;
      const current = Array.isArray(b.contactRequestsAIMA) ? b.contactRequestsAIMA : [];
      return normalizeBeneficiary({ ...b, contactRequestsAIMA: [req, ...current] });
    });

    saveBeneficiaries(newData);
    toast.success("Pedido AIMA criado");
    return req.id;
  };

  const closeContactRequestAIMA = (beneficiaryId: string, requestId: string) => {
    const now = new Date().toISOString();

    const newData = beneficiaries.map((b) => {
      if (b.id !== beneficiaryId) return b;

      const current = Array.isArray(b.contactRequestsAIMA) ? b.contactRequestsAIMA : [];
      const toClose = current.find((r) => r.id === requestId);
      if (!toClose) return b;

      const closed: ContactRequest = { ...toClose, status: "Fechado", closedAt: now };

      const stillOpen = current.filter((r) => r.id !== requestId);
      const history = Array.isArray(b.contactRequestsAIMAHistory) ? b.contactRequestsAIMAHistory : [];

      return normalizeBeneficiary({
        ...b,
        contactRequestsAIMA: stillOpen,
        contactRequestsAIMAHistory: [...history, closed],
      });
    });

    saveBeneficiaries(newData);
    toast.success("Pedido AIMA fechado");
  };

  return {
    beneficiaries,
    loading,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getBeneficiary,

    // cidadão
    addContactRequest,
    closeContactRequest,

    // gestor/AIMA
    addContactRequestAIMA,
    closeContactRequestAIMA,
  };
};
