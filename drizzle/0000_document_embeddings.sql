-- Drop the existing table if it exists
DROP TABLE IF EXISTS "DocumentEmbedding";

-- Create the table with the new schema
CREATE TABLE "DocumentEmbedding" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "documentId" uuid NOT NULL,
    "offset" integer NOT NULL,
    "chunk" text NOT NULL,
    "embedding" vector(1536) NOT NULL
);

-- Create indexes
CREATE INDEX "document_id_idx" ON "DocumentEmbedding" ("documentId");
CREATE INDEX "embedding_idx" ON "DocumentEmbedding" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
