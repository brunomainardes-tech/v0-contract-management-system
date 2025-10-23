-- Update column sizes to accommodate larger values
ALTER TABLE contracts 
  ALTER COLUMN status TYPE VARCHAR(100);

-- Remove the CHECK constraint and recreate it with more flexibility
ALTER TABLE contracts 
  DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Add a more flexible status constraint
ALTER TABLE contracts 
  ADD CONSTRAINT contracts_status_check 
  CHECK (status IN ('Ativo', 'Concluído', 'Cancelado', 'Em Análise', 'Suspenso', 'Renovado', 'Vencido'));
