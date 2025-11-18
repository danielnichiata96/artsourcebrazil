-- Migration: Initial Schema for Jobs System
-- Created: 2025-01-XX
-- Description: Creates all tables and relationships for the jobs aggregation system

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE location_scope_type AS ENUM (
  'remote-brazil',
  'remote-latam',
  'remote-worldwide',
  'hybrid',
  'onsite'
);

CREATE TYPE contract_type_enum AS ENUM (
  'CLT',
  'PJ',
  'B2B',
  'Freelance',
  'Estágio',
  'Internship'
);

CREATE TYPE job_status_enum AS ENUM (
  'ativa',
  'inativa',
  'rascunho'
);

CREATE TYPE job_source_enum AS ENUM (
  'greenhouse',
  'ashby',
  'lever',
  'manual'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,              -- 'Game Dev', '3D', 'Animation', 'Design', 'VFX'
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_name ON categories(name);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,              -- 'Unity', 'TypeScript', '3D', etc.
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

-- Jobs table (main table)
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,                    -- Ex: 'WIL-998002'
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  apply_link TEXT NOT NULL,
  date_posted DATE NOT NULL,
  location_scope TEXT NOT NULL,           -- Stored as TEXT (can use enum later)
  contract_type TEXT,                     -- Stored as TEXT (can use enum later)
  status TEXT DEFAULT 'ativa',            -- Stored as TEXT (can use enum later)
  source TEXT NOT NULL,                   -- Stored as TEXT (can use enum later)
  company_logo_url TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT,                   -- 'BRL', 'USD', 'EUR'
  location_detail TEXT,
  location_country_code VARCHAR(2),  -- VARCHAR accepts size modifier, TEXT doesn't
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_location_scope CHECK (location_scope IN (
    'remote-brazil', 'remote-latam', 'remote-worldwide', 'hybrid', 'onsite'
  )),
  CONSTRAINT valid_status CHECK (status IN ('ativa', 'inativa', 'rascunho')),
  CONSTRAINT valid_source CHECK (source IN ('greenhouse', 'ashby', 'lever', 'manual')),
  CONSTRAINT valid_contract_type CHECK (contract_type IS NULL OR contract_type IN (
    'CLT', 'PJ', 'B2B', 'Freelance', 'Estágio', 'Internship'
  ))
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date_posted ON jobs(date_posted DESC);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_location_scope ON jobs(location_scope);

-- Job tags junction table (many-to-many)
CREATE TABLE job_tags (
  job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, tag_id)
);

CREATE INDEX idx_job_tags_job ON job_tags(job_id);
CREATE INDEX idx_job_tags_tag ON job_tags(tag_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for companies table
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for jobs table
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (used by scripts)
-- Note: Adjust these policies based on your security requirements

-- Companies: Allow all operations
CREATE POLICY "Allow all operations on companies"
  ON companies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Categories: Allow all operations
CREATE POLICY "Allow all operations on categories"
  ON categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tags: Allow all operations
CREATE POLICY "Allow all operations on tags"
  ON tags
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Jobs: Allow all operations
CREATE POLICY "Allow all operations on jobs"
  ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Job tags: Allow all operations
CREATE POLICY "Allow all operations on job_tags"
  ON job_tags
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- INITIAL DATA (Optional: Seed categories)
-- ============================================================================

INSERT INTO categories (name, description) VALUES
  ('Game Dev', 'Game development positions including engineering, QA, and technical roles'),
  ('3D', '3D art positions covering modeling, texturing, lighting, and 3D generalist roles'),
  ('Animation', 'Animation positions including 2D animation, character animation, and motion graphics'),
  ('Design', 'Design positions including UX/UI, graphic design, and product design'),
  ('VFX', 'Visual effects positions including real-time VFX, particle effects, and VFX Graph')
ON CONFLICT (name) DO NOTHING;

