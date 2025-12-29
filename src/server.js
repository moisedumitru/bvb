import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { webMain } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post("/run", async (req, res) => {
  console.log("▶ /run primit");

  try {
    const csv = await webMain(req.body);

    const filePath = path.join(__dirname, "recomandari_bet.csv");
    fs.writeFileSync(filePath, csv);

    console.log("✔ CSV scris aici:", filePath);
    res.json({ ok: true });

  } catch (err) {
    console.error("❌ EROARE:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✔ Server pornit`);
  console.log(`👉 Deschide: http://localhost:${port}/index.html`);
});
