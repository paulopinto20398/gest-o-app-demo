import { Layout } from "@/components/Layout";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useAuth } from "@/hooks/useAuth";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Filter, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const BeneficiariesList = () => {
  const { beneficiaries } = useBeneficiaries();
  const { session } = useAuth();

  const managerId = session?.role === "gestor" ? session.managerId : "";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const managedBeneficiaries =
    session?.role === "gestor"
      ? beneficiaries.filter((b) => b.personalInfo.managerId === managerId)
      : [];


  // Filtro de busca (opcional)
  const filteredBeneficiaries = managedBeneficiaries.filter((beneficiary) => {
    const matchesSearchTerm = beneficiary.personalInfo.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || beneficiary.status === statusFilter;

    return matchesSearchTerm && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Beneficiários</h1>
            <p className="text-muted-foreground">
              Gerir processos individuais e listagem de pessoas.
            </p>
          </div>
          <Button asChild>
            <Link to="/beneficiaries/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Beneficiário
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar por nome ou nº..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Processos Ativos</SelectItem>
                    <SelectItem value="employed">Empregados</SelectItem>
                    <SelectItem value="unemployed">Desempregados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nº Processo</TableHead>
                    <TableHead>Nacionalidade</TableHead>
                    <TableHead>Situação Laboral</TableHead>
                    <TableHead>Status Processo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeneficiaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum beneficiário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-xs">
                              {b.personalInfo.name.charAt(0)}
                            </div>
                            {b.personalInfo.name}
                          </div>
                        </TableCell>
                        <TableCell>{b.processNumber}</TableCell>
                        <TableCell>{b.personalInfo.nationality}</TableCell>
                        <TableCell>
                          {b.employment.employed ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Empregado</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Desempregado</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{b.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/beneficiaries/${b.id}`}>
                              <FileText className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BeneficiariesList;
