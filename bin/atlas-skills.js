#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(PKG_ROOT, 'skills');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);

const UNKNOWN = argv.filter(
  (a) => a.startsWith('-') && !['--project', '--force', '--list', '--help', '-h'].includes(a)
);

function usage() {
  console.log(`
atlas-skills   install the nine Atlas skills

Usage
  npx @hilarionengarejr/atlas-skills [options]

Options
  --project    install into ./.claude/skills (this repo) instead of ~/.claude/skills
  --force      overwrite a skill that is already installed
  --list       list the skills in this package, then exit
  --help, -h   show this

By default the skills land in ~/.claude/skills, so every project can use them.
A skill that is already there is left alone unless you pass --force.
`);
}

function readSkills() {
  if (!fs.existsSync(SRC)) return [];
  return fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(SRC, name, 'SKILL.md')))
    .sort();
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

function main() {
  if (UNKNOWN.length) {
    console.error(`atlas-skills: unknown option ${UNKNOWN.join(', ')}`);
    usage();
    process.exit(1);
  }

  if (has('--help') || has('-h')) {
    usage();
    return;
  }

  const skills = readSkills();

  if (skills.length === 0) {
    console.error('atlas-skills: no skills found in this package. That is a packaging bug.');
    process.exit(1);
  }

  if (has('--list')) {
    console.log(skills.join('\n'));
    return;
  }

  const target = has('--project')
    ? path.resolve(process.cwd(), '.claude', 'skills')
    : path.join(os.homedir(), '.claude', 'skills');

  fs.mkdirSync(target, { recursive: true });

  const installed = [];
  const skipped = [];

  for (const name of skills) {
    const dest = path.join(target, name);
    if (fs.existsSync(dest) && !has('--force')) {
      skipped.push(name);
      continue;
    }
    fs.rmSync(dest, { recursive: true, force: true });
    copyDir(path.join(SRC, name), dest);
    installed.push(name);
  }

  console.log(`\natlas-skills → ${target}\n`);
  if (installed.length) {
    console.log(`installed (${installed.length}): ${installed.join(', ')}`);
  }
  if (skipped.length) {
    console.log(`already there (${skipped.length}): ${skipped.join(', ')}`);
    console.log('\nRun again with --force to overwrite them.');
  }
  console.log('');
}

try {
  main();
} catch (err) {
  console.error(`atlas-skills: ${err && err.message ? err.message : err}`);
  process.exit(1);
}
