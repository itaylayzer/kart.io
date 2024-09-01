import express from "express";
import { createServer } from "https";
import { Room } from "./room";
import cors from "cors";
import { credentials } from "./store/credentials";

const app = express();
const server = createServer(credentials, app);

const ports = new Map<number, Room | undefined>();
let startCount = parseInt(process.argv[2] ?? "0");
for (let index = 5321; index < 5350; index++) {
  ports.set(
    index,
    startCount > 0
      ? new Room(index, `demo ${startCount}`, () => {
          ports.set(index, undefined);
        })
      : undefined
  );
  startCount > 0 && startCount--;
}

app.use(cors({ origin: "*" }));

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

    ports.set(
      portNum,
      new Room(portNum, req.params.name, () => {
        ports.set(portNum, undefined);
      })
    );
    res.status(200).send(`p${portNum}`);
  } catch (er) {
    res.status(200).send("2");
    console.error(er);
  }
});

app.get("/list", (req, res) => {
  const entries = Array.from(ports.entries())
    .filter((v) => v[1] !== undefined && !v[1].isGameStarted())
    .map(([port, room]) => [port, room!.name, room!.players.size]);

  res.status(200).send(JSON.stringify(entries));
});

const port = 5350;
server.listen(port, () => {
  console.log(`server is running on :${port}`);
});
