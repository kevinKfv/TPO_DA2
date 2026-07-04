const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Remove SQL Server specific types
content = content.replace(/@db\.\w+(\([^)]+\))?/g, '');

// Remove map from @default
content = content.replace(/@default\(([^,]+),\s*map:\s*"[^"]+"\)/g, '@default($1)');

// Change provider to postgresql
content = content.replace(/provider\s*=\s*"sqlserver"/, 'provider = "postgresql"');

fs.writeFileSync(schemaPath, content);
console.log('Schema cleaned and provider set to postgresql.');
