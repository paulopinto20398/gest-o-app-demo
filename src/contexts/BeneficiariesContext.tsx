import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Beneficiary, MOCK_BENEFICIARIES } from "@/types/beneficiary";

type BeneficiariesCtx = {
    beneficiaries: Beneficiary[];
    getBeneficiary: (id: string) => Beneficiary | undefined;
    addBeneficiary: (b: Beneficiary) => void;
    updateBeneficiary: (id: string, b: Beneficiary) => void;
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

    const value = useMemo(
        () => ({ beneficiaries, getBeneficiary, addBeneficiary, updateBeneficiary }),
        [beneficiaries, getBeneficiary, addBeneficiary, updateBeneficiary]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBeneficiaries() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useBeneficiaries must be used inside BeneficiariesProvider");
    return ctx;
}
