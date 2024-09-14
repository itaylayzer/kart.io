import * as path from "path";
import * as fs from "fs";
const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/kartio.duckdns.org/privkey.pem",
    "utf8"
);
const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/kartio.duckdns.org/fullchain.pem",
    "utf8"
);
export const credentials = { key: privateKey, cert: certificate };
