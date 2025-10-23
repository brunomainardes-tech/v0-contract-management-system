"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { ContractForm } from "./contract-form"
import { ContractDetailsDrawer } from "./contract-details-drawer"
import { deleteContract } from "@/app/actions/contracts"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@supabase/ssr"
import type { Contract } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ContractsTableProps {
  contracts: Contract[]
  isAuthenticated: boolean
}

export function ContractsTable({ contracts: initialContracts, isAuthenticated }: ContractsTableProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const channel = supabase
      .channel("contracts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contracts",
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            setContracts((prev) => {
              const newContract = payload.new as Contract
              const updated = [...prev, newContract]
              return updated.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
            })
          } else if (payload.eventType === "UPDATE") {
            setContracts((prev) => {
              const updated = prev.map((contract) =>
                contract.id === payload.new.id ? (payload.new as Contract) : contract,
              )
              return updated.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
            })
          } else if (payload.eventType === "DELETE") {
            setContracts((prev) => prev.filter((contract) => contract.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    setContracts(initialContracts)
  }, [initialContracts])

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contract_number.toLowerCase().includes(search.toLowerCase()) ||
      contract.description.toLowerCase().includes(search.toLowerCase()) ||
      contract.contractor.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === "all" || contract.category === categoryFilter
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(contracts.map((c) => c.category).filter(Boolean)))

  async function handleDelete() {
    if (!deleteId) return

    const result = await deleteContract(deleteId)
    setDeleteId(null)

    if (result?.error) {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      })
    }
  }

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
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por nº contrato, objeto ou contratada..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category!}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Em Execução">Em Execução</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Encerrado">Encerrado</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Prorrogação">Prorrogação</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Contrato</TableHead>
                <TableHead>Objeto</TableHead>
                <TableHead>Contratada</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Fim da Vigência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_number}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="line-clamp-2">{contract.description}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="line-clamp-1">{contract.contractor}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatCurrency(contract.value)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {contract.end_date ? formatDate(contract.end_date) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(contract.status)} className="whitespace-nowrap">
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedContract(contract)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        {isAuthenticated && (
                          <>
                            <ContractForm
                              contract={contract}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(contract.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Total de {filteredContracts.length} contrato(s) encontrado(s)
        </div>
      </div>

      <ContractDetailsDrawer
        contract={selectedContract}
        open={!!selectedContract}
        onOpenChange={(open) => !open && setSelectedContract(null)}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
