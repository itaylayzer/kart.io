import * as path from "path";
import * as fs from "fs";
const privateKey = fs.readFileSync(path.join(__dirname, "server.key"), "utf8");
const certificate = fs.readFileSync(
  path.join(__dirname, "server.cert"),
  "utf8"
);
export const credentials = { key: privateKey, cert: certificate };
