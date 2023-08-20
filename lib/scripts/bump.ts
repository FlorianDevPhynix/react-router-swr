import { promisify } from 'node:util';
import { exit } from 'node:process';
import { createInterface } from 'node:readline';
import { spawnSync } from 'node:child_process';

(async function main() {
  // ensure current branch is main
  /* const branch_output = spawnSync('git symbolic-ref --short HEAD', {
    cwd: '../../',
    timeout: 10 * 1000
  });
  console.log(branch_output)
  if (!branch_output.stdout.includes('main')) {
    console.log('Current branch is not main!')
    exit(-1)
  } */
  
  // check CHANGELOG
  const changed = spawnSync('git diff --quiet ../CHANGELOG.md', {
    cwd: '../../',
    timeout: 10 * 1000
  });
  
  if (changed.status === 1) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const question = promisify(rl.question).bind(rl);
  
    console.log('CHANGELOG.md was not changed!')
    const result = await question('Do you want to force bump? Yes(y)/No(n = default)');
    if (/^y|yes*/is.test(result)) {
      exit()
    }
    exit(-1)
  } else {
    console.log('Changelog check successful')
  }
})()
