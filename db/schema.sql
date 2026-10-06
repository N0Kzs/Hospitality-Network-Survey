-- Phase 4 & 5 Schema for Hospitality Network Survey

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    company TEXT NOT NULL,
    respondent_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    email TEXT NOT NULL,
    org_role TEXT,
    investment_plan TEXT,
    pol_interest TEXT,
    follow_up TEXT,
    answers JSONB NOT NULL,
    email_status TEXT NOT NULL DEFAULT 'pending',
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_error TEXT,
    email_message_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_survey_company ON survey_responses(company);
CREATE INDEX IF NOT EXISTS idx_survey_email ON survey_responses(email);
CREATE INDEX IF NOT EXISTS idx_survey_submitted_at ON survey_responses(submitted_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    successful BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier, attempt_time DESC);
