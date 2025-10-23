-- Add detailed fields for contract manager and inspector
-- This adds separate fields for name, contact, and appointment

ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS manager_name VARCHAR(500),
  ADD COLUMN IF NOT EXISTS manager_contact VARCHAR(200),
  ADD COLUMN IF NOT EXISTS manager_appointment VARCHAR(200),
  ADD COLUMN IF NOT EXISTS inspector_name VARCHAR(500),
  ADD COLUMN IF NOT EXISTS inspector_contact VARCHAR(200),
  ADD COLUMN IF NOT EXISTS inspector_appointment VARCHAR(200),
  ADD COLUMN IF NOT EXISTS extension_forecast DATE;

-- Drop old columns if they exist
ALTER TABLE contracts 
  DROP COLUMN IF EXISTS contract_manager,
  DROP COLUMN IF EXISTS contract_inspector;

COMMENT ON COLUMN contracts.manager_name IS 'Nome do gestor do contrato';
COMMENT ON COLUMN contracts.manager_contact IS 'Contato do gestor (email ou telefone)';
COMMENT ON COLUMN contracts.manager_appointment IS 'Portaria de nomeação do gestor';
COMMENT ON COLUMN contracts.inspector_name IS 'Nome do fiscal do contrato';
COMMENT ON COLUMN contracts.inspector_contact IS 'Contato do fiscal (email ou telefone)';
COMMENT ON COLUMN contracts.inspector_appointment IS 'Portaria de nomeação do fiscal';
COMMENT ON COLUMN contracts.extension_forecast IS 'Previsão de prorrogação do contrato';
