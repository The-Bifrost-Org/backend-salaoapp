-- CreateTable
CREATE TABLE "imagens_galeria" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titulo" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'geral',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_galeria_pkey" PRIMARY KEY ("id")
);
