"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, LinkIcon, RefreshCw } from "lucide-react"
import { importContractsFromCSV, clearAllContracts } from "@/app/actions/contracts"

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null)
  const [csvUrl, setCsvUrl] = useState("")
  const [csvText, setCsvText] = useState("")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; imported?: number } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResult(null)
    } else {
      setResult({ success: false, message: "Por favor, selecione um arquivo CSV válido" })
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const response = await importContractsFromCSV(text)

      setResult(response)
      if (response.success) {
        setFile(null)
        const fileInput = document.getElementById("csv-file") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao processar o arquivo. Verifique o formato do CSV.",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleImportFromUrl = async () => {
    if (!csvUrl.trim()) {
      setResult({ success: false, message: "Por favor, insira uma URL válida" })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error("Não foi possível acessar a URL fornecida")
      }

      const text = await response.text()
      const importResponse = await importContractsFromCSV(text)

      setResult(importResponse)
      if (importResponse.success) {
        // Save URL to localStorage for future syncs
        localStorage.setItem("contractsCsvUrl", csvUrl)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao buscar dados da URL. Verifique se a URL está correta e acessível.",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleImportFromText = async () => {
    if (!csvText.trim()) {
      setResult({ success: false, message: "Por favor, cole os dados CSV no campo de texto" })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const importResponse = await importContractsFromCSV(csvText)
      setResult(importResponse)

      if (importResponse.success) {
        setCsvText("")
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao processar os dados. Verifique o formato do CSV.",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    setResult(null)

    try {
      const response = await clearAllContracts()

      if (response.error) {
        setResult({
          success: false,
          message: `Erro ao limpar contratos: ${response.error}`,
        })
      } else {
        setResult({
          success: true,
          message: "Todos os contratos foram removidos com sucesso!",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao limpar contratos. Tente novamente.",
      })
    } finally {
      setClearing(false)
      setShowClearConfirm(false)
    }
  }

  useState(() => {
    const savedUrl = localStorage.getItem("contractsCsvUrl")
    if (savedUrl) {
      setCsvUrl(savedUrl)
    }
  })

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Importar Contratos</h3>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={clearing || importing}
          >
            Limpar Todos
          </Button>
        </div>

        {showClearConfirm && (
          <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
            <p className="mb-3 text-sm font-medium text-destructive">
              Tem certeza que deseja remover TODOS os contratos? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={clearing}>
                {clearing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  "Sim, limpar tudo"
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(false)} disabled={clearing}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Importe contratos através de um arquivo CSV, uma planilha online ou cole diretamente os dados CSV no campo de
          texto.
        </p>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Importar via Texto
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="mr-2 h-4 w-4" />
              Sincronizar via URL
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload className="mr-2 h-4 w-4" />
              Upload de Arquivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-text">Dados CSV</Label>
              <textarea
                id="csv-text"
                className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                placeholder="Cole aqui os dados da planilha CSV...&#10;&#10;Exemplo:&#10;CATEGORIA,Nº GMS,Nº CONTRATO UENP,MODALIDADE,OBJETO,CONTRATADA,VALOR,INÍCIO DA VIGÊNCIA,FIM DA VIGÊNCIA,STATUS,PROCESSO,GESTOR DO CONTRATO,CONTATO,NOMEAÇÃO,FISCAL DO CONTRATO,CONTATO,NOMEAÇÃO&#10;LOCAÇÃO,650/2024,068/2023,INEX,Locação de imóvel...,EMPRESA XYZ,R$ 15.660,00,27/10/2023,30/10/2025,ATIVO,20.815.172-0,João Silva,joao@email.com,Port. 123,Maria Santos,maria@email.com,Port. 456"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                disabled={importing}
              />
              <p className="text-xs text-muted-foreground">
                Cole os dados da planilha diretamente aqui. Certifique-se de incluir o cabeçalho na primeira linha.
              </p>
            </div>
            <Button onClick={handleImportFromText} disabled={importing || !csvText.trim()} className="w-full">
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Dados
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-url">URL da Planilha CSV</Label>
              <div className="flex gap-2">
                <Input
                  id="csv-url"
                  type="url"
                  placeholder="https://exemplo.com/planilha.csv"
                  value={csvUrl}
                  onChange={(e) => setCsvUrl(e.target.value)}
                  disabled={importing}
                />
                <Button onClick={handleImportFromUrl} disabled={importing || !csvUrl.trim()}>
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sincronizar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cole o link público da sua planilha CSV. A URL será salva para sincronizações futuras.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="csv-file"
                className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-3 transition-colors hover:border-primary hover:bg-accent"
              >
                <Upload className="h-5 w-5" />
                <span className="text-sm font-medium">{file ? file.name : "Selecionar arquivo CSV"}</span>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={importing}
                />
              </label>

              {file && (
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {result && (
          <div
            className={`flex items-start gap-2 rounded-lg p-4 ${
              result.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
            }`}
          >
            {result.success ? (
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">{result.message}</p>
              {result.imported !== undefined && (
                <p className="text-sm opacity-90">{result.imported} contratos importados com sucesso</p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-muted p-4">
          <p className="mb-2 text-sm font-medium">Formato esperado do CSV:</p>
          <code className="block text-xs text-muted-foreground">
            Número do Contrato,Descrição,Fornecedor,Valor,Data de Início,Data de Término,Status
            <br />
            001/2025,Serviços de TI,Empresa XYZ,50000.00,01/01/2025,31/12/2025,Ativo
          </code>
        </div>
      </div>
    </Card>
  )
}
