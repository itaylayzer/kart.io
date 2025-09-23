import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Room } from "./room";
import cors from "cors";
import { RandomCode } from "./store/randomCode";

const app = express();
const server = createServer(app);

Room.initialize(server);
const tokenizer = new RandomCode();

const ports = new Map<string, Room | undefined>();

let startCount = parseInt(process.argv[2] ?? "0");
for (let index = 0; index < startCount; index++) {
	const token = tokenizer.generate();

	const room = new Room(
		token,
		`demo ${index}`,
		() => {
			ports.delete(token);
			tokenizer.release(token);
		},
		undefined,
		0
	);

	ports.set(token, room);
}

app.use(cors({ origin: process.env.ORIGIN }));

app.get("/", (req, res) => {
	res.status(200).send("Great! now you can play KartIO with servers");
});

app.get("/reg", (req, res) => {
	const [name, roomIndex, password] = [
		req.query.name as string,
		parseInt(req.query.map as string),
		req.query.password as string,
	];

	try {
		const token = tokenizer.generate();

		const room = new Room(
			token,
			name,
			() => {
				ports.delete(token);
				tokenizer.release(token);
			},
			password.length === 0 ? undefined : password,
			roomIndex
		);

		ports.set(token, room);
		res.status(200).send(`p${token}`);
	} catch (er) {
		res.status(200).send("2");
		console.error(er);
	}
});

app.get("/list", (req, res) => {
	const entries = Array.from(ports.entries())
		.filter((v) => v[1] !== undefined && !v[1].isGameStarted())
		.map(([port, room]) => [
			port,
			room!.name,
			room!.players.size,
			room!.password !== undefined,
		]);

	res.status(200).send(JSON.stringify(entries));
});

const port = +process.env.PORT!;
server.listen(port, () => {
	console.log(`server is running on http://localhost:${port}`);
});
