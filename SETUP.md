# Configuração do Sistema de Contratos UENP

Este guia explica como configurar o sistema com Supabase.

## Pré-requisitos

1. Conta no Supabase (gratuita): https://supabase.com
2. Node.js instalado

## Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Escolha um nome (ex: "uenp-contratos")
4. Defina uma senha forte para o banco de dados
5. Escolha a região mais próxima (South America - São Paulo)
6. Clique em "Create new project"

## Passo 2: Executar Scripts SQL

1. No painel do Supabase, vá em "SQL Editor" no menu lateral
2. Clique em "New query"
3. **IMPORTANTE**: Execute o script `scripts/05-recreate-table-complete.sql`
   - Este script cria a tabela com TODAS as colunas necessárias
   - Se você já executou scripts anteriores, este script irá recriar a tabela corretamente
4. Copie e cole o conteúdo do arquivo e clique em "Run"
5. (Opcional) Execute `scripts/02-seed-sample-contracts.sql` para dados de exemplo

## Passo 3: Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em "Settings" > "API"
2. Copie os valores de:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon/public key** (chave pública)

3. No v0, adicione as variáveis de ambiente:
   - Clique em "Vars" no menu lateral do chat
   - Adicione:
     - `NEXT_PUBLIC_SUPABASE_URL` = [sua Project URL]
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [sua anon key]

## Passo 4: Criar Usuário Admin

1. No painel do Supabase, vá em "Authentication" > "Users"
2. Clique em "Add user" > "Create new user"
3. Preencha:
   - Email: admin@uenp.edu.br (ou outro email)
   - Password: [senha forte]
   - Auto Confirm User: ✓ (marque esta opção)
4. Clique em "Create user"

## Passo 5: Testar o Sistema

1. Acesse o preview do aplicativo no v0
2. Clique em "Admin" no canto superior direito
3. Faça login com as credenciais criadas
4. Teste criar, editar e excluir contratos

## Funcionalidades

### Modo Público (sem login)
- Visualizar todos os contratos
- Buscar e filtrar contratos
- Ver estatísticas gerais
- **Atualizações em tempo real** - mudanças aparecem automaticamente

### Modo Administrativo (com login)
- Todas as funcionalidades do modo público
- Criar novos contratos
- Editar contratos existentes
- Excluir contratos
- **Importar contratos via CSV** (upload de arquivo ou URL)
- **Sincronização automática** com planilhas online
- Gerenciamento completo

## Importação de Dados via CSV

### Opção 1: Upload de Arquivo
1. Faça login como administrador
2. Na seção "Importar Contratos", clique na aba "Upload de Arquivo"
3. Selecione seu arquivo CSV
4. Clique em "Importar"

### Opção 2: Sincronização via URL (Recomendado para Google Sheets)

**IMPORTANTE: Como obter o link correto do Google Sheets**

1. Abra sua planilha no Google Sheets
2. Vá em **Arquivo** → **Compartilhar** → **Publicar na web**
3. Na janela que abrir:
   - Em "Link", selecione a aba ou planilha que deseja publicar
   - Em "Formato", escolha **"Valores separados por vírgula (.csv)"** (NÃO escolha "Página da web")
4. Clique em "Publicar"
5. Copie o link gerado (deve terminar com `/export?format=csv`)
6. Cole este link no campo "URL da Planilha CSV" no sistema

**Exemplo de link correto:**
\`\`\`
https://docs.google.com/spreadsheets/d/e/2PACX-xxxxx/pub?output=csv
\`\`\`

**Depois de configurar:**
1. Faça login como administrador
2. Na seção "Importar Contratos", clique na aba "Sincronizar via URL"
3. Cole o link CSV obtido acima
4. Clique em "Sincronizar"
5. A URL será salva para sincronizações futuras

**Formato do CSV:**

O sistema detecta automaticamente as colunas da sua planilha. Colunas reconhecidas:
- Número do Contrato / Nº Contrato
- Descrição / Objeto
- Contratada / Empresa / Fornecedor
- Valor
- Início da Vigência / Data de Início
- Fim da Vigência / Data de Término
- Status / Situação
- Categoria
- Nº GMS
- Modalidade
- Processo
- Gestor do Contrato
- Fiscal do Contrato

**Exemplo:**
\`\`\`
Nº Contrato,Objeto,Contratada,Valor,Início da Vigência,Fim da Vigência,Status
001/2025,Serviços de TI,Empresa XYZ,R$ 50.000,00,01/01/2025,31/12/2025,Ativo
\`\`\`

## Atualizações em Tempo Real

O sistema usa Supabase Realtime para sincronização automática:
- Quando um administrador adiciona/edita/remove um contrato, todos os usuários veem a mudança instantaneamente
- Não é necessário recarregar a página
- Funciona tanto para usuários públicos quanto administradores
- As estatísticas do dashboard são atualizadas automaticamente

## Segurança

O sistema usa Row Level Security (RLS) do Supabase:
- **Leitura**: Qualquer pessoa pode visualizar contratos (transparência)
- **Escrita/Edição/Exclusão**: Apenas usuários autenticados

## Suporte

Para problemas ou dúvidas:
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que os scripts SQL foram executados (especialmente o `05-recreate-table-complete.sql`)
3. Verifique se o usuário admin foi criado e confirmado
4. Para problemas com atualizações em tempo real, verifique se o Realtime está habilitado no Supabase (Settings > API > Realtime)
5. **Para problemas com importação de CSV:**
   - Certifique-se de usar o link de exportação CSV do Google Sheets (não o link de visualização)
   - O link deve terminar com `/export?format=csv` ou `/pub?output=csv`
   - Se aparecer erro sobre colunas não encontradas, execute o script `05-recreate-table-complete.sql`
