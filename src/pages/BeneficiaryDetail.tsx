import { Layout } from "@/components/Layout";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
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


export default function BeneficiaryDetail() {
  const { id } = useParams();
  const isNew = !id || id === "new" || id === "novo";

  // evita re-carregar / re-inicializar o formData a cada render
  const loadedIdRef = useRef<string | null>(null);

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
      loadedIdRef.current = currentKey;
      return;
    }

    const data = getBeneficiary(id || "");
    if (!data) {
      setFormData(null);
      loadedIdRef.current = currentKey;
      return;
    }

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
    if (id === "new") {
      addBeneficiary(formData);
      navigate(`/beneficiaries/${formData.id}`);
    } else {
      updateBeneficiary(formData.id, formData);
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
        {fields.map((fieldConfig) => (
          <div
            key={fieldConfig.key}
            className={fieldConfig.fieldType === "textarea" ? "md:col-span-2" : ""}
          >
            <FieldRenderer
              config={fieldConfig}
              value={getFieldValue(fieldConfig)}
              onChange={(val) => setFieldValue(fieldConfig, val)}
              role={effectiveRole}
            />



          </div>
        ))}
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
              Guardar
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

                  <div className="flex-1">{renderSectionFields("identification")}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras tabs */}
          {TAB_CONFIG.filter((t) => t.value !== "identity").map((tab) => (
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
                      {/* ===================== CONTACTO (o teu bloco existente) ===================== */}

                      {/* Form novo pedido */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tipo de contacto</Label>
                            <Select
                              value={newRequest.type}
                              onValueChange={(v) => setNewRequest((p) => ({ ...p, type: v }))}
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
                                setNewRequest((p) => ({ ...p, scheduledDate: e.target.value }))
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
                    </>
                  ) : tab.value === "documents" ? (
                    <>
                      {/* Campos da documentação */}
                      {renderSectionFields(tab.sectionKey)}

                      <Separator />

                      {/* ===================== DOCUMENTOS ANEXOS ===================== */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">Documentos anexos</div>

                          <Button variant="outline" onClick={() => setSubmitDocOpen(true)}>
                            {effectiveRole === "gestor"
                              ? "Anexar documento"
                              : "Submeter documento"}
                          </Button>
                        </div>

                        {safeArray<any>(formData.documents.attachments).length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            Sem documentos anexos.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {safeArray<any>(formData.documents.attachments).map((d) => (
                              <div
                                key={d.id}
                                className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="font-medium">{d.label}</div>
                                  <StatusBadge status={d.status} />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDoc(d.label, d.fileUrl)}
                                  >
                                    Ver
                                  </Button>

                                  {session?.role === "gestor" && d.status === "pendente" && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          approveAttachment(
                                            formData.id,
                                            d.id,
                                            session.managerId
                                          );

                                          setFormData((prev) =>
                                            prev
                                              ? {
                                                ...prev,
                                                documents: {
                                                  ...prev.documents,
                                                  attachments:
                                                    safeArray<any>(
                                                      prev.documents.attachments
                                                    ).map((x) =>
                                                      x.id === d.id
                                                        ? { ...x, status: "aprovado" }
                                                        : x
                                                    ),
                                                },
                                              }
                                              : prev
                                          );
                                        }}
                                      >
                                        Aprovar
                                      </Button>

                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setRejectDocId(d.id);
                                          setRejectNote("");
                                          setRejectOpen(true);
                                        }}
                                      >
                                        Rejeitar
                                      </Button>
                                    </>
                                  )}
                                </div>

                                {d.note && (
                                  <div className="text-sm text-muted-foreground">
                                    Motivo: {d.note}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Viewer */}
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
                    renderSectionFields(tab.sectionKey)
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

