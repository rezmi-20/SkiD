-- Landing Content Management: FAQs
CREATE TABLE IF NOT EXISTS landing_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic varchar(100) NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  takeaway text,
  language varchar(10) NOT NULL DEFAULT 'EN',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS landing_faqs_lang_active_idx 
  ON landing_faqs(language, is_active, sort_order);

-- Landing Content Management: Testimonials
CREATE TABLE IF NOT EXISTS landing_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(150) NOT NULL,
  role varchar(100) NOT NULL,
  trade varchar(100) NOT NULL,
  jobs varchar(50) NOT NULL DEFAULT 'Verified Job',
  quote text NOT NULL,
  language varchar(10) NOT NULL DEFAULT 'EN',
  avatar_bg varchar(150) DEFAULT 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS landing_testimonials_lang_active_idx 
  ON landing_testimonials(language, is_active, sort_order);

-- Super Admin Court & Legal Evidentiary Disclosures
CREATE TABLE IF NOT EXISTS court_evidence_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id),
  case_number varchar(120) NOT NULL,
  court_name varchar(200) NOT NULL,
  purpose text,
  authorized_by_admin_id uuid NOT NULL REFERENCES admin_employees(id),
  evidence_hash varchar(128) NOT NULL,
  evidence_manifest json NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS court_evidence_contract_idx 
  ON court_evidence_records(contract_id, created_at);

CREATE INDEX IF NOT EXISTS court_evidence_case_idx 
  ON court_evidence_records(case_number);
