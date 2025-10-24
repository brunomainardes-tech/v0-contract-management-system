"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Contract } from "@/lib/types"

interface ContractDetailsDrawerProps {
  contract: Contract | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractDetailsDrawer({ contract, open, onOpenChange }: ContractDetailsDrawerProps) {
  if (!contract) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Em Execução":
      case "Ativo":
        return "default"
      case "Encerrado":
      case "Concluído":
        return "secondary"
      case "Prorrogação":
        return "outline"
      case "Cancelado":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle>Detalhes do Contrato</SheetTitle>
            <Badge variant={getStatusVariant(contract.status)}>{contract.status}</Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Informações Básicas */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Informações Básicas</h3>
            <div className="space-y-3">
              {contract.category && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <p className="text-sm font-medium mt-1">{contract.category}</p>
                </div>
              )}
              {contract.gms_number && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Nº GMS</label>
                  <p className="text-sm font-medium mt-1">{contract.gms_number}</p>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Nº Contrato UENP</label>
                <p className="text-sm font-medium mt-1">{contract.contract_number}</p>
              </div>
              {contract.modality && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Modalidade</label>
                  <p className="text-sm font-medium mt-1">{contract.modality}</p>
                </div>
              )}
              {contract.process_number && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Processo</label>
                  <p className="text-sm font-medium mt-1">{contract.process_number}</p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Objeto e Contratada */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Objeto e Contratada</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Objeto</label>
                <p className="text-sm font-medium mt-1">{contract.description}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Contratada</label>
                <p className="text-sm font-medium mt-1">{contract.contractor}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Valores e Vigência */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Valores e Vigência</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Valor</label>
                <p className="text-sm font-medium mt-1">{formatCurrency(contract.value)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Início da Vigência</label>
                <p className="text-sm font-medium mt-1">{formatDate(contract.start_date)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Fim da Vigência</label>
                <p className="text-sm font-medium mt-1">{formatDate(contract.end_date)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Prorrogação</label>
                <p className="text-sm font-medium mt-1">{contract.can_extend ? "Sim" : "Não"}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Gestor do Contrato */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Gestor do Contrato</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Nome</label>
                <p className="text-sm font-medium mt-1">{contract.manager_name || "-"}</p>
              </div>
              {contract.manager_contact && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Contato</label>
                  <p className="text-sm font-medium mt-1">{contract.manager_contact}</p>
                </div>
              )}
              {contract.manager_appointment && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Nomeação</label>
                  <p className="text-sm font-medium mt-1">{contract.manager_appointment}</p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Fiscal do Contrato */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Fiscal do Contrato</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <label className="text-xs text-muted-foreground">Nome</label>
                <p className="text-sm font-medium mt-1">{contract.inspector_name || "-"}</p>
              </div>
              {contract.inspector_contact && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Contato</label>
                  <p className="text-sm font-medium mt-1">{contract.inspector_contact}</p>
                </div>
              )}
              {contract.inspector_appointment && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Nomeação</label>
                  <p className="text-sm font-medium mt-1">{contract.inspector_appointment}</p>
                </div>
              )}
            </div>
          </section>

          {/* Observações */}
          {contract.observations && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold mb-3">Observações</h3>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">{contract.observations}</p>
                </div>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
