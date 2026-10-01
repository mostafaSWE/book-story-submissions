// Serves PostgREST under /rest/v1 (like Supabase) so supabase-js works unchanged against the local DB.
// localKey(role) makes local anon/service_role keys: JWTs signed with the local test secret, not real secrets.
//   node tests/db/rest-proxy.mjs        → http://127.0.0.1:18321/rest/v1
import http from "node:http";
import crypto from "node:crypto";
import path from "node:path";

export const LOCAL_JWT_SECRET = "local-test-jwt-secret-at-least-32-characters-long";
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

export function localKey(role) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ role, iss: "anta-local-tests", iat: 1700000000, exp: 4102444800 });
  const sig = crypto.createHmac("sha256", LOCAL_JWT_SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

export function startRestProxy(port = 18321, target = { host: "127.0.0.1", port: 54330 }) {
  const server = http.createServer((req, res) => {
    if (!req.url.startsWith("/rest/v1")) {
      res.writeHead(404).end();
      return;
    }
    const upstream = http.request(
      { ...target, method: req.method, path: req.url.slice("/rest/v1".length) || "/", headers: { ...req.headers, host: `${target.host}:${target.port}` } },
      (up) => {
        res.writeHead(up.statusCode, up.headers);
        up.pipe(res);
      }
    );
    upstream.on("error", (e) => res.writeHead(502).end(String(e)));
    req.pipe(upstream);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (path.basename(process.argv[1] || "") === "rest-proxy.mjs") {
  startRestProxy().then(() => console.log("rest proxy on http://127.0.0.1:18321/rest/v1"));
}
