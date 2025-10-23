"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, CheckCircle, Activity } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import type { DashboardStats as DashboardStatsType, Contract } from "@/lib/types"

interface DashboardStatsProps {
  stats: DashboardStatsType
}

export function DashboardStats({ stats: initialStats }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStatsType>(initialStats)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const channel = supabase
      .channel("dashboard-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contracts",
        },
        async () => {
          // Refetch all contracts to recalculate stats
          const { data: contracts } = await supabase
            .from("contracts")
            .select("*")
            .order("created_at", { ascending: false })

          if (contracts) {
            const contractsList = contracts as Contract[]
            setStats({
              totalContracts: contractsList.length,
              totalValue: contractsList.reduce((sum, c) => sum + Number(c.value), 0),
              activeContracts: contractsList.filter((c) => c.status === "Ativo").length,
              completedContracts: contractsList.filter((c) => c.status === "Concluído").length,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    setStats(initialStats)
  }, [initialStats])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalContracts}</div>
          <p className="text-xs text-muted-foreground">Contratos registrados no sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          <p className="text-xs text-muted-foreground">Soma de todos os contratos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeContracts}</div>
          <p className="text-xs text-muted-foreground">Em vigência atualmente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedContracts}</div>
          <p className="text-xs text-muted-foreground">Contratos finalizados</p>
        </CardContent>
      </Card>
    </div>
  )
}
