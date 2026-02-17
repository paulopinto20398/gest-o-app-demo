import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Me() {
    const { session } = useAuth();
    const { getBeneficiary, loading } = useBeneficiaries();

    const myId = session?.role === "cidadao" ? session.beneficiaryId : "";
    const me = myId ? getBeneficiary(myId) : null;

    if (loading) {
        return (
            <Layout>
                <div className="text-muted-foreground">A carregar...</div>
            </Layout>
        );
    }

    if (!me) {
        return (
            <Layout>
                <div className="space-y-3">
                    <div className="text-muted-foreground">
                        Beneficiário não encontrado na sessão.
                    </div>
                    <Button asChild>
                        <Link to="/login">Voltar ao login</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{me.personalInfo.name}</h1>
                    <p className="text-muted-foreground">
                        Processo: {me.processNumber} • Estado: {me.status}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Processo</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {me.documents.processStatus || "—"}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Emprego</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {me.employment.employed ? "Empregado" : "Desempregado"}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Habitação</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {me.housing.type || "—"}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Button asChild>
                        <Link to={`/beneficiaries/${me.id}`}>Ver / editar os meus dados</Link>
                    </Button>
                </div>
            </div>
        </Layout>
    );
}


