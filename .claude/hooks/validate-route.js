import { readFileSync } from 'fs';

const input = JSON.parse(readFileSync('/dev/stdin', 'utf8'));

const toolName = input.tool_name;
const filePath = input.tool_input?.file_path || '';
const content = input.tool_input?.content || '';

if (toolName === 'Write' && filePath.includes('apps/api/') && filePath.includes('routes/')) {
  if (!content.includes('validateBody') &&
      !content.includes('validate') &&
      !content.includes('400')) {
    console.error(`⚠️ Route sans validation : ${filePath}`);
    console.error('Ajouter un middleware de validation (validateBody) sur chaque route qui reçoit un body.');
    process.exit(1);
  }
}

process.exit(0);
