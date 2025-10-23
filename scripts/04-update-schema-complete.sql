-- Drop existing table and recreate with complete schema
DROP TABLE IF EXISTS contracts CASCADE;

-- Create contracts table with all fields from UENP spreadsheet
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificação
  categoria VARCHAR(50),
  numero_gms VARCHAR(50),
  numero_contrato VARCHAR(100) NOT NULL,
  
  -- Licitação
  modalidade VARCHAR(100),
  modalidade_numero VARCHAR(50),
  
  -- Detalhes do Contrato
  objeto TEXT,
  contratada TEXT,
  valor DECIMAL(15, 2),
  
  -- Vigência
  inicio_vigencia DATE,
  fim_vigencia DATE,
  status VARCHAR(50) DEFAULT 'Ativo',
  
  -- Processo e Gestão
  processo VARCHAR(50),
  gestor_contrato VARCHAR(255),
  contato_gestor VARCHAR(255),
  nomeacao_gestor VARCHAR(100),
  fiscal_contrato VARCHAR(255),
  contato_fiscal VARCHAR(255),
  nomeacao_fiscal VARCHAR(100),
  
  -- Prorrogação
  previsao_prorrogacao VARCHAR(10),
  resposta_recebida VARCHAR(10),
  
  -- Alertas
  data_alerta_1 DATE,
  data_alerta_2 DATE,
  data_alerta_3 DATE,
  data_alerta_4 DATE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_contracts_numero_contrato ON contracts(numero_contrato);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_categoria ON contracts(categoria);
CREATE INDEX idx_contracts_fim_vigencia ON contracts(fim_vigencia);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read contracts (transparency)
CREATE POLICY "Anyone can view contracts" ON contracts
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert contracts
CREATE POLICY "Authenticated users can insert contracts" ON contracts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update contracts
CREATE POLICY "Authenticated users can update contracts" ON contracts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete contracts
CREATE POLICY "Authenticated users can delete contracts" ON contracts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
