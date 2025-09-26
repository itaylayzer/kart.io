import { Client as ColyseusClient } from 'colyseus.js';
global.colyseus = new ColyseusClient("ws://localhost:2567");
