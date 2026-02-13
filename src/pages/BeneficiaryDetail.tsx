import { Layout } from "@/components/Layout";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Upload, User, FileText, Heart, Home, Book, GraduationCap, Briefcase, HandCoins, Phone, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Beneficiary, UserRole, SECTION_FIELDS, FieldConfig } from "@/types/beneficiary";
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

const EMPTY_BENEFICIARY: Beneficiary = {
  id: crypto.randomUUID(),
  processNumber: "",
  status: "active",
  personalInfo: {
    name: "", dateOfBirth: "", gender: "", nationality: "", naturality: "",
    maritalStatus: "", languages: [], entryDatePortugal: "", address: "",
    phone: "", email: "", householdSize: 1, entityManager: "", managerName: "",
    dataSharingAuthorized: false,
  },
  documents: {
    regularizationProcessType: "", processStartDate: "", processStatus: "",
    drivingLicense: false, nationalityRequest: false, otherDocs: [],
  },
  health: { usf: "", doctorName: "", specialtyAppointments: false, medication: false, vaccination: false, observations: "" },
  housing: { type: "", contractType: "", contractEndDate: "", satisfaction: "", lookingForAlternative: false, observations: "" },
  pla: { modality: "", institution: "", location: "", weeklyHours: 0, levelEquivalence: "", satisfaction: "", observations: "" },
  education: { startDate: "", institution: "", location: "", level: "", specialNeeds: false },
  training: { attending: false, observations: "" },
  employment: { employed: false, activeSearch: false, registeredIEFP: false },
  socialSupport: { hasSupport: false, supportTypes: [], pendingRequests: [], familyAllowance: false, foodBank: false },
  contactRequests: { type: "", scheduledDate: "", subject: "" },
  contactRequestsAIMA: { type: "", scheduledDate: "", subject: "" },
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

const BeneficiaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBeneficiary, updateBeneficiary, addBeneficiary, loading } = useBeneficiaries();
  const [activeTab, setActiveTab] = useState("identity");
  const [formData, setFormData] = useState<Beneficiary | null>(null);
  const [role, setRole] = useState("gestor");

  // Carregar dados do beneficiário ou inicializar um novo
  useEffect(() => {
    if (loading) return;
    if (id === "new") {
      setFormData({ ...EMPTY_BENEFICIARY, id: crypto.randomUUID() });
      return;
    }

    const data = getBeneficiary(id || "");
    if (data) setFormData(data);
    else setFormData(null);
  }, [id, loading]);

  // Log para verificar mudanças no formData
  useEffect(() => {
    console.log("BeneficiaryDetail formData:", formData);
  }, [formData]);

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


  // Função para salvar os dados
  const handleSave = () => {
    if (id === "new") {
      addBeneficiary(formData);
      navigate(`/beneficiaries/${formData.id}`);
    } else {
      updateBeneficiary(formData.id, formData);
    }
  };

  // Função para obter o valor do campo
  const getFieldValue = (config: FieldConfig) => {
    if (config.section === "root") {
      return formData[config.key];  // Para campos no nível raiz
    }
    const sectionData = formData[config.section];
    return sectionData ? sectionData[config.key] : "";
  };

  // Função para definir o valor do campo
  const setFieldValue = (config: FieldConfig, value: any) => {
    setFormData((prev) => {
      if (!prev) return null;
      if (config.section === "root") {
        return { ...prev, [config.key]: value };
      }
      const sectionData = prev[config.section] || {};
      return {
        ...prev,
        [config.section]: { ...sectionData, [config.key]: value },
      };
    });
  };

  // Função para renderizar os campos de cada seção
  const renderSectionFields = (sectionKey: string) => {
    const fields = SECTION_FIELDS[sectionKey];
    if (!fields) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((fieldConfig) => (
          <div key={fieldConfig.key} className={fieldConfig.fieldType === "textarea" ? "md:col-span-2" : ""}>
            <FieldRenderer
              config={fieldConfig}
              value={getFieldValue(fieldConfig)}
              onChange={(val) => setFieldValue(fieldConfig, val)}
              role={role as UserRole}
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
                  <Badge variant="secondary" className="ml-2">{formData.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setRole("cidadao")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${role === "cidadao"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <User className="h-3.5 w-3.5 inline mr-1.5" />
                Cidadão
              </button>
              <button
                onClick={() => setRole("gestor")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${role === "gestor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Shield className="h-3.5 w-3.5 inline mr-1.5" />
                Gestor
              </button>
            </div>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Photo upload for identity tab */}
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

          {/* Identity tab with photo */}
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
                    {role === "gestor" && (
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
                                setFormData(prev => prev ? { ...prev, photoUrl: reader.result as string } : null);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Upload className="h-4 w-4" /> Foto
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    {renderSectionFields("identification")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All other tabs rendered dynamically */}
          {TAB_CONFIG.filter(t => t.value !== "identity").map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderSectionFields(tab.sectionKey)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default BeneficiaryDetail;
