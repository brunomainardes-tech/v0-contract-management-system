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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? "Editar Contrato" : "Novo Contrato"}</DialogTitle>
          <DialogDescription>
            {contract ? "Atualize as informações do contrato" : "Preencha os dados do novo contrato"}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_number">Número do Contrato</Label>
              <Input
                id="contract_number"
                name="contract_number"
                defaultValue={contract?.contract_number}
                placeholder="CT-2025-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractor">Contratado</Label>
              <Input
                id="contractor"
                name="contractor"
                defaultValue={contract?.contractor}
                placeholder="Nome da empresa"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={contract?.description}
              placeholder="Descrição detalhada do contrato"
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
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
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                name="category"
                defaultValue={contract?.category || ""}
                placeholder="Ex: Serviços, Obras, Material"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={contract?.start_date} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={contract?.end_date} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={contract?.status || "Ativo"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
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
