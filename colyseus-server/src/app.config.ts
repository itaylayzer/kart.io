import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { matchMaker } from "colyseus";
/**
 * Import your Room files
 */
import { KartRace } from "./rooms/KartRace";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('kart_race', KartRace);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.get('/rooms/:roomType', async (req, res) => {
            const rooms = await matchMaker.query({ name: req.params.roomType });
            const availableRooms = rooms.filter(room => !room.locked);

            res.status(200).send(availableRooms);
        })

        app.post('/rooms/:roomType', async (req, res) => {
            const data = req.body as {
                roomName: string,
                mapId: number,
                password: string
            };

            console.log('creating room', req.params.roomType, 'with data:', JSON.stringify(data, null, 4));
            res.status(201).send((await matchMaker.createRoom(req.params.roomType, data)).roomId);
        })


        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
