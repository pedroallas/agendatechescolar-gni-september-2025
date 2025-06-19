const fs = require("fs");
const path = require("path");

console.log("🔄 Voltando para PostgreSQL...\n");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const schemaBackupPath = path.join(
  process.cwd(),
  "prisma",
  "schema.prisma.backup"
);

// Restaurar backup se existir
if (fs.existsSync(schemaBackupPath)) {
  fs.copyFileSync(schemaBackupPath, schemaPath);
  console.log("✅ Schema PostgreSQL restaurado");
} else {
  console.log("⚠️  Backup não encontrado. Restaurando manualmente...");

  let schema = fs.readFileSync(schemaPath, "utf8");

  // Converter datasource para PostgreSQL
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );

  fs.writeFileSync(schemaPath, schema);
}

console.log("\n📋 Próximos passos:");
console.log("1. Configure DATABASE_URL no .env.local");
console.log("2. Execute: npx prisma generate");
console.log("3. Execute: npx prisma migrate dev");
console.log("\n💡 Veja /docs/DATABASE_SETUP.md para opções de banco de dados");
