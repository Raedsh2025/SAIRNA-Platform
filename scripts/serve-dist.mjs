/**
 * خادم معاينة محلي لبناء dist:
 * - يخدم الملفات الثابتة مع SPA fallback.
 * - يمرّر /api إلى خادم سيرنا الحقيقي (بدل بروكسي Vite).
 *
 * الاستخدام: node scripts/serve-dist.mjs [port]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.argv[2]) || 4173;
const ROOT = resolve("dist");
const API_TARGET =
  process.env.API_TARGET || "https://sairna.abdulrahman-hares.com";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

if (!existsSync(ROOT)) {
  console.error("✖ مجلد dist غير موجود. شغّل: npm run build");
  process.exit(1);
}

const target = new URL(API_TARGET);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname.startsWith("/api/")) {
    const transport = target.protocol === "https:" ? httpsRequest : httpRequest;
    const proxy = transport(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: req.method,
        headers: { ...req.headers, host: target.host, origin: target.origin },
      },
      (upstream) => {
        res.writeHead(upstream.statusCode ?? 502, {
          ...upstream.headers,
          "access-control-allow-origin": "*",
        });
        upstream.pipe(res);
      },
    );

    proxy.on("error", (error) => {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end(`proxy error: ${error.message}`);
    });

    req.pipe(proxy);
    return;
  }

  const safePath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(ROOT, safePath);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(ROOT, "index.html");
  }

  res.writeHead(200, {
    "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `✔ معاينة dist على http://127.0.0.1:${PORT}  (API → ${API_TARGET})`,
  );
});
