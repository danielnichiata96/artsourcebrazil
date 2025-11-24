-- Job Drafts Table (Carrinho Abandonado + Aprovação Manual)
CREATE TABLE IF NOT EXISTS job_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info (para carrinho abandonado)
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  
  -- Job Data (JSONB para flexibilidade)
  draft_data JSONB NOT NULL,
  
  -- Status Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',              -- Preenchendo
    'pending_payment',    -- Clicou em "Publicar" mas não pagou
    'paid',               -- Pagou, aguardando aprovação
    'approved',           -- Aprovado pelo admin
    'published',          -- Publicado no site
    'rejected',           -- Rejeitado (precisa correções)
    'abandoned'           -- Abandonou (para email recovery)
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  
  -- Payment Info
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  paid_at TIMESTAMPTZ,
  amount_paid INTEGER, -- em centavos
  currency TEXT DEFAULT 'USD',
  coupon_code TEXT,
  
  -- Publishing Info
  published_job_id TEXT REFERENCES jobs(id),  -- TEXT to match jobs.id type
  published_at TIMESTAMPTZ,
  approved_by TEXT, -- Email do admin que aprovou
  approved_at TIMESTAMPTZ,
  
  -- Rejection Info
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_job_drafts_email ON job_drafts(email);
CREATE INDEX IF NOT EXISTS idx_job_drafts_status ON job_drafts(status);
CREATE INDEX IF NOT EXISTS idx_job_drafts_created ON job_drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_drafts_stripe_session ON job_drafts(stripe_session_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_job_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_drafts_updated_at
  BEFORE UPDATE ON job_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_job_drafts_updated_at();

-- RLS Policies (opcional, para segurança)
ALTER TABLE job_drafts ENABLE ROW LEVEL SECURITY;

-- Permitir leitura/escrita apenas para service role (backend)
CREATE POLICY "Service role can do anything" ON job_drafts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comentários para documentação
COMMENT ON TABLE job_drafts IS 'Rascunhos de vagas para fluxo form-first com carrinho abandonado e aprovação manual';
COMMENT ON COLUMN job_drafts.draft_data IS 'Dados da vaga em formato JSONB (título, descrição, categoria, etc)';
COMMENT ON COLUMN job_drafts.status IS 'Status do workflow: draft → pending_payment → paid → approved → published';
COMMENT ON COLUMN job_drafts.coupon_code IS 'Código de cupom usado (ex: LAUNCH2025, COMEBACK20)';
