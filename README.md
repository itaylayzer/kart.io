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

## Reverse Proxy with NginX

heres a configuration file for setting up kart.io reverse proxy with `nginx` that works good with socket io:

```nginx

server {
    listen 443 ssl;
    server_name <domain>;

    ssl_certificate <location>;
    ssl_certificate_key <location>;

    # Enable TLS protocols only
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # Handle Kart.io WebSocket connections
    location / {
        proxy_pass http://localhost:<PORT>;

        # WebSocket-specific headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts and buffering
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 3600s;
        proxy_buffering off;
    }

    # Handle Socket.IO-specific WebSocket connections
    location /socket.io/ {
        proxy_pass http://localhost:<PORT>/socket.io/;

        # WebSocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;

        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Prevent WebSocket timeout
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 3600s;
        proxy_buffering off;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name <domain>;

    return 301 https://$host$request_uri;
}

```
