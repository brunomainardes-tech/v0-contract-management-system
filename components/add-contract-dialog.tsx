"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { createContract } from "@/app/actions/contracts"
import { useToast } from "@/hooks/use-toast"

export function AddContractDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createContract(formData)

    if (result.error) {
      toast({
        title: "Erro ao adicionar contrato",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Contrato adicionado",
        description: "O contrato foi adicionado com sucesso!",
      })
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Contrato</DialogTitle>
          <DialogDescription>Preencha as informações do contrato abaixo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Informações Básicas</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract_number">
                  Número do Contrato <span className="text-red-500">*</span>
                </Label>
                <Input id="contract_number" name="contract_number" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" name="category" placeholder="Ex: Serviços, Obras, etc." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gms_number">Número GMS</Label>
                <Input id="gms_number" name="gms_number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Input id="modality" name="modality" placeholder="Ex: Pregão Eletrônico" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="process_number">Número do Processo</Label>
                <Input id="process_number" name="process_number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select name="status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Suspenso">Suspenso</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição/Objeto <span className="text-red-500">*</span>
              </Label>
              <Textarea id="description" name="description" rows={3} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor">
                Contratada <span className="text-red-500">*</span>
              </Label>
              <Input id="contractor" name="contractor" required />
            </div>
          </div>

          {/* Valores e Datas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Valores e Vigência</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="value">
                  Valor (R$) <span className="text-red-500">*</span>
                </Label>
                <Input id="value" name="value" type="number" step="0.01" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Início da Vigência <span className="text-red-500">*</span>
                </Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  Fim da Vigência <span className="text-red-500">*</span>
                </Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extension_forecast">Previsão de Prorrogação</Label>
              <Input id="extension_forecast" name="extension_forecast" type="date" />
            </div>
          </div>

          {/* Gestor do Contrato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Gestor do Contrato</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="manager_name">Nome do Gestor</Label>
                <Input id="manager_name" name="manager_name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_contact">Contato/Email</Label>
                <Input id="manager_contact" name="manager_contact" type="email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_appointment">Nomeação/Portaria</Label>
                <Input id="manager_appointment" name="manager_appointment" />
              </div>
            </div>
          </div>

          {/* Fiscal do Contrato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Fiscal do Contrato</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="inspector_name">Nome do Fiscal</Label>
                <Input id="inspector_name" name="inspector_name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_contact">Contato/Email</Label>
                <Input id="inspector_contact" name="inspector_contact" type="email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector_appointment">Nomeação/Portaria</Label>
                <Input id="inspector_appointment" name="inspector_appointment" />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Observações</h3>
            <div className="space-y-2">
              <Label htmlFor="observations">Observações Adicionais</Label>
              <Textarea id="observations" name="observations" rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar Contrato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
