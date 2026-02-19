import { Layout } from "@/components/Layout";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Save,
  Upload,
  User,
  FileText,
  Heart,
  Home,
  Book,
  GraduationCap,
  Briefcase,
  HandCoins,
  Phone,
  ClipboardList,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type {
  Beneficiary,
  UserRole,
  FieldConfig,
  ContactRequest,
} from "@/types/beneficiary";
import { SECTION_FIELDS } from "@/types/beneficiary";
import { FieldRenderer } from "@/components/FieldRenderer";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/DocumentViewer";
import type { DocKind } from "@/types/beneficiary";


const EMPTY_BENEFICIARY: Beneficiary = {
  id: crypto.randomUUID(),
  processNumber: "",
  status: "active",
  personalInfo: {
    name: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    naturality: "",
    maritalStatus: "",
    languages: [],
    entryDatePortugal: "",
    address: "",
    phone: "",
    email: "",
    householdSize: 1,
    entityManager: "",
    managerName: "",
    managerId: "",
    dataSharingAuthorized: false,


  },
  documents: {
    regularizationProcessType: "",
    processStartDate: "",
    processStatus: "",
    drivingLicense: false,
    nationalityRequest: false,
    otherDocs: [],
    attachments: [],
    paradeiroKnown: true,


  },
  health: {
    usf: "",
    doctorName: "",
    specialtyAppointments: false,
    medication: false,
    vaccination: false,
    observations: "",
  },
  housing: {
    type: "",
    contractType: "",
    contractEndDate: "",
    satisfaction: "",
    lookingForAlternative: false,
    observations: "",
  },
  pla: {
    modality: "",
    institution: "",
    location: "",
    weeklyHours: 0,
    levelEquivalence: "",
    satisfaction: "",
    observations: "",
  },
  education: {
    startDate: "",
    institution: "",
    location: "",
    level: "",
    specialNeeds: false,
  },
  training: { attending: false, observations: "" },
  employment: { employed: false, activeSearch: false, registeredIEFP: false },
  socialSupport: {
    hasSupport: false,
    supportTypes: [],
    pendingRequests: [],
    familyAllowance: false,
    foodBank: false,
  },

  contactRequests: [],
  contactRequestsAIMA: [],
  contactRequestsHistory: [],
  contactRequestsAIMAHistory: [],

  internalNotes: {},
};

const TAB_CONFIG = [
  { value: "identity", label: "Identificação", icon: User, sectionKey: "identification" },
  { value: "documents", label: "Documentação", icon: FileText, sectionKey: "documentation" },
  { value: "health", label: "Saúde", icon: Heart, sectionKey: "health" },
  { value: "housing", label: "Habitação", icon: Home, sectionKey: "housing" },
  { value: "pla", label: "PLA", icon: Book, sectionKey: "pla" },
  { value: "education", label: "Educação", icon: GraduationCap, sectionKey: "education" },
  { value: "training", label: "Formação", icon: GraduationCap, sectionKey: "training" },
  { value: "employment", label: "Emprego", icon: Briefcase, sectionKey: "employment" },
  { value: "social", label: "Apoios", icon: HandCoins, sectionKey: "socialSupport" },
  { value: "contact", label: "Contacto", icon: Phone, sectionKey: "contactRequest" },
  { value: "requests", label: "Pedidos", icon: ClipboardList, sectionKey: "requests" },

];

const DEMO_DOCS = [
  {
    kind: "cc",
    label: "Cartão de Cidadão",
    fileUrl: "/Demo/cc_mohammed.jpeg",
  },
  {
    kind: "carta_conducao",
    label: "Carta de Condução",
    fileUrl: "/Demo/cartaconducao_mohammed.jfif",
  },
  {
    kind: "passaporte",
    label: "Passaporte",
    fileUrl: "/Demo/passaporte_mohammed.jfif",
  },
];


function StatusBadge({ status }: { status: "aprovado" | "pendente" | "rejeitado" }) {
  const label =
    status === "aprovado" ? "Aprovado" : status === "pendente" ? "Para aprovação" : "Rejeitado";

  const cls =
    status === "aprovado"
      ? "bg-green-100 text-green-800"
      : status === "pendente"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}


function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function InternalNotesBlock({
  tabKey,
  formData,
  setFormData,
}: {
  tabKey: string;
  formData: Beneficiary;
  setFormData: React.Dispatch<React.SetStateAction<Beneficiary | null>>;
}) {
  const notes = formData.internalNotes?.[tabKey] ?? "";

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Notas internas (Gestor)</CardTitle>
        <CardDescription>
          Informação interna não visível ao beneficiário.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Textarea
          placeholder="Escrever notas internas..."
          value={notes}
          onChange={(e) => {
            const val = e.target.value;

            setFormData((prev) =>
              prev
                ? {
                  ...prev,
                  internalNotes: {
                    ...(prev.internalNotes ?? {}),
                    [tabKey]: val,
                  },
                }
                : prev
            );
          }}
          rows={4}
        />
      </CardContent>
    </Card>
  );
}

export default function BeneficiaryDetail() {
  const { id } = useParams();
  const isNew = !id || id === "new" || id === "novo";

  // evita re-carregar / re-inicializar o formData a cada render
  const loadedIdRef = useRef<string | null>(null);
  // ✅ snapshot do beneficiário original (para comparar alterações do cidadão)
  const originalRef = useRef<Beneficiary | null>(null);

  const navigate = useNavigate();


  const {
    getBeneficiary,
    updateBeneficiary,
    addBeneficiary,
    loading,
    addContactRequest,
    closeContactRequest,
    submitAttachment,
    approveAttachment,
    rejectAttachment,

    // ✅ NOVO
    createChangeRequest,
    listRequestsByBeneficiary,
  } = useBeneficiaries();



  const { session, loadingSession } = useAuth();
  const role: UserRole = session?.role ?? "cidadao";

  // ✅ quando está a criar, deixa editar tudo
  const effectiveRole: UserRole = isNew ? "gestor" : role;





  const [activeTab, setActiveTab] = useState("identity");
  const [formData, setFormData] = useState<Beneficiary | null>(null);

  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState("");
  const [docViewerTitle, setDocViewerTitle] = useState("");

  const [submitDocOpen, setSubmitDocOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);

  const openDoc = (title: string, url: string) => {
    setDocViewerTitle(title);
    setDocViewerUrl(url);
    setDocViewerOpen(true);
  };

  // ✅ form local do novo pedido
  const [newRequest, setNewRequest] = useState({
    type: "Telefónico",
    scheduledDate: "",
    subject: "",
  });

  // ✅ IMPORTANTÍSSIMO: hooks que dependem de formData têm de ser null-safe
  const openRequests = useMemo(() => {
    const list = safeArray<ContactRequest>(formData?.contactRequests);
    return list.filter((r) => r.status === "Em curso");
  }, [formData]);


  const closedRequests = useMemo(() => {
    // 👇 aqui é para o histórico (o que aparece na tab)
    const hist = safeArray<ContactRequest>(formData?.contactRequestsHistory);
    // garante ordenação pelo closedAt
    return hist
      .slice()
      .sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? ""));
  }, [formData]);

  const pendingByFieldPath = useMemo(() => {
    if (!formData) return new Map<string, any>();

    const list = listRequestsByBeneficiary(formData.id);

    const map = new Map<string, any>();
    for (const r of list) {
      if (r.status !== "pending") continue;
      const prev = map.get(r.fieldPath);
      if (!prev || (prev.createdAt ?? "") < (r.createdAt ?? "")) {
        map.set(r.fieldPath, r);
      }
    }
    return map;
  }, [formData, listRequestsByBeneficiary]);

  const myPendingRequests = useMemo(() => {
    if (!formData) return [];
    return listRequestsByBeneficiary(formData.id)
      .filter((r) => r.status === "pending")
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [formData, listRequestsByBeneficiary]);

  const myApprovedRequests = useMemo(() => {
    if (!formData) return [];
    return listRequestsByBeneficiary(formData.id)
      .filter((r) => r.status === "approved")
      .sort((a, b) =>
        (b.decidedAt ?? b.createdAt ?? "").localeCompare(a.decidedAt ?? a.createdAt ?? "")
      );
  }, [formData, listRequestsByBeneficiary]);

  const myRejectedRequests = useMemo(() => {
    if (!formData) return [];
    return listRequestsByBeneficiary(formData.id)
      .filter((r) => r.status === "rejected")
      .sort((a, b) =>
        (b.decidedAt ?? b.createdAt ?? "").localeCompare(a.decidedAt ?? a.createdAt ?? "")
      );
  }, [formData, listRequestsByBeneficiary]);



  // Bloquear cidadao de ver outros
  useEffect(() => {
    if (loadingSession) return;
    if (!session) return;

    if (session.role === "cidadao" && id !== session.beneficiaryId) {
      navigate("/me", { replace: true });
    }
  }, [session, loadingSession, id, navigate]);

  // Carregar beneficiário
  useEffect(() => {
    if (loading) return;

    const currentKey = isNew ? "__new__" : (id ?? "");

    // ✅ se já carregámos este id (ou "__new__"), não voltar a repor o formData
    if (loadedIdRef.current === currentKey) return;

    if (isNew) {
      setFormData({
        ...EMPTY_BENEFICIARY,
        id: crypto.randomUUID(),
      });
      originalRef.current = null;
      loadedIdRef.current = currentKey;
      return;
    }

    const data = getBeneficiary(id || "");
    if (!data) {
      setFormData(null);
      loadedIdRef.current = currentKey;
      return;
    }
    originalRef.current = data;
    loadedIdRef.current = currentKey;

    setFormData({
      ...data,
      contactRequests: safeArray<ContactRequest>((data as any).contactRequests),
      contactRequestsAIMA: safeArray<ContactRequest>((data as any).contactRequestsAIMA),
      contactRequestsHistory: safeArray<ContactRequest>((data as any).contactRequestsHistory),
      contactRequestsAIMAHistory: safeArray<ContactRequest>((data as any).contactRequestsAIMAHistory),
    });

    loadedIdRef.current = currentKey;
  }, [id, isNew, loading]); // ✅ nota: sem getBeneficiary para não resetar a cada render



  // ✅ returns antes de qualquer acesso NÃO-safe
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          A Carregar...
        </div>
      </Layout>
    );
  }

  if (!formData) {
    return (
      <Layout>
        <div className="space-y-3">
          <div className="text-muted-foreground">Beneficiário não encontrado.</div>
          <Button variant="outline" onClick={() => navigate("/beneficiaries")}>
            Voltar à lista
          </Button>
        </div>
      </Layout>
    );
  }

  // Guardar dados gerais
  const handleSave = () => {
    if (!formData) return;

    // 🆕 Criar novo beneficiário (gestor)
    if (id === "new") {
      addBeneficiary(formData);
      navigate(`/beneficiaries/${formData.id}`);
      return;
    }

    // 👨‍💼 Gestor — guarda direto
    if (effectiveRole === "gestor") {
      updateBeneficiary(formData.id, formData);
      return;
    }

    // 🧑‍🤝‍🧑 Cidadão — criar pedidos de alteração
    const original = originalRef.current;
    if (!original) return;

    let created = 0;

    Object.entries(SECTION_FIELDS).forEach(([_, fields]) => {
      fields.forEach((fc: any) => {
        // ⚠️ só campos editáveis pelo cidadão
        if (fc.editableRoles && !fc.editableRoles.includes("cidadao")) return;

        const oldVal =
          fc.section === "root"
            ? (original as any)[fc.key]
            : (original as any)[fc.section]?.[fc.key];

        const newVal =
          fc.section === "root"
            ? (formData as any)[fc.key]
            : (formData as any)[fc.section]?.[fc.key];

        const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
        if (!changed) return;

        const fieldPath =
          fc.section === "root"
            ? `${fc.key}`
            : `${fc.section}.${fc.key}`;

        createChangeRequest({
          beneficiaryId: formData.id,
          fieldPath,
          oldValue: oldVal,
          newValue: newVal,
        });

        created++;
      });
    });

    if (created > 0) {
      toast.success("Alterações submetidas para aprovação");
      // força re-render com os dados atuais (sem recarregar o beneficiário)
      setFormData((prev) => (prev ? { ...prev } : prev));

    } else {
      toast.message("Sem alterações para submeter");
    }
  };


  // Criar novo pedido (cidadão)
  const handleAddContactRequest = () => {
    if (!newRequest.subject.trim()) return;

    const requestId = addContactRequest(formData.id, {
      type: newRequest.type,
      scheduledDate: newRequest.scheduledDate,
      subject: newRequest.subject,
    });

    const now = new Date().toISOString();
    const created: ContactRequest = {
      id: requestId,
      type: newRequest.type,
      scheduledDate: newRequest.scheduledDate,
      subject: newRequest.subject,
      status: "Em curso",
      createdAt: now,
    };

    setFormData((prev) =>
      prev
        ? {
          ...prev,
          contactRequests: [
            created,
            ...safeArray<ContactRequest>(prev.contactRequests),
          ],
        }
        : prev
    );

    setNewRequest({ type: "Telefónico", scheduledDate: "", subject: "" });
  };

  const handleCloseOneRequest = (requestId: string) => {
    closeContactRequest(formData.id, requestId);

    const now = new Date().toISOString();

    setFormData((prev) => {
      if (!prev) return prev;

      const list = safeArray<ContactRequest>(prev.contactRequests);
      const target = list.find((r) => r.id === requestId) ?? null;

      const updated = list.filter((r) => r.id !== requestId);

      const closed: ContactRequest | null = target
        ? { ...target, status: "Fechado", closedAt: now }
        : null;

      const nextHistory = closed
        ? [...safeArray<ContactRequest>(prev.contactRequestsHistory), closed]
        : safeArray<ContactRequest>(prev.contactRequestsHistory);

      return {
        ...prev,
        contactRequests: updated,
        contactRequestsHistory: nextHistory,
      };
    });
  };


  // ====== campos genéricos ======
  const getFieldValue = (config: FieldConfig) => {
    if (config.section === "root") {
      // @ts-ignore
      return formData[config.key];
    }
    // @ts-ignore
    const sectionData = formData[config.section];
    // @ts-ignore
    return sectionData ? sectionData[config.key] : "";
  };

  const setFieldValue = (config: FieldConfig, value: any) => {
    setFormData((prev) => {
      if (!prev) return null;

      if (config.section === "root") {
        // @ts-ignore
        return { ...prev, [config.key]: value };
      }

      // @ts-ignore
      const sectionData = prev[config.section] || {};
      return {
        ...prev,
        // @ts-ignore
        [config.section]: { ...sectionData, [config.key]: value },
      };
    });
  };

  const renderSectionFields = (sectionKey: string) => {
    const fields = SECTION_FIELDS[sectionKey];
    if (!fields) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((fieldConfig) => {
          const fieldPath =
            fieldConfig.section === "root"
              ? `${fieldConfig.key}`
              : `${fieldConfig.section}.${fieldConfig.key}`;

          const pendingReq = pendingByFieldPath.get(fieldPath);

          return (
            <div
              key={fieldConfig.key}
              className={fieldConfig.fieldType === "textarea" ? "md:col-span-2" : ""}
            >
              {/* ✅ Badge pendente */}
              {pendingReq && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendente de aprovação
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Submetido em{" "}
                    {new Date(pendingReq.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              )}

              <FieldRenderer
                config={fieldConfig}
                value={getFieldValue(fieldConfig)}
                onChange={(val) => setFieldValue(fieldConfig, val)}
                role={effectiveRole}

                // ✅ (opcional/recomendado) bloquear o cidadão enquanto está pendente
                disabled={!!pendingReq && effectiveRole === "cidadao"}
              />
            </div>
          );
        })}

      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/beneficiaries")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-muted shrink-0">
                <AvatarImage src={formData.photoUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {formData.personalInfo.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight truncate">
                  {formData.personalInfo.name || "Novo Beneficiário"}
                </h1>
                <div className="text-muted-foreground text-sm">
                  Processo: {formData.processNumber || "N/A"}
                  <Badge variant="secondary" className="ml-2">
                    {formData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {effectiveRole === "gestor" ? "Guardar" : "Submeter"}
            </Button>

          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full justify-start inline-flex min-w-max h-auto p-1 bg-muted/50">
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2 py-2">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Identity */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle>Identificação</CardTitle>
                <CardDescription>Dados pessoais e de identificação do beneficiário.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-3 min-w-[160px]">
                    <Avatar className="h-28 w-28 border-4 border-muted">
                      <AvatarImage src={formData.photoUrl} />
                      <AvatarFallback className="text-3xl bg-muted">
                        {formData.personalInfo.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {effectiveRole === "gestor" && (
                      <Button variant="outline" size="sm" className="w-full gap-2 relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData((prev) =>
                                  prev ? { ...prev, photoUrl: reader.result as string } : null
                                );
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Upload className="h-4 w-4" /> Foto
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-6">
                    {renderSectionFields("identification")}

                    {effectiveRole === "gestor" && (
                      <InternalNotesBlock
                        tabKey="identity"
                        formData={formData}
                        setFormData={setFormData}
                      />
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Pedidos
                </CardTitle>
                <CardDescription>
                  Alterações submetidas para aprovação do gestor.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pendentes */}
                <div className="space-y-3">
                  <div className="text-lg font-semibold">Pendentes</div>

                  {myPendingRequests.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem pedidos pendentes.</div>
                  ) : (
                    <div className="space-y-2">
                      {myPendingRequests.map((r) => (
                        <div key={r.id} className="rounded-md border p-3 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium">
                              Campo: <span className="text-muted-foreground">{r.fieldPath}</span>
                            </div>
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md bg-muted/50 p-2">
                              <div className="text-xs text-muted-foreground">Antes</div>
                              <div className="font-medium break-words">
                                {r.oldValue == null ? "—" : String(r.oldValue)}
                              </div>
                            </div>

                            <div className="rounded-md bg-muted/50 p-2">
                              <div className="text-xs text-muted-foreground">Depois</div>
                              <div className="font-medium break-words">
                                {r.newValue == null ? "—" : String(r.newValue)}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Submetido em {new Date(r.createdAt).toLocaleString("pt-PT")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Aprovados */}
                <div className="space-y-3">
                  <div className="text-lg font-semibold">Aprovados</div>

                  {myApprovedRequests.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem pedidos aprovados.</div>
                  ) : (
                    <div className="space-y-2">
                      {myApprovedRequests.map((r) => (
                        <div key={r.id} className="rounded-md border p-3 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium">
                              Campo: <span className="text-muted-foreground">{r.fieldPath}</span>
                            </div>
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              Aprovado
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md bg-muted/50 p-2">
                              <div className="text-xs text-muted-foreground">Antes</div>
                              <div className="font-medium break-words">
                                {r.oldValue == null ? "—" : String(r.oldValue)}
                              </div>
                            </div>

                            <div className="rounded-md bg-muted/50 p-2">
                              <div className="text-xs text-muted-foreground">Depois</div>
                              <div className="font-medium break-words">
                                {r.newValue == null ? "—" : String(r.newValue)}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Submetido em {new Date(r.createdAt).toLocaleString("pt-PT")}
                            {r.decidedAt && <> • Decidido em {new Date(r.decidedAt).toLocaleString("pt-PT")}</>}
                            {r.decidedBy && <> • Por {r.decidedBy}</>}
                          </div>

                          {r.decisionNote && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Nota:</strong> {r.decisionNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Rejeitados */}
                <div className="space-y-3">
                  <div className="text-lg font-semibold">Rejeitados</div>

                  {myRejectedRequests.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sem pedidos rejeitados.</div>
                  ) : (
                    <div className="space-y-2">
                      {myRejectedRequests.map((r) => (
                        <div key={r.id} className="rounded-md border p-3 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium">
                              Campo: <span className="text-muted-foreground">{r.fieldPath}</span>
                            </div>
                            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                              Rejeitado
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md bg-muted/50 p-2">
                              <div className="text-xs text-muted-foreground">Antes</div>
                              <div className="font-medium break-words">
                                {r.oldValue == null ? "—" : String(r.oldValue)}
                              </div>
                            </div>

                            <div className="rounded-md bg-muted/50 p-2">
                              <div className="text-xs text-muted-foreground">Depois</div>
                              <div className="font-medium break-words">
                                {r.newValue == null ? "—" : String(r.newValue)}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Submetido em {new Date(r.createdAt).toLocaleString("pt-PT")}
                            {r.decidedAt && <> • Decidido em {new Date(r.decidedAt).toLocaleString("pt-PT")}</>}
                            {r.decidedBy && <> • Por {r.decidedBy}</>}
                          </div>

                          {r.decisionNote && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Nota:</strong> {r.decisionNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

            </Card>
          </TabsContent>

          {/* Outras tabs */}
          {TAB_CONFIG
            .filter((t) => t.value !== "identity" && t.value !== "requests")
            .map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {tab.value === "contact" ? (
                      <>
                        {/* Form novo pedido */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tipo de contacto</Label>
                              <Select
                                value={newRequest.type}
                                onValueChange={(v) =>
                                  setNewRequest((p) => ({ ...p, type: v }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Telefónico">Telefónico</SelectItem>
                                  <SelectItem value="E-mail">E-mail</SelectItem>
                                  <SelectItem value="Presencial">Presencial</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Data agendamento</Label>
                              <Input
                                type="date"
                                value={newRequest.scheduledDate}
                                onChange={(e) =>
                                  setNewRequest((p) => ({
                                    ...p,
                                    scheduledDate: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label>Assunto</Label>
                              <Input
                                value={newRequest.subject}
                                onChange={(e) =>
                                  setNewRequest((p) => ({ ...p, subject: e.target.value }))
                                }
                                placeholder="Escrever assunto…"
                              />
                            </div>
                          </div>

                          <Button onClick={handleAddContactRequest} className="gap-2">
                            <Save className="h-4 w-4" />
                            Guardar Pedido
                          </Button>
                        </div>

                        <Separator />

                        {/* Em curso */}
                        <div className="space-y-3">
                          <div className="text-lg font-semibold">Em curso</div>

                          {openRequests.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                              Não há pedidos em curso.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left">
                                    <th className="py-2">Criado</th>
                                    <th>Tipo</th>
                                    <th>Assunto</th>
                                    <th>Agendado</th>
                                    <th className="text-right">Ações</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {openRequests.map((r) => (
                                    <tr key={r.id} className="border-t">
                                      <td className="py-2">
                                        {new Date(r.createdAt).toLocaleDateString("pt-PT")}
                                      </td>
                                      <td>{r.type}</td>
                                      <td>{r.subject}</td>
                                      <td>{r.scheduledDate || "—"}</td>
                                      <td className="text-right">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCloseOneRequest(r.id)}
                                        >
                                          Fechar
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Histórico */}
                        <div className="space-y-3">
                          <div className="text-lg font-semibold">Histórico</div>

                          {closedRequests.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                              Ainda não existem pedidos fechados.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left">
                                    <th className="py-2">Criado</th>
                                    <th>Tipo</th>
                                    <th>Assunto</th>
                                    <th>Agendado</th>
                                    <th>Fechado</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {closedRequests.map((r) => (
                                    <tr key={r.id} className="border-t">
                                      <td className="py-2">
                                        {new Date(r.createdAt).toLocaleDateString("pt-PT")}
                                      </td>
                                      <td>{r.type}</td>
                                      <td>{r.subject}</td>
                                      <td>{r.scheduledDate || "—"}</td>
                                      <td>
                                        {r.closedAt
                                          ? new Date(r.closedAt).toLocaleDateString("pt-PT")
                                          : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* ✅ Notas internas do gestor (CONTACT) */}
                        {effectiveRole === "gestor" && (
                          <InternalNotesBlock
                            tabKey="contact"
                            formData={formData}
                            setFormData={setFormData}
                          />
                        )}
                      </>
                    ) : tab.value === "documents" ? (
                      <>
                        {/* Campos da documentação */}
                        {renderSectionFields(tab.sectionKey)}

                        {effectiveRole === "gestor" && (
                          <>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <div>
                                  <Label className="text-sm font-medium text-foreground">
                                    Paradeiro
                                  </Label>
                                </div>

                                <div className="flex items-center gap-2 h-10">
                                  <Switch
                                    checked={!!formData.documents.paradeiroKnown}
                                    onCheckedChange={(v) =>
                                      setFormData((prev) =>
                                        prev
                                          ? {
                                            ...prev,
                                            documents: {
                                              ...prev.documents,
                                              paradeiroKnown: v,
                                            },
                                          }
                                          : prev
                                      )
                                    }
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {formData.documents.paradeiroKnown
                                      ? "Conhecido"
                                      : "Desconhecido"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <InternalNotesBlock
                              tabKey="documents"
                              formData={formData}
                              setFormData={setFormData}
                            />
                          </>
                        )}

                        <Separator />

                        {/* DOCUMENTOS ANEXOS */}
                        {/* ... mantém o teu bloco de anexos aqui como já está ... */}

                        {docViewerUrl && (
                          <DocumentViewer
                            open={docViewerOpen}
                            onOpenChange={setDocViewerOpen}
                            title={docViewerTitle}
                            url={docViewerUrl}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {renderSectionFields(tab.sectionKey)}

                        {effectiveRole === "gestor" && (
                          <InternalNotesBlock
                            tabKey={tab.value}
                            formData={formData}
                            setFormData={setFormData}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

        </Tabs>
      </div>
    </Layout>
  );
}

