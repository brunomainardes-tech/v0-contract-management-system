import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ContractsTable } from "@/components/contracts-table"
import { AuthButton } from "@/components/auth-button"
import { CSVImport } from "@/components/csv-import"
import { DashboardStats } from "@/components/dashboard-stats"
import { AddContractDialog } from "@/components/add-contract-dialog"
import { FileText } from "lucide-react"
import type { Contract } from "@/lib/types"

export default async function Home() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  console.log("[v0] Page: User authenticated:", isAuthenticated, user?.email)

  const { data: contracts } = await supabase.from("contracts").select("*").order("end_date", { ascending: true })

  const contractsList = (contracts || []) as Contract[]

  const stats = {
    totalContracts: contractsList.length,
    totalValue: contractsList.reduce((sum, c) => sum + Number(c.value || 0), 0),
    activeContracts: contractsList.filter((c) => c.status === "Ativo" || c.status === "Em Execução").length,
    completedContracts: contractsList.filter((c) => c.status === "Concluído" || c.status === "Encerrado").length,
  }

  console.log("[v0] Page: Stats calculated:", stats)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Contratos UENP</h1>
                <p className="text-sm text-gray-600">Portal de Transparência</p>
              </div>
            </div>
            <AuthButton isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {isAuthenticated && (
            <section>
              <DashboardStats stats={stats} />
            </section>
          )}

          {isAuthenticated && (
            <section>
              <CSVImport />
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Contratos Administrativos
                </h2>
                <p className="text-gray-600 mt-1">
                  Consulte todos os contratos administrativos da UENP. Use os filtros abaixo para encontrar contratos
                  específicos.
                </p>
              </div>
              {isAuthenticated && <AddContractDialog />}
            </div>
            <ContractsTable contracts={contractsList} isAuthenticated={isAuthenticated} />
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600">© 2025 UENP - Universidade Estadual do Norte do Paraná</p>
            <p className="text-sm text-gray-600">Sistema de Gestão e Transparência de Contratos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
