-- Run this once against your Neon (or any Postgres) database.
-- Required: pgvector extension must be available (it is on Neon free tier).

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Conversations
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id"        TEXT        PRIMARY KEY,
  "title"     TEXT        NOT NULL DEFAULT 'New Chat',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Messages
CREATE TABLE IF NOT EXISTS "Message" (
  "id"             TEXT        PRIMARY KEY,
  "role"           TEXT        NOT NULL,
  "content"        TEXT        NOT NULL,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "conversationId" TEXT        NOT NULL
    REFERENCES "Conversation"("id") ON DELETE CASCADE
);

-- 4. Documents
CREATE TABLE IF NOT EXISTS "Document" (
  "id"        TEXT        PRIMARY KEY,
  "title"     TEXT        NOT NULL,
  "fileType"  TEXT        NOT NULL DEFAULT 'text',
  "status"    TEXT        NOT NULL DEFAULT 'processing',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DocumentChunks (768-dim Gemini embeddings)
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
  "id"          TEXT        PRIMARY KEY,
  "content"     TEXT        NOT NULL,
  "chunkIndex"  INT         NOT NULL,
  "totalChunks" INT         NOT NULL,
  "embedding"   vector(768),
  "documentId"  TEXT        NOT NULL
    REFERENCES "Document"("id") ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. HNSW index for fast cosine similarity search
--    ef_construction=128, m=16 are good defaults for most workloads.
CREATE INDEX IF NOT EXISTS "DocumentChunk_embedding_hnsw_idx"
  ON "DocumentChunk"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 128);

-- 7. Index on conversationId for fast message lookups
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx"
  ON "Message" ("conversationId");

-- 8. Index on documentId for fast chunk lookups
CREATE INDEX IF NOT EXISTS "DocumentChunk_documentId_idx"
  ON "DocumentChunk" ("documentId");
