#!/usr/bin/env node

import OpenAI from 'openai';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = path.join(process.env.HOME, '.config', 'codex');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Load API key from config file or environment
function loadApiKey() {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config.apiKey;
    } catch (error) {
      return null;
    }
  }
  
  return null;
}

// Save API key to config file
function saveApiKey(apiKey) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey }, null, 2));
    fs.chmodSync(CONFIG_FILE, 0o600); // Make file readable only by owner
    console.log('✅ API key saved successfully!\n');
    console.log('You can now use: codex "your prompt here"\n');
  } catch (error) {
    console.error('❌ Error saving API key:', error.message);
    process.exit(1);
  }
}

// Interactive login
async function login() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('🔐 OpenAI API Key Setup\n');
    console.log('Get your API key from: https://platform.openai.com/api-keys\n');
    
    rl.question('Enter your OpenAI API key: ', (apiKey) => {
      rl.close();
      apiKey = apiKey.trim();
      
      if (!apiKey) {
        console.error('❌ No API key provided\n');
        process.exit(1);
      }
      
      saveApiKey(apiKey);
      resolve();
    });
  });
}

const apiKey = loadApiKey();

let openai;
if (apiKey) {
  openai = new OpenAI({ apiKey });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

async function runCodex(prompt) {
  if (!openai) {
    console.error('❌ Error: No API key configured\n');
    console.error('Please run: codex login\n');
    process.exit(1);
  }

  try {
    console.log('\n🤖 Thinking...\n');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an expert coding assistant. Provide clear, concise code solutions with explanations." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    console.log('💡 Response:\n');
    console.log(response);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API key') || error.message.includes('Incorrect')) {
      console.error('\n⚠️  Invalid API key. Please run: codex login\n');
    }
    process.exit(1);
  }
}

// Get prompt from command line args or stdin
const args = process.argv.slice(2);

// Handle commands
if (args[0] === 'login') {
  await login();
  process.exit(0);
} else if (args[0] === 'logout') {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
    console.log('✅ Logged out successfully\n');
  } else {
    console.log('ℹ️  Not logged in\n');
  }
  process.exit(0);
} else if (args[0] === 'status') {
  const key = loadApiKey();
  if (key) {
    console.log('✅ API key is configured');
    console.log(`   Source: ${process.env.OPENAI_API_KEY ? 'Environment variable' : 'Config file'}`);
    console.log(`   Key: ${key.substring(0, 7)}...${key.substring(key.length - 4)}\n`);
  } else {
    console.log('❌ No API key configured');
    console.log('   Run: codex login\n');
  }
  process.exit(0);
}

if (args.length > 0) {
  // Run with command line argument
  const prompt = args.join(' ');
  runCodex(prompt);
} else if (!process.stdin.isTTY) {
  // Read from piped input
  let input = '';
  rl.on('line', (line) => {
    input += line + '\n';
  });
  rl.on('close', () => {
    if (input.trim()) {
      runCodex(input.trim());
    } else {
      console.error('❌ No input provided\n');
      console.error('Usage:');
      console.error('   codex "your prompt here"');
      console.error('   echo "your prompt" | codex\n');
      process.exit(1);
    }
  });
} else {
  // Interactive mode - show help
  console.log('🤖 OpenAI Codex CLI\n');
  console.log('Commands:');
  console.log('   codex login                    Configure your API key');
  console.log('   codex logout                   Remove saved API key');
  console.log('   codex status                   Check configuration\n');
  console.log('Usage:');
  console.log('   codex "Write a function to reverse a string"');
  console.log('   echo "Explain async/await" | codex\n');
  process.exit(0);
}
