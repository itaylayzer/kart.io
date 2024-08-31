import express from "express";
import { createServer } from "http";
import { Room } from "./room";

const app = express();
const server = createServer(app);

const ports = new Map<number, Room | undefined>();
let startCount = parseInt(process.argv[2] ?? "0");
for (let index = 64000; index < 65000; index++) {
  ports.set(
    index,
    startCount > 0 ? new Room(index, `demo ${startCount}`) : undefined
  );
  startCount > 0 && startCount--;
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Token"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT");
  next();
});

app.get("/", (req, res) => {
  res.status(200).send("Great! now you can play KartIO with servers");
});

app.get("/register/:name", (req, res) => {
  try {
    const entries = Array.from(ports.entries());
    const openPortObj = entries.filter((v) => v[1] === undefined).pop();
    if (openPortObj === undefined) {
      res.status(200).send("1");
      return;
    }
    const portNum = openPortObj[0];
    ports.set(portNum, new Room(portNum, req.params.name));
    res.status(200).send(`p${portNum}`);
  } catch (er) {
    res.status(200).send("2");
    console.error(er);
  }
});

app.get("/list", (req, res) => {
  const entries = Array.from(ports.entries())
    .filter((v) => v[1] !== undefined)
    .map(([port, room]) => [port, room!.name, room!.players.size]);

  res.status(200).send(JSON.stringify(entries));
});

server.listen(3000, () => {
  console.log(`server is running on http://localhost:3000/`);
});
const room = new Room(3001, "local");
