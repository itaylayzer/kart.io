# Kart.io

a kart racing game created with three.js and cannon-es, based on the [playground-kart](https://itaylayzer.github.io/playground-kart)

# How to run the project

the backend is written in http, if you want https i recommand to reverse proxy for that.

## Port + IP

if you want to run as development

### Server Configurations

in root folder create `.env` file with this variables

```.env
PORT=<your desired port>
ORIGIN=<theres no default value, for developement put the value of '*'>
```

### Frontend Configurations

in src folder create `config.ts` file with this variables

```ts
export default {
	IP: "<ip>:<port>", // its important that its will not end with /
	PATH: "",
	WEBSOCKET_PROTOCOL: "ws", // "ws" | "wss"
	HTTP_PROTOCOL: "http", // "http" | "https"
};
```

## Domain

if you want to run as production with domain

### Server Configurations

in root folder create `.env` file with this variables

```.env
PORT=<your desired port>
ORIGIN=<theres no default value, for developement put the value of '*'>
```

### Frontend Configurations

in src folder create `config.ts` file with this variables

```ts
export default {
	IP: "<domain>", // its important that its will not end with /
	PATH: "",
	WEBSOCKET_PROTOCOL: "ws", // "ws" | "wss"
	HTTP_PROTOCOL: "http", // "http" | "https"
};
```

## Domain and Path

if you want to run as production with domain and you need sub path

### Server Configurations

in root folder create `.env` file with this variables

```.env
PORT=<your desired port>
ORIGIN=<theres no default value, for developement put the value of '*'>
SUBPATH=/<path> # its important that its start with /
```

### Frontend Configurations

in src folder create `config.ts` file with this variables

```ts
export default {
	IP: "<domain>", // its important that its will not end with /
	PATH: "/<path>", // its important that its will start with /
	WEBSOCKET_PROTOCOL: "ws", // "ws" | "wss"
	HTTP_PROTOCOL: "http", // "http" | "https"
};
```
