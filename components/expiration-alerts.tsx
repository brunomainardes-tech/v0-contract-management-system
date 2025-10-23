"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, CheckCircle2, XCircle } from "lucide-react"
import type { Contract } from "@/lib/types"

interface ExpirationAlertsProps {
  contracts: Contract[]
}

function calculateDaysUntilExpiration(endDate: string): number {
  const today = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getContractsExpiringInDays(contracts: Contract[], days: number): Contract[] {
  return contracts.filter((contract) => {
    if (contract.status !== "Ativo" && contract.status !== "Em Execução") return false
    const daysUntil = calculateDaysUntilExpiration(contract.end_date)
    return daysUntil > 0 && daysUntil <= days
  })
}

export function ExpirationAlerts({ contracts }: ExpirationAlertsProps) {
  const expiring90 = getContractsExpiringInDays(contracts, 90)
  const expiring60 = getContractsExpiringInDays(contracts, 60)
  const expiring45 = getContractsExpiringInDays(contracts, 45)

  const alerts = [
    {
      title: "Vencem em 90 dias",
      description: "Contratos próximos ao vencimento",
      contracts: expiring90,
      color: "bg-yellow-50 border-yellow-200",
      iconColor: "text-yellow-600",
      badgeColor: "bg-yellow-100 text-yellow-800",
      icon: Calendar,
    },
    {
      title: "Vencem em 60 dias",
      description: "Atenção necessária",
      contracts: expiring60,
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
      badgeColor: "bg-orange-100 text-orange-800",
      icon: AlertTriangle,
    },
    {
      title: "Vencem em 45 dias",
      description: "Ação urgente necessária",
      contracts: expiring45,
      color: "bg-red-50 border-red-200",
      iconColor: "text-red-600",
      badgeColor: "bg-red-100 text-red-800",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          Alertas de Vencimento
        </h2>
        <p className="text-gray-600 mt-1">Contratos que requerem atenção nos próximos meses</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {alerts.map((alert) => {
          const Icon = alert.icon
          return (
            <Card key={alert.title} className={`${alert.color} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${alert.iconColor}`} />
                  <Badge className={alert.badgeColor}>{alert.contracts.length} contratos</Badge>
                </div>
                <CardTitle className="text-lg">{alert.title}</CardTitle>
                <CardDescription>{alert.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {alert.contracts.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhum contrato neste período</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alert.contracts.map((contract) => {
                      const daysLeft = calculateDaysUntilExpiration(contract.end_date)
                      const canExtend = contract.extension_forecast && contract.extension_forecast.trim() !== ""

                      return (
                        <div key={contract.id} className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{contract.contract_number}</p>
                              <p className="text-xs text-gray-600 truncate">{contract.contractor}</p>
                            </div>
                            {canExtend ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" title="Pode prorrogar" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" title="Não pode prorrogar" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              Vence: {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-gray-500">Prorrogação:</span>
                            <span className={canExtend ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                              {canExtend ? "Sim" : "Não"}
                            </span>
                          </div>

                          {canExtend && (
                            <div className="text-xs text-gray-500">
                              Previsão: {new Date(contract.extension_forecast).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
