import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { Users, Briefcase, Home, GraduationCap, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: "up" | "down" | "neutral";
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const Index = () => {
  const { beneficiaries } = useBeneficiaries();

  const total = beneficiaries.length;
  const employed = beneficiaries.filter((b) => b.employment.employed).length;
  const activeProcesses = beneficiaries.filter((b) => b.status === "active").length;
  const inTraining = beneficiaries.filter((b) => b.training.attending).length;
  const housingOk = beneficiaries.filter((b) => b.housing.satisfaction.includes("Satisfeito")).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paulo Pinto</h1>
          <p className="text-muted-foreground">
            Visão geral dos processos de integração e estatísticas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Beneficiários"
            value={total}
            icon={Users}
            description="Registos ativos na plataforma"
          />
          <StatCard
            title="Empregados"
            value={employed}
            icon={Briefcase}
            description={`${Math.round((employed / (total || 1)) * 100)}% da base total`}
          />
          <StatCard
            title="Processos Ativos"
            value={activeProcesses}
            icon={TrendingUp}
            description="Em acompanhamento regular"
          />
          <StatCard
            title="Situação Habitacional"
            value={housingOk}
            icon={Home}
            description="Habitação estável/satisfatória"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {beneficiaries.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {b.personalInfo.name.charAt(0)}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {b.personalInfo.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Processo atualizado recentemente
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      Hoje
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Estado dos Processos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Documentação Completa</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {beneficiaries.filter(b => b.documents.processStatus === "Concluído").length}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Em Regularização</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {beneficiaries.filter(b => b.documents.processStatus === "Em curso").length}
                  </span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Em Formação/Educação</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {beneficiaries.filter(b => b.education.institution || b.training.attending).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
