"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { createContract, updateContract } from "@/app/actions/contracts"
import { useToast } from "@/hooks/use-toast"
import type { Contract } from "@/lib/types"

interface ContractFormProps {
  contract?: Contract
  trigger?: React.ReactNode
}

export function ContractForm({ contract, trigger }: ContractFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setLoading(true)

    const result = contract ? await updateContract(contract.id, formData) : await createContract(formData)

    setLoading(false)

    if (result?.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setOpen(false)
      toast({
        title: contract ? "Contrato atualizado" : "Contrato criado",
        description: contract ? "O contrato foi atualizado com sucesso." : "O novo contrato foi adicionado ao sistema.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? "Editar Contrato" : "Novo Contrato"}</DialogTitle>
          <DialogDescription>
            {contract ? "Atualize as informações do contrato" : "Preencha os dados do novo contrato"}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Informações Básicas</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={contract?.category || ""}
                  placeholder="Ex: Serviços, Obras, Material"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gms_number">Nº GMS</Label>
                <Input
                  id="gms_number"
                  name="gms_number"
                  defaultValue={contract?.gms_number || ""}
                  placeholder="Número GMS"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract_number">Nº Contrato UENP *</Label>
                <Input
                  id="contract_number"
                  name="contract_number"
                  defaultValue={contract?.contract_number}
                  placeholder="CT-2025-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Input
                  id="modality"
                  name="modality"
                  defaultValue={contract?.modality || ""}
                  placeholder="Ex: Pregão Eletrônico"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="process_number">Processo</Label>
                <Input
                  id="process_number"
                  name="process_number"
                  defaultValue={contract?.process_number || ""}
                  placeholder="Número do processo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue={contract?.status || "Ativo"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Em Execução">Em Execução</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Encerrado">Encerrado</SelectItem>
                    <SelectItem value="Prorrogação">Prorrogação</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Objeto *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={contract?.description}
                placeholder="Descrição detalhada do objeto do contrato"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor">Contratada *</Label>
              <Input
                id="contractor"
                name="contractor"
                defaultValue={contract?.contractor}
                placeholder="Nome da empresa contratada"
                required
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Valores e Vigência</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  defaultValue={contract?.value}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="can_extend">Prorrogação de Contrato</Label>
                <Select name="can_extend" defaultValue={contract?.can_extend ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Selecione se o contrato pode ser prorrogado</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Início da Vigência *</Label>
                <Input id="start_date" name="start_date" type="date" defaultValue={contract?.start_date} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fim da Vigência *</Label>
                <Input id="end_date" name="end_date" type="date" defaultValue={contract?.end_date} required />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Gestor do Contrato</h3>
            <div className="space-y-2">
              <Label htmlFor="manager_name">Nome do Gestor</Label>
              <Input
                id="manager_name"
                name="manager_name"
                defaultValue={contract?.manager_name || ""}
                placeholder="Nome completo do gestor"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manager_contact">Contato do Gestor</Label>
                <Input
                  id="manager_contact"
                  name="manager_contact"
                  defaultValue={contract?.manager_contact || ""}
                  placeholder="Email ou telefone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager_appointment">Nomeação do Gestor</Label>
                <Input
                  id="manager_appointment"
                  name="manager_appointment"
                  defaultValue={contract?.manager_appointment || ""}
                  placeholder="Ex: Portaria 123/2025"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Fiscal do Contrato</h3>
            <div className="space-y-2">
              <Label htmlFor="inspector_name">Nome do Fiscal</Label>
              <Input
                id="inspector_name"
                name="inspector_name"
                defaultValue={contract?.inspector_name || ""}
                placeholder="Nome completo do fiscal"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inspector_contact">Contato do Fiscal</Label>
                <Input
                  id="inspector_contact"
                  name="inspector_contact"
                  defaultValue={contract?.inspector_contact || ""}
                  placeholder="Email ou telefone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspector_appointment">Nomeação do Fiscal</Label>
                <Input
                  id="inspector_appointment"
                  name="inspector_appointment"
                  defaultValue={contract?.inspector_appointment || ""}
                  placeholder="Ex: Portaria 124/2025"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Observações</h3>
            <div className="space-y-2">
              <Label htmlFor="observations">Observações Adicionais</Label>
              <Textarea
                id="observations"
                name="observations"
                defaultValue={contract?.observations || ""}
                placeholder="Informações adicionais sobre o contrato"
                rows={3}
              />
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : contract ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
