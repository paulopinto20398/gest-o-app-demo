import { useState, useEffect } from "react";
import { Beneficiary, MOCK_BENEFICIARIES } from "../types/beneficiary";
import { toast } from "@/components/ui/sonner";

export const useBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage or set initial mock data
  useEffect(() => {
    const stored = localStorage.getItem("beneficiaries");
    if (stored) {
      try {
        setBeneficiaries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse beneficiaries", e);
        setBeneficiaries(MOCK_BENEFICIARIES);
      }
    } else {
      setBeneficiaries(MOCK_BENEFICIARIES);
      localStorage.setItem("beneficiaries", JSON.stringify(MOCK_BENEFICIARIES));
    }
    setLoading(false);
  }, []);

  // Save to local storage whenever beneficiaries change
  const saveBeneficiaries = (newData: Beneficiary[]) => {
    setBeneficiaries(newData);
    localStorage.setItem("beneficiaries", JSON.stringify(newData));
  };

  const addBeneficiary = (beneficiary: Beneficiary) => {
    const newData = [...beneficiaries, beneficiary];
    saveBeneficiaries(newData);
    toast.success("Beneficiário adicionado com sucesso");
  };

  const updateBeneficiary = (id: string, updates: Partial<Beneficiary>) => {
    const newData = beneficiaries.map((b) =>
      b.id === id ? { ...b, ...updates } : b
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
    return beneficiaries.find((b) => b.id === id);
  };
  return {
    beneficiaries,
    loading,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getBeneficiary,
  };
};
