CREATE TABLE IF NOT EXISTS "Lawyer" (
  "id"          TEXT          PRIMARY KEY,
  "name"        TEXT          NOT NULL,
  "specialties" TEXT[]        NOT NULL DEFAULT '{}',
  "location"    TEXT          NOT NULL,
  "phone"       TEXT,
  "email"       TEXT,
  "experience"  INT           NOT NULL DEFAULT 0,
  "bio"         TEXT          NOT NULL DEFAULT '',
  "languages"   TEXT[]        NOT NULL DEFAULT '{}',
  "fee"         TEXT,
  "available"   BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Lawyer_specialties_idx" ON "Lawyer" USING GIN ("specialties");
