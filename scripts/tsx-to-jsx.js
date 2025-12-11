#!/usr/bin/env node

/**
 * TSX to JSX Converter
 * 
 * Usage:
 *   node tsx-to-jsx.js <input.tsx> [output.jsx]
 * 
 * Example:
 *   node tsx-to-jsx.js src/pages/Home.tsx src/pages/Home.jsx
 * 
 * If no output file is specified, it will create one with .jsx extension
 */

const fs = require('fs');
const path = require('path');

function convertTsxToJsx(content) {
  let result = content;

  // Remove TypeScript-specific imports
  result = result.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\n?/g, '');
  
  // Remove type-only imports from mixed imports: import { type Foo, Bar } -> import { Bar }
  result = result.replace(/,?\s*type\s+\w+/g, '');
  
  // Remove interface declarations
  result = result.replace(/interface\s+\w+\s*(\{[\s\S]*?\n\})/g, '');
  
  // Remove type declarations
  result = result.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // Remove type annotations from function parameters: (param: Type) -> (param)
  result = result.replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=[\),=])/g, '');
  
  // Remove type annotations from arrow functions: (): Type => -> () =>
  result = result.replace(/\):\s*[\w<>[\]|&\s]+(?=\s*=>)/g, ')');
  
  // Remove type annotations from variables: const x: Type = -> const x =
  result = result.replace(/(const|let|var)\s+(\w+):\s*[\w<>[\]|&\s]+(?=\s*=)/g, '$1 $2');
  
  // Remove generic type parameters: <T>, <T, U>, etc.
  result = result.replace(/<[\w\s,]+>(?=\()/g, '');
  
  // Remove React.FC, React.FunctionComponent type annotations
  result = result.replace(/:\s*React\.(FC|FunctionComponent)(<[^>]+>)?/g, '');
  
  // Remove 'as Type' assertions
  result = result.replace(/\s+as\s+\w+(\[\])?/g, '');
  
  // Remove non-null assertions (!)
  result = result.replace(/(\w+)!/g, '$1');
  
  // Clean up empty lines left by removals
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Clean up empty import statements
  result = result.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');

  return result;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('TSX to JSX Converter');
  console.log('Usage: node tsx-to-jsx.js <input.tsx> [output.jsx]');
  console.log('Example: node tsx-to-jsx.js src/pages/Home.tsx');
  process.exit(0);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.tsx$/, '.jsx');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const converted = convertTsxToJsx(content);

fs.writeFileSync(outputFile, converted);
console.log(`Converted: ${inputFile} -> ${outputFile}`);
