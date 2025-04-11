import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// 👇 This replicates __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Now use __dirname like before
const idlPath = path.join(__dirname, "../script/id1.json");

const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

console.log("IDL for program:", idl);
