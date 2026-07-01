const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.argv[2] || 8000);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const sendFile = (file, res) => {
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    fs.createReadStream(file).pipe(res);
  });
};

http
  .createServer((req, res) => {
    try {
      const raw = decodeURIComponent((req.url || "/").split("?")[0]);

      if (raw === "/vylety.html") {
        res.writeHead(301, { Location: "/vylety/" });
        res.end();
        return;
      }

      const rel = raw === "/" ? "index.html" : raw.replace(/^\/+/, "");
      let file = path.resolve(root, rel);

      if (!file.startsWith(root)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      fs.stat(file, (error, stat) => {
        if (!error && stat.isDirectory()) {
          file = path.join(file, "index.html");
        }

        sendFile(file, res);
      });
    } catch (error) {
      res.writeHead(500);
      res.end(String((error && error.message) || error));
    }
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Local server running at http://localhost:${port}/`);
  });
