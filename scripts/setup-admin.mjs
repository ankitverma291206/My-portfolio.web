import { randomBytes, scrypt } from 'node:crypto';
import { readFile, writeFile, chmod } from 'node:fs/promises';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

function readInput(label, masked = false) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Run this setup directly in PowerShell or another interactive terminal.');
  }

  process.stdout.write(label);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const onData = (chunk) => {
      const input = chunk.toString('utf8');
      for (const character of input) {
        if (character === '\u0003') {
          process.stdin.off('data', onData);
          process.stdin.setRawMode(false);
          process.stdout.write('\n');
          reject(new Error('Setup cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          process.stdin.off('data', onData);
          process.stdin.setRawMode(false);
          process.stdout.write('\n');
          resolve(value);
          return;
        }
        if (character === '\u0008' || character === '\u007f') {
          if (value.length > 0) {
            value = Array.from(value).slice(0, -1).join('');
            process.stdout.write('\b \b');
          }
          continue;
        }
        if (character >= ' ' && character !== '\u007f') {
          value += character;
          process.stdout.write(masked ? '*' : character);
        }
      }
    };
    process.stdin.on('data', onData);
  });
}

function upsertEnvLine(lines, key, value) {
  const expression = new RegExp(`^${key}=`);
  const index = lines.findIndex((line) => expression.test(line));
  const next = `${key}=${value}`;
  if (index >= 0) lines[index] = next;
  else lines.push(next);
}

async function main() {
  try {
    const username = (await readInput('Choose an admin username: ')).trim();
    if (!/^[a-zA-Z0-9._-]{3,60}$/.test(username)) {
      throw new Error('Use 3–60 letters, numbers, periods, underscores, or hyphens for the username.');
    }

    const password = await readInput('Choose a unique password (minimum 10 characters): ', true);
    if (password.length < 10 || password.length > 256) throw new Error('The password must be between 10 and 256 characters. A longer random password is safer.');
    const confirmation = await readInput('Confirm password: ', true);
    if (password !== confirmation) throw new Error('The passwords do not match. Run the setup again.');

    const salt = randomBytes(16);
    const derived = await scryptAsync(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
    const passwordHash = `scrypt:32768:8:3:${salt.toString('base64url')}:${derived.toString('base64url')}`;
    const sessionSecret = randomBytes(48).toString('base64url');
    const envPath = new URL('../.env.local', import.meta.url);
    let lines = [];
    try {
      lines = (await readFile(envPath, 'utf8')).split(/\r?\n/).filter((line) => line.length > 0);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    upsertEnvLine(lines, 'ADMIN_USERNAME', username);
    upsertEnvLine(lines, 'ADMIN_PASSWORD_HASH', passwordHash);
    upsertEnvLine(lines, 'SESSION_SECRET', sessionSecret);
    await writeFile(envPath, `${lines.join('\n')}\n`, { encoding: 'utf8', mode: 0o600 });
    await chmod(envPath, 0o600).catch(() => {});

    process.stdout.write('\nAdmin credentials saved to .env.local (ignored by Git).\n');
    process.stdout.write('Add DATABASE_URL there for local use. For the live site, add DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and SESSION_SECRET in Vercel Project Settings → Environment Variables, then redeploy.\n');
  } finally {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
