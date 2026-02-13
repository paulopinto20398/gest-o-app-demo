import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldConfig, UserRole } from "@/types/beneficiary";
import { Info, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FieldRendererProps {
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  role: UserRole;
}

export function FieldRenderer({ config, value, onChange, role }: FieldRendererProps) {
  const isEditable = role === "gestor" ? config.editableByGestor : config.editableByCidadao;

  const displayValue = () => {
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (Array.isArray(value)) return value.join(", ") || "—";
    return String(value);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium text-foreground">
          {config.label}
        </Label>
        {!isEditable && (
          <Lock className="h-3 w-3 text-muted-foreground" />
        )}
        {config.requiresValidation && role === "cidadao" && isEditable && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-warning-foreground/30 text-warning-foreground bg-warning">
                Validação
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Alteração validada pelo Gestor de Processo</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3 w-3 text-muted-foreground/50" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Fonte: {config.source}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {!isEditable ? (
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {displayValue()}
        </div>
      ) : (
        <>
          {/*           {config.fieldType === "text" && (
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          )} */}
          {config.fieldType === "text" && (
            <Input
              value={Array.isArray(value) ? value.join(", ") : (value ?? "")}
              onChange={(e) => {
                const v = e.target.value;

                // Se o valor atual for um array (ex: languages, otherDocs, supportTypes...)
                // guardamos como array (separado por vírgulas)
                if (Array.isArray(value)) {
                  onChange(
                    v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  );
                } else {
                  onChange(v);
                }
              }}
            />
          )}
          {config.fieldType === "number" && (
            <Input
              type="text"
              inputMode="numeric"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
          {config.fieldType === "date" && (
            <Input
              type="date"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
          {config.fieldType === "select" && config.options && (
            <Select value={value ?? ""} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {config.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {config.fieldType === "boolean" && (
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={!!value}
                onCheckedChange={onChange}
              />
              <span className="text-sm text-muted-foreground">
                {value ? "Sim" : "Não"}
              </span>
            </div>
          )}
          {config.fieldType === "textarea" && (
            <Textarea
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
            />
          )}
          {config.fieldType === "link" && (
            <Input
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ligação..."
            />
          )}
        </>
      )}
    </div>
  );
}
