"use client"

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
import { LogIn, LogOut } from "lucide-react"
import { login, logout, signup } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"

interface AuthButtonProps {
  isAuthenticated: boolean
}

export function AuthButton({ isAuthenticated }: AuthButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const { toast } = useToast()

  async function handleLogin(formData: FormData) {
    setLoading(true)
    try {
      await login(formData)
    } catch (error: any) {
      setLoading(false)
      if (error?.message?.includes("NEXT_REDIRECT")) {
        setOpen(false)
        toast({
          title: "Login realizado",
          description: "Bem-vindo ao painel administrativo!",
        })
      } else {
        toast({
          title: "Erro ao fazer login",
          description: error?.message || "Erro desconhecido",
          variant: "destructive",
        })
      }
    }
  }

  async function handleSignup(formData: FormData) {
    setLoading(true)
    const result = await signup(formData)
    setLoading(false)

    if (result?.error) {
      toast({
        title: "Erro ao criar conta",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta e depois faça login.",
      })
      setMode("login")
    }
  }

  async function handleLogout() {
    setLoading(true)
    try {
      await logout()
    } catch (error: any) {
      setLoading(false)
      if (error?.message?.includes("NEXT_REDIRECT")) {
        toast({
          title: "Logout realizado",
          description: "Você saiu do painel administrativo.",
        })
      }
    }
  }

  if (isAuthenticated) {
    return (
      <Button onClick={handleLogout} variant="outline" size="sm" disabled={loading}>
        <LogOut className="mr-2 h-4 w-4" />
        {loading ? "Saindo..." : "Sair"}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Acesso Administrativo" : "Criar Conta Admin"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Entre com suas credenciais para gerenciar contratos"
              : "Crie uma conta de administrador para gerenciar contratos"}
          </DialogDescription>
        </DialogHeader>
        <form action={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@uenp.edu.br" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
            {mode === "signup" && <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Entrando..."
                : "Criando conta..."
              : mode === "login"
                ? "Entrar"
                : "Criar Conta"}
          </Button>
        </form>
        <div className="text-center text-sm">
          {mode === "login" ? (
            <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">
              Não tem conta? Criar conta admin
            </button>
          ) : (
            <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">
              Já tem conta? Fazer login
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
