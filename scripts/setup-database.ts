import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("🔄 Verificando conexão com o banco de dados...")
    await prisma.$connect()
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!")

    console.log("🔄 Executando migrações do Prisma...")
    await execAsync("npx prisma migrate dev --name init")
    console.log("✅ Migrações executadas com sucesso!")

    console.log("🔄 Gerando cliente Prisma...")
    await execAsync("npx prisma generate")
    console.log("✅ Cliente Prisma gerado com sucesso!")

    console.log("🎉 Configuração do banco de dados concluída!")
  } catch (error) {
    console.error("❌ Erro durante a configuração do banco de dados:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
