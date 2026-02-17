export type UserRole = "cidadao" | "gestor";

export type FieldStatus = "Em curso" | "Fechado" | "Não se aplica";

export type ContactRequestStatus = "Em curso" | "Fechado";

/**
 * Pedido de contacto individual
 */
export interface ContactRequest {
  id: string;
  type: string;            // Telefónico, E-mail, Presencial
  scheduledDate: string;   // "YYYY-MM-DD"
  subject: string;
  status: ContactRequestStatus;
  createdAt: string;       // ISO obrigatório
  closedAt?: string;       // ISO opcional
}

/**
 * Beneficiário
 */
export interface Beneficiary {
  id: string;
  processNumber: string;
  photoUrl?: string;
  status: "active" | "archived" | "pending";

  personalInfo: {
    name: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    naturality: string;
    maritalStatus: string;
    languages: string[];
    entryDatePortugal: string;
    nie?: string;
    address: string;
    phone: string;
    email: string;
    householdSize: number;
    householdLinked?: string;
    entityManager: string;
    managerName: string;
    managerId: string;
    dataSharingAuthorized: boolean;
  };

  documents: {
    regularizationProcessType: string;
    processStartDate: string;
    processStatus: string;
    documentAIMA?: string;
    documentAIMAValidity?: string;
    niss?: string;
    nif?: string;
    nnu?: string;
    drivingLicense: boolean;
    nationalityRequest: boolean;
    otherDocs: string[];
  };

  health: {
    usf: string;
    doctorName: string;
    firstAppointment?: string;
    specialtyAppointments: boolean;
    medication: boolean;
    vaccination: boolean;
    observations: string;
  };

  housing: {
    type: string;
    contractType: string;
    contractEndDate: string;
    satisfaction: string;
    lookingForAlternative: boolean;
    observations: string;
  };

  pla: {
    modality: string;
    institution: string;
    location: string;
    weeklyHours: number;
    levelEquivalence: string;
    satisfaction: string;
    observations: string;
  };

  education: {
    startDate: string;
    institution: string;
    location: string;
    level: string;
    specialNeeds: boolean;
    performance?: string;
  };

  training: {
    attending: boolean;
    institution?: string;
    startDate?: string;
    trainingType?: string;
    certified?: boolean;
    courseArea?: string;
    totalHours?: number;
    satisfaction?: string;
    previousTraining?: string;
    observations: string;
  };

  employment: {
    employed: boolean;
    contractType?: string;
    startDate?: string;
    schedule?: string;
    profession?: string;
    location?: string;
    satisfaction?: string;
    professionalExperience?: string;
    activeSearch: boolean;
    registeredIEFP: boolean;
    serviceIEFP?: string;
  };

  socialSupport: {
    hasSupport: boolean;
    supportTypes: string[];
    pendingRequests: string[];
    familyAllowance: boolean;
    foodBank: boolean;
    otherEntities?: string;
    technicianName?: string;
  };

  /**
   * ✅ LISTAS (não opcionais para evitar "possibly undefined")
   */
  contactRequests: ContactRequest[];
  contactRequestsAIMA: ContactRequest[];
  contactRequestsHistory: ContactRequest[];       // opcional manter
  contactRequestsAIMAHistory: ContactRequest[];   // opcional manter
}

// ============================
// Field configuration
// ============================
export type FieldType = "text" | "number" | "date" | "select" | "boolean" | "link" | "textarea";

export interface FieldConfig {
  key: string;
  label: string;
  section: string;
  fieldType: FieldType;
  options?: string[];
  source: string;
  editableByCidadao: boolean;
  editableByGestor: boolean;
  requiresValidation?: boolean;
}

// ✅ NOTA: removi a secção contactRequest porque contactRequests agora é ARRAY.
// A tab Contacto deve usar UI própria (como fizemos no BeneficiaryDetail).
export const SECTION_FIELDS: Record<string, FieldConfig[]> = {
  identification: [
    { key: "processNumber", label: "ID Processo Plataforma", section: "root", fieldType: "text", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "name", label: "Nome", section: "personalInfo", fieldType: "text", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "dateOfBirth", label: "Data Nascimento", section: "personalInfo", fieldType: "date", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "gender", label: "Género", section: "personalInfo", fieldType: "select", options: ["Masculino", "Feminino", "Outro"], source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "nationality", label: "Nacionalidade", section: "personalInfo", fieldType: "select", options: ["Índia", "China", "Angola", "Moçambique", "Brasil", "Outro"], source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "naturality", label: "Naturalidade", section: "personalInfo", fieldType: "select", options: ["Índia", "China", "Angola", "Moçambique", "Brasil", "Outro"], source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "maritalStatus", label: "Estado Civil", section: "personalInfo", fieldType: "select", options: ["Solteiro", "Casado", "Divorciado", "Viúvo", "União de Facto"], source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "languages", label: "Idiomas", section: "personalInfo", fieldType: "text", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "entryDatePortugal", label: "Data de Entrada em Portugal", section: "personalInfo", fieldType: "date", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "nie", label: "NIE", section: "personalInfo", fieldType: "text", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "address", label: "Morada", section: "personalInfo", fieldType: "text", source: "AIMA; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "phone", label: "Telefone", section: "personalInfo", fieldType: "text", source: "AIMA; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "email", label: "E-mail", section: "personalInfo", fieldType: "text", source: "AIMA; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "householdSize", label: "Nº pessoas que compõem AF", section: "personalInfo", fieldType: "select", options: ["0", "1", "2", "3", "4", "5+"], source: "AIMA; Próprio", editableByCidadao: false, editableByGestor: true },
    { key: "householdLinked", label: "Agregado Familiar associado", section: "personalInfo", fieldType: "link", source: "AIMA; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "entityManager", label: "Entidade Gestora de Processo", section: "personalInfo", fieldType: "text", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "managerName", label: "Técnico Gestor de Processo", section: "personalInfo", fieldType: "text", source: "AIMA; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "managerId", label: "ID Gestor", section: "personalInfo", fieldType: "text", source: "Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "dataSharingAuthorized", label: "Autorização de partilha de dados", section: "personalInfo", fieldType: "boolean", source: "Próprio", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
  ],

  documentation: [
    { key: "regularizationProcessType", label: "Tipo de Processo Regularização", section: "documents", fieldType: "select", options: ["Visto Estudante", "Autorização de Residência", "Asilo", "Proteção Subsidiária", "Reagrupamento Familiar", "Outro"], source: "AIMA", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "processStartDate", label: "Data de início do Processo", section: "documents", fieldType: "date", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "processStatus", label: "Estado do Processo", section: "documents", fieldType: "select", options: ["Em curso", "Concluído", "Suspenso", "Arquivado"], source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "documentAIMA", label: "Documento AIMA", section: "documents", fieldType: "select", options: ["NA", "Título de Residência", "Certificado"], source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "documentAIMAValidity", label: "Validade Documento AIMA", section: "documents", fieldType: "date", source: "AIMA", editableByCidadao: false, editableByGestor: true },
    { key: "niss", label: "NISS", section: "documents", fieldType: "text", source: "ISS", editableByCidadao: false, editableByGestor: true },
    { key: "nif", label: "NIF", section: "documents", fieldType: "text", source: "AT", editableByCidadao: false, editableByGestor: true },
    { key: "nnu", label: "Nº SNS", section: "documents", fieldType: "text", source: "DGS", editableByCidadao: false, editableByGestor: true },
    { key: "drivingLicense", label: "Carta de Condução", section: "documents", fieldType: "boolean", source: "IMT; Próprio", editableByCidadao: false, editableByGestor: true },
    { key: "nationalityRequest", label: "Pedido de Nacionalidade", section: "documents", fieldType: "boolean", source: "IRN", editableByCidadao: false, editableByGestor: true },
    { key: "otherDocs", label: "Outros documentos identificação", section: "documents", fieldType: "text", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
  ],

  health: [
    { key: "usf", label: "USF", section: "health", fieldType: "text", source: "DGS", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "doctorName", label: "Médico Família", section: "health", fieldType: "text", source: "DGS", editableByCidadao: false, editableByGestor: true },
    { key: "firstAppointment", label: "Acesso a 1ª consulta", section: "health", fieldType: "date", source: "DGS", editableByCidadao: false, editableByGestor: true },
    { key: "specialtyAppointments", label: "Acesso a consultas especialidade", section: "health", fieldType: "boolean", source: "DGS", editableByCidadao: false, editableByGestor: true },
    { key: "medication", label: "Receita Médica", section: "health", fieldType: "boolean", source: "DGS", editableByCidadao: false, editableByGestor: true },
    { key: "vaccination", label: "Vacinação", section: "health", fieldType: "boolean", source: "DGS", editableByCidadao: false, editableByGestor: true },
    { key: "observations", label: "Observações saúde", section: "health", fieldType: "textarea", source: "DGS", editableByCidadao: false, editableByGestor: true },
  ],

  housing: [
    { key: "type", label: "Tipo de habitação", section: "housing", fieldType: "select", options: ["Quarto", "Apartamento", "Casa", "Alojamento Temporário", "Sem Abrigo", "Outro"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "contractType", label: "Tipo de contrato", section: "housing", fieldType: "select", options: ["Arrendamento", "Subarrendamento", "Cedência", "Sem Contrato", "Outro"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "contractEndDate", label: "Validade do contrato", section: "housing", fieldType: "date", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "satisfaction", label: "Satisfação habitação", section: "housing", fieldType: "select", options: ["Muito Satisfeito", "Satisfeito", "Pouco Satisfeito", "Insatisfeito"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "lookingForAlternative", label: "Procura alternativa habitação", section: "housing", fieldType: "boolean", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "observations", label: "Observações habitação", section: "housing", fieldType: "textarea", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
  ],

  pla: [
    { key: "modality", label: "Modalidade de PLA", section: "pla", fieldType: "select", options: ["Curso Online", "Presencial", "Misto", "Não frequenta"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "institution", label: "Entidade Formadora", section: "pla", fieldType: "text", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "location", label: "Local", section: "pla", fieldType: "text", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "weeklyHours", label: "Nº horas semanais", section: "pla", fieldType: "number", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "levelEquivalence", label: "Equivalência Nível idioma", section: "pla", fieldType: "select", options: ["A1", "A2", "B1", "B2", "C1", "C2"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "satisfaction", label: "Satisfação PLA", section: "pla", fieldType: "select", options: ["Muito Satisfeito", "Satisfeito", "Pouco Satisfeito", "Insatisfeito"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "observations", label: "Observações PLA", section: "pla", fieldType: "textarea", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
  ],

  education: [
    { key: "startDate", label: "Data início de frequência", section: "education", fieldType: "date", source: "DGE", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "institution", label: "Estabelecimento de Ensino", section: "education", fieldType: "text", source: "DGE", editableByCidadao: false, editableByGestor: true },
    { key: "location", label: "Local", section: "education", fieldType: "text", source: "DGE", editableByCidadao: false, editableByGestor: true },
    { key: "level", label: "Ano em frequência", section: "education", fieldType: "select", options: ["Pré-escolar", "1º Ciclo", "2º Ciclo", "3º Ciclo", "Secundário", "Licenciatura", "Mestrado", "Doutoramento"], source: "DGE", editableByCidadao: false, editableByGestor: true },
    { key: "specialNeeds", label: "NEE", section: "education", fieldType: "boolean", source: "DGE", editableByCidadao: false, editableByGestor: true },
    { key: "performance", label: "Aproveitamento Escolar", section: "education", fieldType: "select", options: ["NA", "Bom", "Suficiente", "Insuficiente"], source: "DGE", editableByCidadao: false, editableByGestor: true },
  ],

  training: [
    { key: "attending", label: "Frequência", section: "training", fieldType: "boolean", source: "IEFP", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "institution", label: "Entidade Formadora", section: "training", fieldType: "text", source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "startDate", label: "Data de início de frequência", section: "training", fieldType: "date", source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "trainingType", label: "Tipo de formação", section: "training", fieldType: "select", options: ["Profissional", "Académica", "Técnica", "Outra"], source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "certified", label: "Certificado", section: "training", fieldType: "boolean", source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "courseArea", label: "Área de formação", section: "training", fieldType: "text", source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "totalHours", label: "Número total de horas", section: "training", fieldType: "number", source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "satisfaction", label: "Satisfação formação", section: "training", fieldType: "select", options: ["Muito Satisfeito", "Satisfeito", "Pouco Satisfeito", "Insatisfeito"], source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "previousTraining", label: "Formação anteriormente realizada", section: "training", fieldType: "text", source: "IEFP", editableByCidadao: false, editableByGestor: true },
    { key: "observations", label: "Observações formação", section: "training", fieldType: "textarea", source: "IEFP", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
  ],

  employment: [
    { key: "employed", label: "Empregado", section: "employment", fieldType: "boolean", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "contractType", label: "Tipo de contrato", section: "employment", fieldType: "select", options: ["Sem termo", "A termo certo", "A termo incerto", "Prestação de serviços", "Outro"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "startDate", label: "Data inicio", section: "employment", fieldType: "date", source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "schedule", label: "Horário", section: "employment", fieldType: "select", options: ["Tempo Inteiro", "Tempo Parcial", "Turnos", "Outro"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "profession", label: "Profissão", section: "employment", fieldType: "text", source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "location", label: "Local", section: "employment", fieldType: "text", source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "satisfaction", label: "Satisfação emprego", section: "employment", fieldType: "select", options: ["Muito Satisfeito", "Satisfeito", "Pouco Satisfeito", "Insatisfeito"], source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "professionalExperience", label: "Experiência profissional", section: "employment", fieldType: "text", source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "activeSearch", label: "Procura ativa de emprego", section: "employment", fieldType: "boolean", source: "Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true },
    { key: "registeredIEFP", label: "Inscrito no IEFP", section: "employment", fieldType: "boolean", source: "IEFP", editableByCidadao: true, editableByGestor: true },
    { key: "serviceIEFP", label: "Serviço IEFP", section: "employment", fieldType: "text", source: "IEFP", editableByCidadao: true, editableByGestor: true },
  ],

  socialSupport: [
    { key: "hasSupport", label: "Apoios Sociais", section: "socialSupport", fieldType: "boolean", source: "ISS; Próprio; Entidade Gestora Processo", editableByCidadao: true, editableByGestor: true, requiresValidation: true },
    { key: "supportTypes", label: "Qual?", section: "socialSupport", fieldType: "text", source: "ISS; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "pendingRequests", label: "Outros pedidos em análise", section: "socialSupport", fieldType: "text", source: "ISS; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "familyAllowance", label: "Abono de Família", section: "socialSupport", fieldType: "boolean", source: "ISS; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "foodBank", label: "Banco Alimentar", section: "socialSupport", fieldType: "boolean", source: "Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "otherEntities", label: "Outras entidades sociais", section: "socialSupport", fieldType: "text", source: "ISS; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
    { key: "technicianName", label: "Outras Técnicos/as sociais", section: "socialSupport", fieldType: "text", source: "ISS; Próprio; Entidade Gestora Processo", editableByCidadao: false, editableByGestor: true },
  ],
};

// ============================
// Mock Data (corrigido)
// ============================
export const MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: "1",
    processNumber: "123456",
    status: "active",
    personalInfo: {
      name: "Mohammed Singh",
      dateOfBirth: "2000-01-01",
      gender: "Masculino",
      nationality: "Índia",
      naturality: "Índia",
      maritalStatus: "Solteiro",
      languages: ["Hindi", "Inglês"],
      entryDatePortugal: "2026-01-01",
      nie: "123456",
      address: "Rua de Cima, 43, 1º drt 1750-100 Lisboa",
      phone: "911111111",
      email: "msingh@gmail.com",
      householdSize: 0,
      entityManager: "FOCUS Europa",
      managerName: "António Silva",
      managerId: "G002",
      dataSharingAuthorized: true,
    },
    documents: {
      regularizationProcessType: "Visto Estudante",
      processStartDate: "2026-05-01",
      processStatus: "Em curso",
      documentAIMA: "NA",
      documentAIMAValidity: "",
      niss: "11111111111",
      nif: "111111111",
      nnu: "111111111",
      drivingLicense: true,
      nationalityRequest: false,
      otherDocs: ["Passaporte"],
    },
    health: {
      usf: "USF Alta de Lisboa",
      doctorName: "António Pinto",
      specialtyAppointments: false,
      medication: false,
      vaccination: false,
      observations: "",
    },
    housing: {
      type: "Quarto",
      contractType: "Arrendamento",
      contractEndDate: "2027-01-01",
      satisfaction: "Satisfeito",
      lookingForAlternative: false,
      observations: "",
    },
    pla: {
      modality: "Curso Online",
      institution: "CIAL",
      location: "Lisboa",
      weeklyHours: 6,
      levelEquivalence: "A1",
      satisfaction: "Satisfeito",
      observations: "",
    },
    education: {
      startDate: "2026-01-01",
      institution: "Universidade Nova de Lisboa",
      location: "Lisboa",
      level: "Licenciatura",
      specialNeeds: false,
    },
    training: {
      attending: false,
      observations: "",
    },
    employment: {
      employed: false,
      activeSearch: true,
      registeredIEFP: true,
      serviceIEFP: "IEFP Picoas",
    },
    socialSupport: {
      hasSupport: false,
      supportTypes: [],
      pendingRequests: [],
      familyAllowance: false,
      foodBank: false,
      otherEntities: "SASNOVA",
      technicianName: "António Oliveira",
    },

    contactRequests: [],
    contactRequestsAIMA: [],
    contactRequestsHistory: [],
    contactRequestsAIMAHistory: [],
  },

  {
    id: "2",
    processNumber: "123457",
    status: "active",
    personalInfo: {
      name: "Sarah Chen",
      dateOfBirth: "1995-03-15",
      gender: "Feminino",
      nationality: "China",
      naturality: "China",
      maritalStatus: "Casada",
      languages: ["Mandarim", "Inglês", "Português"],
      entryDatePortugal: "2025-06-10",
      nie: "654321",
      address: "Av. da Liberdade, 100, Lisboa",
      phone: "922222222",
      email: "sarah.chen@email.com",
      householdSize: 2,
      entityManager: "FOCUS Europa",
      managerName: "Maria Santos",
      managerId: "G001",
      dataSharingAuthorized: true,
    },
    documents: {
      regularizationProcessType: "Autorização de Residência",
      processStartDate: "2025-07-01",
      processStatus: "Concluído",
      documentAIMA: "Título de Residência",
      documentAIMAValidity: "2028-07-01",
      niss: "22222222222",
      nif: "222222222",
      nnu: "222222222",
      drivingLicense: true,
      nationalityRequest: false,
      otherDocs: ["Passaporte", "Visto"],
    },
    health: {
      usf: "USF Baixa",
      doctorName: "Joana Lima",
      specialtyAppointments: true,
      medication: true,
      vaccination: true,
      observations: "Acompanhamento regular",
    },
    housing: {
      type: "Apartamento",
      contractType: "Arrendamento",
      contractEndDate: "2028-01-01",
      satisfaction: "Muito Satisfeito",
      lookingForAlternative: false,
      observations: "",
    },
    pla: {
      modality: "Presencial",
      institution: "IEFP",
      location: "Lisboa",
      weeklyHours: 10,
      levelEquivalence: "B1",
      satisfaction: "Muito Satisfeito",
      observations: "",
    },
    education: {
      startDate: "2020-09-01",
      institution: "Universidade de Pequim",
      location: "Pequim",
      level: "Mestrado",
      specialNeeds: false,
    },
    training: {
      attending: true,
      institution: "Code Academy",
      courseArea: "Programação",
      startDate: "2026-02-01",
      totalHours: 300,
      certified: false,
      observations: "Curso intensivo",
    },
    employment: {
      employed: true,
      contractType: "Sem termo",
      startDate: "2026-01-15",
      schedule: "Tempo Inteiro",
      profession: "Developer",
      location: "Lisboa",
      satisfaction: "Satisfeito",
      activeSearch: false,
      registeredIEFP: false,
    },
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
  },
];
