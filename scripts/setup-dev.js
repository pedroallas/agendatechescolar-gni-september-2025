const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

console.log("🚀 Configurando ambiente de desenvolvimento...\n");

// Gerar NEXTAUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString("base64");
};

// Template do arquivo .env.local
const envTemplate = `# Database
DATABASE_URL="${
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/agendatech"
}"

# Authentication
JWT_SECRET="${generateSecret()}"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateSecret()}"

# Google OAuth (configure no Google Console)
# Siga as instruções em /docs/OAUTH_SETUP.md
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
`;

// Criar arquivo .env.local se não existir
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log("✅ Arquivo .env.local criado com sucesso!");
  console.log("📝 Lembre-se de configurar as credenciais do Google OAuth");
} else {
  console.log("⚠️  Arquivo .env.local já existe. Não foi sobrescrito.");
}

// Verificar se .env existe e avisar
const envProdPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envProdPath)) {
  console.log(
    "\n⚠️  Arquivo .env encontrado. Use .env.local para desenvolvimento."
  );
}

console.log("\n📋 Próximos passos:");
console.log("1. Configure sua DATABASE_URL no .env.local");
console.log(
  "2. (Opcional) Configure Google OAuth seguindo /docs/OAUTH_SETUP.md"
);
console.log("3. Execute: npm run dev");
console.log("\n✨ Configuração concluída!");
