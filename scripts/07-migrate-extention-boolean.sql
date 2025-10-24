-- Migrate prorrogação from date to boolean

-- Add new boolean column
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS can_extend BOOLEAN DEFAULT FALSE;

-- If legacy columns exist, derive can_extend from them
DO $$
BEGIN
  -- From extension_forecast (DATE): true when not null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'extension_forecast'
  ) THEN
    UPDATE contracts SET can_extend = TRUE WHERE extension_forecast IS NOT NULL;
  END IF;

  -- From previsao_prorrogacao (VARCHAR): true when not empty
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'previsao_prorrogacao'
  ) THEN
    UPDATE contracts SET can_extend = TRUE WHERE COALESCE(TRIM(previsao_prorrogacao), '') <> '';
  END IF;

  -- From resposta_recebida (VARCHAR): true when SIM/YES/TRUE
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'resposta_recebida'
  ) THEN
    UPDATE contracts 
    SET can_extend = TRUE 
    WHERE LOWER(COALESCE(resposta_recebida, '')) IN ('sim','yes','true','1');
  END IF;
END $$;

-- Optionally drop legacy columns no longer used
ALTER TABLE contracts DROP COLUMN IF EXISTS extension_forecast;
-- Note: Keep previsao_prorrogacao/resposta_recebida if still needed elsewhere

COMMENT ON COLUMN contracts.can_extend IS 'Prorrogação habilitada: TRUE para Sim, FALSE para Não';
