import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import {
  Users,
  Briefcase,
  Home,
  TrendingUp,
  CheckCircle,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import type { ContactRequest } from "@/types/beneficiary";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
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

type ReminderItem = {
  beneficiaryId: string;
  beneficiaryName: string;
  source: "Cidadão" | "AIMA";
  request: ContactRequest;
  daysDiff: number;
};

// ✅ aceita "YYYY-MM-DD" e também ISO "2026-02-17T13:22:10.123Z"
function parseDate(dateStr?: string) {
  if (!dateStr) return null;

  // se já for ISO com "T", usa direto
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // caso clássico YYYY-MM-DD
  const d = new Date(dateStr + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayDiffFromToday(dateStr?: string) {
  const d = parseDate(dateStr);
  if (!d) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatPT(dateStr?: string) {
  const d = parseDate(dateStr);
  if (!d) return "—";
  return d.toLocaleDateString("pt-PT");
}

const Index = () => {
  const { beneficiaries, closeContactRequest } = useBeneficiaries();
  const { session } = useAuth();

  // 🔹 Filtrar beneficiários do gestor atual
  const visibleBeneficiaries =
    session?.role === "gestor"
      ? beneficiaries.filter(
        (b) => b.personalInfo.managerId === session.managerId
      )
      : beneficiaries;

  const managerName =
    session?.role === "gestor"
      ? visibleBeneficiaries[0]?.personalInfo.managerName ||
      `Gestor ${session.managerId}`
      : "Dashboard";

  // 🔹 Estatísticas
  const total = visibleBeneficiaries.length;
  const employed = visibleBeneficiaries.filter((b) => b.employment.employed)
    .length;
  const activeProcesses = visibleBeneficiaries.filter(
    (b) => b.status === "active"
  ).length;
  const housingOk = visibleBeneficiaries.filter((b) =>
    (b.housing.satisfaction || "").includes("Satisfeito")
  ).length;

  // =========================
  // Lembretes + Histórico
  // =========================
  const reminders: ReminderItem[] = [];
  const historyClosed: ReminderItem[] = [];

  for (const b of visibleBeneficiaries) {
    const name = b.personalInfo?.name || "—";

    // ✅ pedidos em curso (Cidadão)
    const openCitizen = Array.isArray(b.contactRequests) ? b.contactRequests : [];
    for (const r of openCitizen) {
      if (r.status !== "Em curso") continue;
      if (!r.subject?.trim()) continue;

      const diff = dayDiffFromToday(r.scheduledDate);
      if (diff !== null && diff <= 7) {
        reminders.push({
          beneficiaryId: b.id,
          beneficiaryName: name,
          source: "Cidadão",
          request: r,
          daysDiff: diff,
        });
      }
    }

    // ✅ histórico fechado (Cidadão) — usa closedAt ISO corretamente
    const closedCitizen = Array.isArray(b.contactRequestsHistory)
      ? b.contactRequestsHistory
      : [];
    for (const r of closedCitizen) {
      if (r.status !== "Fechado") continue;

      const diff = dayDiffFromToday(r.closedAt || r.scheduledDate) ?? 9999;

      historyClosed.push({
        beneficiaryId: b.id,
        beneficiaryName: name,
        source: "Cidadão",
        request: r,
        daysDiff: diff,
      });
    }

    // ✅ pedidos em curso (AIMA)
    const openAima = Array.isArray(b.contactRequestsAIMA) ? b.contactRequestsAIMA : [];
    for (const r of openAima) {
      if (r.status !== "Em curso") continue;
      if (!r.subject?.trim()) continue;

      const diff = dayDiffFromToday(r.scheduledDate);
      if (diff !== null && diff <= 7) {
        reminders.push({
          beneficiaryId: b.id,
          beneficiaryName: name,
          source: "AIMA",
          request: r,
          daysDiff: diff,
        });
      }
    }

    // ✅ histórico fechado (AIMA)
    const closedAima = Array.isArray(b.contactRequestsAIMAHistory)
      ? b.contactRequestsAIMAHistory
      : [];
    for (const r of closedAima) {
      if (r.status !== "Fechado") continue;

      const diff = dayDiffFromToday(r.closedAt || r.scheduledDate) ?? 9999;

      historyClosed.push({
        beneficiaryId: b.id,
        beneficiaryName: name,
        source: "AIMA",
        request: r,
        daysDiff: diff,
      });
    }
  }

  reminders.sort((a, b) => a.daysDiff - b.daysDiff);
  historyClosed.sort((a, b) => a.daysDiff - b.daysDiff);

  const labelDiff = (d: number) => {
    if (d < 0) return `Atrasado há ${Math.abs(d)} dia(s)`;
    if (d === 0) return "Hoje";
    return `Daqui a ${d} dia(s)`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{managerName}</h1>
          <p className="text-muted-foreground">
            Visão geral dos processos de integração e estatísticas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de Beneficiários" value={total} icon={Users} />
          <StatCard title="Empregados" value={employed} icon={Briefcase} />
          <StatCard title="Processos Ativos" value={activeProcesses} icon={TrendingUp} />
          <StatCard title="Situação Habitacional" value={housingOk} icon={Home} />
        </div>

        {/* Lembretes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Lembretes (Pedidos de Contacto)
            </CardTitle>
          </CardHeader>

          <CardContent>
            {reminders.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Sem pedidos urgentes.
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((r) => (
                  <div key={r.request.id} className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />

                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {r.beneficiaryName}{" "}
                        <span className="text-xs text-muted-foreground">
                          • {r.source}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {r.request.subject || "Sem assunto"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatPT(r.request.scheduledDate)}
                      </div>
                      <div
                        className={`text-xs ${r.daysDiff < 0 ? "text-red-600" : "text-muted-foreground"
                          }`}
                      >
                        {labelDiff(r.daysDiff)}
                      </div>

                      {/* Fechar só para Cidadão */}
                      {r.source === "Cidadão" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() =>
                            closeContactRequest(r.beneficiaryId, r.request.id)
                          }
                        >
                          Fechar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico (Fechados)</CardTitle>
          </CardHeader>

          <CardContent>
            {historyClosed.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Ainda não existem pedidos fechados.
              </div>
            ) : (
              <div className="space-y-4">
                {historyClosed.map((r) => (
                  <div
                    key={`${r.beneficiaryId}-${r.source}-${r.request.id}`}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-4 w-4 mt-1 text-muted-foreground" />

                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {r.beneficiaryName}{" "}
                        <span className="text-xs text-muted-foreground">
                          • {r.source}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {r.request.subject || "Sem assunto"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatPT(r.request.scheduledDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">Fechado</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;




