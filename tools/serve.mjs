import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2] || "."), port = +(process.argv[3] || 5533);
const T = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".woff2": "font/woff2", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = path.normalize(decodeURIComponent(req.url.split("?")[0]));
  if (p === "\\" || p === "/" || p === "." || p === "" || p.endsWith("/") || p.endsWith("\\")) {
    p = path.join(p, "index.html");
  }
  const f = path.join(root, p);
  if (!f.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) {
      res.writeHead(404, { "content-type": "text/plain" }).end("404");
      return;
    }
    const h = { "content-type": T[path.extname(f)] || "application/octet-stream", "accept-ranges": "bytes", "cache-control": "no-cache" };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (m) {
      const s = m[1] ? +m[1] : 0, en = m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
      res.writeHead(206, { ...h, "content-range": `bytes ${s}-${en}/${st.size}`, "content-length": en - s + 1 });
      fs.createReadStream(f, { start: s, end: en }).pipe(res);
    } else {
      res.writeHead(200, { ...h, "content-length": st.size });
      fs.createReadStream(f).pipe(res);
    }
  });
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
