-- Drop existing table and recreate with complete structure
-- This ensures a clean slate with all required columns

DROP TABLE IF EXISTS contracts CASCADE;

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic contract information
  contract_number VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  contractor VARCHAR(500) NOT NULL,
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(100) NOT NULL DEFAULT 'Ativo',
  
  -- Additional UENP fields
  category VARCHAR(200),
  gms_number VARCHAR(200),
  modality VARCHAR(200),
  process_number VARCHAR(200),
  contract_manager VARCHAR(500),
  contract_inspector VARCHAR(500),
  alert_30_days DATE,
  alert_60_days DATE,
  alert_90_days DATE,
  observations TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contracts_number ON contracts(contract_number);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_contractor ON contracts(contractor);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view contracts (transparency)
CREATE POLICY "Anyone can view contracts" ON contracts
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert contracts" ON contracts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update
CREATE POLICY "Authenticated users can update contracts" ON contracts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete
CREATE POLICY "Authenticated users can delete contracts" ON contracts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;

COMMENT ON TABLE contracts IS 'UENP Contract Management and Transparency System';
