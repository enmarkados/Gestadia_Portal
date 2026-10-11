import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const name = `gestadia-app-test-${randomUUID()}`,
  owner = randomUUID();
const env = {
  ...process.env,
  DOTENV_CONFIG_PATH: "/dev/null",
  APP_CONVERSATIONS_ENABLED: "false",
  NODE_OPTIONS: "--no-experimental-webstorage",
};
function run(command, args, { capture = false } = {}) {
  const r = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (r.status !== 0)
    throw new Error(
      `${command} failed (${r.status}): ${capture ? r.stderr : ""}`,
    );
  return r.stdout?.trim();
}
let dockerHost,
  created = false;
try {
  dockerHost = run(
    "docker",
    ["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"],
    { capture: true },
  );
  if (!dockerHost.startsWith("unix://"))
    throw new Error("This runner requires a local Unix Docker socket");
  const docker = (args) =>
    run("docker", ["--host", dockerHost, ...args], { capture: true });
  docker([
    "run",
    "--pull=never",
    "--detach",
    "--rm",
    "--name",
    name,
    "--label",
    `gestadia.app.test.owner=${owner}`,
    "--publish",
    "127.0.0.1::3306",
    "--tmpfs",
    "/var/lib/mysql",
    "--env",
    "MYSQL_ROOT_PASSWORD=local-test-only",
    "--env",
    "MYSQL_DATABASE=gestadia_app_test",
    "--env",
    "MYSQL_USER=app_test",
    "--env",
    "MYSQL_PASSWORD=local-test-only",
    "mysql:8",
  ]);
  created = true;
  for (let n = 0; ; n++) {
    const r = spawnSync(
      "docker",
      [
        "--host",
        dockerHost,
        "exec",
        name,
        "mysql",
        "--protocol=TCP",
        "--host=127.0.0.1",
        "--user=app_test",
        "--password=local-test-only",
        "--database=gestadia_app_test",
        "--execute=SELECT 1",
      ],
      { encoding: "utf8" },
    );
    if (r.status === 0) break;
    if (n >= 45) throw new Error("MySQL fixture did not become ready");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const address = docker(["port", name, "3306/tcp"]);
  if (!/^127\.0\.0\.1:\d+$/.test(address))
    throw new Error("Unexpected fixture endpoint");
  env.DATABASE_URL = `mysql://app_test:local-test-only@${address}/gestadia_app_test`;
  env.GESTADIA_MOBILE_TEST_DATABASE_URL = env.DATABASE_URL;
  run("npm", [
    "exec",
    "--prefix",
    "backend",
    "--",
    "prisma",
    "generate",
    "--schema",
    "backend/prisma/schema.prisma",
  ]);
  run("npm", [
    "exec",
    "--prefix",
    "backend",
    "--",
    "prisma",
    "migrate",
    "deploy",
    "--schema",
    "backend/prisma/schema.prisma",
  ]);
  run("npm", ["test", "--prefix", "backend"]);
  run("npm", ["test", "--prefix", "frontend"]);
  run("npm", ["run", "build:app", "--prefix", "frontend"]);
} finally {
  if (created) {
    const label = spawnSync(
      "docker",
      [
        "--host",
        dockerHost,
        "inspect",
        "--format",
        '{{index .Config.Labels "gestadia.app.test.owner"}}',
        name,
      ],
      { encoding: "utf8" },
    );
    if (label.stdout?.trim() === owner)
      spawnSync("docker", ["--host", dockerHost, "stop", name], {
        stdio: "ignore",
      });
  }
}
