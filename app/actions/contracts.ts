"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function createContract(formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const contractData = {
    contract_number: formData.get("contract_number") as string,
    description: formData.get("description") as string,
    contractor: formData.get("contractor") as string,
    value: Number.parseFloat(formData.get("value") as string),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    status: formData.get("status") as string,
    category: formData.get("category") as string,
  }

  const { error } = await supabase.from("contracts").insert([contractData])

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function updateContract(id: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()

  const contractData = {
    contract_number: formData.get("contract_number") as string,
    description: formData.get("description") as string,
    contractor: formData.get("contractor") as string,
    value: Number.parseFloat(formData.get("value") as string),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    status: formData.get("status") as string,
    category: formData.get("category") as string,
  }

  const { error } = await supabase.from("contracts").update(contractData).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function deleteContract(id: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("contracts").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function clearAllContracts() {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("contracts").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function importContractsFromCSV(csvText: string) {
  const supabase = await getSupabaseServerClient()

  try {
    console.log("[v0] Starting CSV import, text length:", csvText.length)

    if (csvText.trim().startsWith("<!DOCTYPE") || csvText.trim().startsWith("<html")) {
      return {
        success: false,
        message:
          "O link fornecido retornou uma página HTML ao invés de CSV. Para Google Sheets, use: Arquivo → Compartilhar → Publicar na web → selecione 'Valores separados por vírgula (.csv)' e copie o link gerado.",
      }
    }

    const rows = parseCSV(csvText)

    if (rows.length < 4) {
      return {
        success: false,
        message: "Arquivo CSV inválido (precisa ter pelo menos 3 linhas: 2 linhas de cabeçalho + linha de dados)",
      }
    }

    const headers = rows[2]
    console.log("[v0] CSV Headers (linha 3):", headers)

    const validHeaders = headers.filter((h) => h && h.trim() !== "" && h !== "#REF!")
    if (validHeaders.length === 0) {
      return {
        success: false,
        message:
          "Cabeçalhos do CSV estão vazios ou inválidos. Verifique se a terceira linha contém os nomes das colunas (CATEGORIA, Nº GMS, Nº CONTRATO UENP, MODALIDADE, OBJETO, CONTRATADA, VALOR, INÍCIO DA VIGÊNCIA, FIM DA VIGÊNCIA, STATUS, etc.)",
      }
    }

    const columnMap = detectColumnMapping(headers)
    console.log("[v0] Detected column mapping:", columnMap)

    const contracts = []
    const errors = []

    for (let i = 3; i < rows.length; i++) {
      const values = rows[i]

      if (values.length < 3 || values.every((v) => !v || v.trim() === "")) {
        console.log(`[v0] Skipping empty line ${i + 1}`)
        continue
      }

      try {
        const contract: any = {
          contract_number: (values[columnMap.contract_number] || `IMPORT-${Date.now()}-${i}`).substring(0, 200),
          description: (values[columnMap.description] || values[columnMap.object] || "Sem descrição").substring(
            0,
            1000,
          ),
          contractor: (values[columnMap.contractor] || "Não informado").substring(0, 500),
          value: parseValue(values[columnMap.value]),
          start_date: formatDate(values[columnMap.start_date]),
          end_date: formatDate(values[columnMap.end_date]),
          status: normalizeStatus(values[columnMap.status]),
          category: values[columnMap.category]?.substring(0, 200) || null,
          gms_number: values[columnMap.gms_number]?.substring(0, 200) || null,
          modality: values[columnMap.modality]?.substring(0, 200) || null,
          process_number: values[columnMap.process_number]?.substring(0, 200) || null,
          manager_name: values[columnMap.manager_name]?.substring(0, 500) || null,
          manager_contact: values[columnMap.manager_contact]?.substring(0, 500) || null,
          manager_appointment: values[columnMap.manager_appointment]?.substring(0, 500) || null,
          inspector_name: values[columnMap.inspector_name]?.substring(0, 500) || null,
          inspector_contact: values[columnMap.inspector_contact]?.substring(0, 500) || null,
          inspector_appointment: values[columnMap.inspector_appointment]?.substring(0, 500) || null,
        }

        console.log(`[v0] Parsed contract ${i}:`, {
          number: contract.contract_number,
          contractor: contract.contractor,
          value: contract.value,
          manager: contract.manager_name,
          inspector: contract.inspector_name,
        })

        contracts.push(contract)
      } catch (error) {
        errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
      }
    }

    if (contracts.length === 0) {
      return {
        success: false,
        message: "Nenhum contrato válido encontrado no arquivo",
        errors: errors.length > 0 ? errors.join("; ") : undefined,
      }
    }

    console.log(`[v0] Attempting to insert ${contracts.length} contracts`)

    const { error: batchError } = await supabase.from("contracts").insert(contracts)

    if (!batchError) {
      revalidatePath("/")
      return {
        success: true,
        message: "Contratos importados com sucesso!",
        imported: contracts.length,
      }
    }

    console.log("[v0] Batch insert failed, trying individual inserts:", batchError.message)
    let successCount = 0
    const insertErrors = []

    for (let i = 0; i < contracts.length; i++) {
      const { error } = await supabase.from("contracts").insert([contracts[i]])

      if (error) {
        console.error(`[v0] Error inserting contract ${i}:`, error.message)
        insertErrors.push(`Contrato ${contracts[i].contract_number}: ${error.message}`)
      } else {
        successCount++
      }
    }

    revalidatePath("/")

    if (insertErrors.length > 0) {
      return {
        success: successCount > 0,
        message: `${successCount} contratos importados. ${insertErrors.length} erros encontrados.`,
        imported: successCount,
        errors: insertErrors.slice(0, 5).join("; ") + (insertErrors.length > 5 ? "..." : ""),
      }
    }

    return {
      success: true,
      message: "Contratos importados com sucesso!",
      imported: successCount,
    }
  } catch (error) {
    console.error("[v0] CSV import error:", error)
    return {
      success: false,
      message: `Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    }
  }
}

function detectColumnMapping(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {
    contract_number: -1,
    description: -1,
    object: -1,
    contractor: -1,
    value: -1,
    start_date: -1,
    end_date: -1,
    status: -1,
    category: -1,
    gms_number: -1,
    modality: -1,
    process_number: -1,
    manager_name: -1,
    manager_contact: -1,
    manager_appointment: -1,
    inspector_name: -1,
    inspector_contact: -1,
    inspector_appointment: -1,
  }

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim()

    if (normalized === "categoria") map.category = index
    else if (normalized === "nº gms" || normalized === "n° gms") map.gms_number = index
    else if (normalized === "nº contrato uenp" || normalized === "n° contrato uenp") map.contract_number = index
    else if (normalized === "modalidade") map.modality = index
    else if (normalized === "objeto") map.object = index
    else if (normalized === "contratada") map.contractor = index
    else if (normalized === "valor") map.value = index
    else if (normalized === "início da vigência" || normalized === "inicio da vigencia") map.start_date = index
    else if (normalized === "fim da vigência" || normalized === "fim da vigencia") map.end_date = index
    else if (normalized === "status") map.status = index
    else if (normalized === "processo") map.process_number = index
    else if (normalized === "gestor do contrato") map.manager_name = index
    else if (normalized === "fiscal do contrato") map.inspector_name = index
    else if (normalized.includes("contrato") && normalized.includes("n")) map.contract_number = index
    else if (normalized.includes("descrição") || normalized.includes("descricao")) map.description = index
    else if (normalized.includes("empresa") || normalized.includes("fornecedor")) map.contractor = index
  })

  // Track which "Contato" and "Nomeação" columns we've assigned
  let managerContactFound = false
  let managerAppointmentFound = false

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim()

    if (normalized === "contato") {
      // First "Contato" after manager name is manager contact
      if (map.manager_name !== -1 && index > map.manager_name && !managerContactFound) {
        map.manager_contact = index
        managerContactFound = true
      }
      // Second "Contato" (or first if no manager) is inspector contact
      else if (map.inspector_name !== -1 && index > map.inspector_name) {
        map.inspector_contact = index
      }
    } else if (normalized === "nomeação" || normalized === "nomeacao") {
      // First "Nomeação" after manager name is manager appointment
      if (map.manager_name !== -1 && index > map.manager_name && !managerAppointmentFound) {
        map.manager_appointment = index
        managerAppointmentFound = true
      }
      // Second "Nomeação" (or first if no manager) is inspector appointment
      else if (map.inspector_name !== -1 && index > map.inspector_name) {
        map.inspector_appointment = index
      }
    }
  })

  console.log("[v0] Column mapping:", {
    category: headers[map.category],
    gms_number: headers[map.gms_number],
    contract_number: headers[map.contract_number],
    object: headers[map.object],
    contractor: headers[map.contractor],
    value: headers[map.value],
    start_date: headers[map.start_date],
    end_date: headers[map.end_date],
    status: headers[map.status],
    manager_name: headers[map.manager_name],
    manager_contact: headers[map.manager_contact],
    manager_appointment: headers[map.manager_appointment],
    inspector_name: headers[map.inspector_name],
    inspector_contact: headers[map.inspector_contact],
    inspector_appointment: headers[map.inspector_appointment],
  })

  return map
}

function parseValue(valueStr: string): number {
  if (!valueStr) return 0

  const cleaned = valueStr.replace(/[R$\s]/g, "")

  if (cleaned.includes(",")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".")
    return Number.parseFloat(normalized) || 0
  }

  const normalized = cleaned.replace(/,/g, "")
  return Number.parseFloat(normalized) || 0
}

function normalizeStatus(status: string): string {
  if (!status) return "Ativo"

  const normalized = status.trim().toLowerCase()

  const statusMap: Record<string, string> = {
    ativo: "Ativo",
    active: "Ativo",
    concluido: "Concluído",
    concluído: "Concluído",
    completed: "Concluído",
    finalizado: "Concluído",
    cancelado: "Cancelado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
    "em analise": "Em Análise",
    "em análise": "Em Análise",
    analysis: "Em Análise",
    suspenso: "Suspenso",
    suspended: "Suspenso",
    renovado: "Renovado",
    renewed: "Renovado",
    vencido: "Vencido",
    expired: "Vencido",
  }

  return statusMap[normalized] || "Ativo"
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0]

  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0]
  }

  return new Date().toISOString().split("T")[0]
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ""
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim())
      currentField = ""
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++
      }
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim())
        if (currentRow.some((field) => field !== "")) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ""
      }
    } else {
      currentField += char
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((field) => field !== "")) {
      rows.push(currentRow)
    }
  }

  return rows
}
