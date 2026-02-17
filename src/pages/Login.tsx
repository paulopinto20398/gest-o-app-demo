import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export default function Login() {
    const [mode, setMode] = useState<"cidadao" | "gestor" | null>(null);
    const [value, setValue] = useState("");

    const navigate = useNavigate();
    const { beneficiaries, loading } = useBeneficiaries();
    const { loginCidadao, loginGestor } = useAuth();

    const handleEnter = () => {
        if (!mode) {
            toast.error("Seleciona um perfil.");
            return;
        }

        const input = value.trim();

        // ===============================
        // BENEFICIÁRIO
        // ===============================
        if (mode === "cidadao") {
            if (!input) {
                toast.error("Introduz o nº de processo.");
                return;
            }

            const b = beneficiaries.find(
                (x) => x.processNumber === input
            );

            if (!b) {
                toast.error("Número de processo não encontrado.");
                return;
            }

            loginCidadao(b.id);

            // Página exclusiva do cidadão
            navigate(`/me`);
            return;
        }

        // ===============================
        // GESTOR
        // ===============================
        if (mode === "gestor") {
            if (!input) {
                toast.error("Introduz o ID do gestor.");
                return;
            }

            // Verifica se existe pelo menos um beneficiário atribuído a esse gestor
            const hasAssigned = beneficiaries.some(
                (b) => b.personalInfo.managerId === input
            );

            if (!hasAssigned) {
                toast.error("Gestor sem beneficiários atribuídos.");
                return;
            }

            loginGestor(input);

            // Página do gestor
            navigate(`/manager/beneficiaries`);
        }
    };

    return (
        <Layout>
            <div className="max-w-xl mx-auto space-y-6">

                {/* Título */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
                    <p className="text-muted-foreground">
                        Escolhe o perfil para aceder à plataforma.
                    </p>
                </div>

                {/* Escolha de perfil */}
                <div className="grid gap-4 md:grid-cols-2">

                    {/* BENEFICIÁRIO */}
                    <Card
                        className={`cursor-pointer ${mode === "cidadao" ? "ring-2 ring-primary" : ""
                            }`}
                        onClick={() => setMode("cidadao")}
                    >
                        <CardHeader>
                            <CardTitle>Beneficiário</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Acede apenas ao teu processo.
                        </CardContent>
                    </Card>

                    {/* GESTOR */}
                    <Card
                        className={`cursor-pointer ${mode === "gestor" ? "ring-2 ring-primary" : ""
                            }`}
                        onClick={() => setMode("gestor")}
                    >
                        <CardHeader>
                            <CardTitle>Gestor de Processo</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Gere beneficiários atribuídos a si.
                        </CardContent>
                    </Card>
                </div>

                {/* Campo de entrada */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {mode === "cidadao"
                                ? "Introduz o teu nº de processo"
                                : mode === "gestor"
                                    ? "Introduz o teu ID de gestor"
                                    : "Seleciona um perfil"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Input
                            disabled={!mode || loading}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={
                                mode === "cidadao"
                                    ? "Ex: 123456"
                                    : "Ex: G001"
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleEnter()
                            }
                        />

                        <Button
                            disabled={!mode || loading}
                            onClick={handleEnter}
                            className="w-full"
                        >
                            Entrar
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </Layout>
    );
}
