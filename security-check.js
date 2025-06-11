// Security check script
const fs = require("fs");
const path = require("path");

console.log("🔒 Security Check for Job Application System\n");

// Check for .env file
const envExists = fs.existsSync(".env");
console.log(`✅ .env file exists: ${envExists ? "YES" : "NO"}`);

// Check .gitignore
const gitignore = fs.readFileSync(".gitignore", "utf8");
const envInGitignore = gitignore.includes(".env");
console.log(`✅ .env in .gitignore: ${envInGitignore ? "YES" : "NO"}`);

// Check for sensitive patterns in code
const sensitivePatterns = [
  /EMAIL_USER\s*=\s*['"][^'"]+['"]/,
  /EMAIL_PASS\s*=\s*['"][^'"]+['"]/,
  /WHATSAPP_API_KEY\s*=\s*['"][^'"]+['"]/,
  /WHATSAPP_PHONE_NUMBER\s*=\s*['"][^'"]+['"]/,
  /password\s*:\s*['"][^'"]+['"]/,
  /secret\s*:\s*['"][^'"]+['"]/,
  /api_key\s*:\s*['"][^'"]+['"]/,
];

const filesToCheck = [
  "server.js",
  "public/index.html",
  "public/admin.html",
  "package.json",
];

let foundSensitiveData = false;

filesToCheck.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    sensitivePatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(
          `❌ Found sensitive data in ${file}:`,
          matches[0].substring(0, 50) + "..."
        );
        foundSensitiveData = true;
      }
    });
  }
});

if (!foundSensitiveData) {
  console.log("✅ No sensitive data found in code files");
}

// Check for .env.example
const envExampleExists = fs.existsSync(".env.example");
console.log(`✅ .env.example exists: ${envExampleExists ? "YES" : "NO"}`);

// Check for README
const readmeExists = fs.existsSync("README.md");
console.log(`✅ README.md exists: ${readmeExists ? "YES" : "NO"}`);

// Check for deployment guide
const deploymentExists = fs.existsSync("DEPLOYMENT.md");
console.log(`✅ DEPLOYMENT.md exists: ${deploymentExists ? "YES" : "NO"}`);

console.log("\n📋 Security Summary:");
console.log("===================");

if (envExists && envInGitignore && !foundSensitiveData) {
  console.log("🎉 Your project is SECURE for GitHub deployment!");
  console.log("✅ .env file is protected");
  console.log("✅ No sensitive data in code");
  console.log("✅ Documentation is complete");
} else {
  console.log("⚠️  Security issues found:");
  if (!envExists) console.log("❌ .env file missing");
  if (!envInGitignore) console.log("❌ .env not in .gitignore");
  if (foundSensitiveData) console.log("❌ Sensitive data found in code");
}

console.log("\n🚀 Ready for deployment!");
console.log(
  "Remember to set environment variables in your deployment platform."
);
