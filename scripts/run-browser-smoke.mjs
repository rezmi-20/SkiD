import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  if (result.error) throw result.error;
  return result.status ?? 1;
}

const extraArgs = process.argv.slice(2);

let exitCode = 0;
exitCode = run("npm", ["run", "demo:seed"]);

if (exitCode === 0) {
  exitCode = run("npx", ["playwright", "test", ...extraArgs]);
}

const resetCode = run("npm", ["run", "demo:reset"]);
if (exitCode === 0 && resetCode !== 0) {
  exitCode = resetCode;
}

process.exit(exitCode);
