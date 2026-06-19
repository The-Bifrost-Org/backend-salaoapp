-- CreateTable
CREATE TABLE "configuracao_salao" (
    "id" TEXT NOT NULL,
    "nomeSalao" TEXT NOT NULL DEFAULT 'SalãoApp',
    "logoUrl" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_salao_pkey" PRIMARY KEY ("id")
);
