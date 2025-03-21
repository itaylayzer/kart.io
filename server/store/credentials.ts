import * as fs from "fs";
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY!, "utf8");
const certificate = fs.readFileSync(process.env.CERTIFICATE!, "utf8");
export const credentials = { key: privateKey, cert: certificate };
