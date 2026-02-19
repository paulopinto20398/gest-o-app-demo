import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import { useMemo } from "react";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useAuth } from "@/hooks/useAuth";

type BarRow = { name: string; value: number };
type MonthlyRow = { month: string; aprovados: number; registados: number; pendentes: number };

function exportCSV(rows: MonthlyRow[]) {
    const header = ["Mês", "Aprovados", "Registados", "Pendentes"];
    const lines = [
        header.join(";"),
        ...rows.map((r) => [r.month, r.aprovados, r.registados, r.pendentes].join(";")),
    ];
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio.csv";
    a.click();
    URL.revokeObjectURL(url);
}

export default function Relatorio() {
    const { beneficiaries } = useBeneficiaries();
    const { session } = useAuth();

    // só do gestor
    const visible = useMemo(() => {
        if (session?.role !== "gestor") return [];
        return beneficiaries.filter((b) => b.personalInfo.managerId === session.managerId);
    }, [beneficiaries, session]);

    // ✅ mock/derivado (para demo) — podes trocar por dados reais quando quiseres
    const topBeneficiarios: BarRow[] = useMemo(() => {
        // top 10 por “processNumber” (ou podes inventar outro critério)
        return visible
            .slice()
            .map((b) => ({
                name: (b.personalInfo?.name || "—").split(" ")[0],
                value: Number(b.processNumber || 0) || Math.floor(Math.random() * 20000) + 1000,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [visible]);

    const topColaboradores: BarRow[] = useMemo(() => {
        // simulação por gestor/entidade (nesta demo só tens 1 gestor, mas fica pronto)
        const map = new Map<string, number>();
        for (const b of visible) {
            const key = b.personalInfo.managerId || "G001";
            map.set(key, (map.get(key) ?? 0) + 1);
        }
        const rows = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
        if (rows.length === 0) return [];
        return rows.sort((a, b) => b.value - a.value).slice(0, 10);
    }, [visible]);

    const monthly: MonthlyRow[] = useMemo(() => {
        // mock mensal estilo PowerBI
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return months.map((m) => {
            const registados = Math.floor(Math.random() * 20000) + 8000;
            const aprovados = Math.floor(registados * (0.65 + Math.random() * 0.2));
            const pendentes = Math.max(0, registados - aprovados - Math.floor(Math.random() * 4000));
            return { month: m, aprovados, registados, pendentes };
        });
    }, []);

    const total = visible.length;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Relatório</h1>
                        <p className="text-muted-foreground">
                            Dados de decisão
                        </p>
                    </div>

                    <Button onClick={() => exportCSV(monthly)} className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Beneficiários</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">{total}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Empregados</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {visible.filter((b) => b.employment.employed).length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Processos Ativos</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {visible.filter((b) => b.status === "active").length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Paradeiro desconhecido</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {visible.filter((b) => b.documents?.paradeiroKnown === false).length}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 beneficiários (exemplo)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topBeneficiarios} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top colaboradores (exemplo)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topColaboradores} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Evolução mensal (registados/aprovados/pendentes)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="registados" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="aprovados" stackId="a" fill="#22c55e" />
                                <Bar dataKey="pendentes" stackId="a" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
