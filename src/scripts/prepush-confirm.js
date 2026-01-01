#!/usr/bin/env node
// Simple interactive confirmation used by git pre-push hook
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Confirm push to GitHub? (y/N): ', (answer) => {
  rl.close();
  const a = String(answer || '').trim().toLowerCase();
  if (a === 'y' || a === 'yes') {
    process.exit(0);
  }
  console.log('Push aborted by user.');
  process.exit(1);
});
