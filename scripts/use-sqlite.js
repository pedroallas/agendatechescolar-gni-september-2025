const fs = require("fs");
const path = require("path");

console.log("🔄 Convertendo para SQLite temporariamente...\n");

// Backup do schema original
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const schemaBackupPath = path.join(
  process.cwd(),
  "prisma",
  "schema.prisma.backup"
);

// Fazer backup se não existir
if (!fs.existsSync(schemaBackupPath)) {
  fs.copyFileSync(schemaPath, schemaBackupPath);
  console.log("✅ Backup do schema criado");
}

// Ler schema atual
let schema = fs.readFileSync(schemaPath, "utf8");

// Converter datasource para SQLite
schema = schema.replace(
  /datasource db \{[\s\S]*?\}/,
  `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
);

// Remover @db.Text que não é suportado no SQLite
schema = schema.replace(/@db\.Text/g, "");

// Salvar schema modificado
fs.writeFileSync(schemaPath, schema);

// Atualizar .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, "utf8");

  // Comentar DATABASE_URL atual e adicionar SQLite
  if (!env.includes("file:./dev.db")) {
    env = env.replace(
      /DATABASE_URL=".*"/,
      '# DATABASE_URL="$&"\nDATABASE_URL="file:./dev.db"'
    );
    fs.writeFileSync(envPath, env);
  }
}

console.log("✅ Convertido para SQLite!");
console.log("\n📋 Próximos passos:");
console.log("1. Execute: npx prisma migrate dev --name sqlite-init");
console.log("2. Execute: npm run seed");
console.log("3. Execute: npm run dev");
console.log("\n⚠️  Para voltar ao PostgreSQL, execute: npm run use-postgres");
