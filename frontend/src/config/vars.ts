import { Client as ColyseusClient } from 'colyseus.js';
import CONFIG from "@/config";
global.colyseus = new ColyseusClient(CONFIG.COLYSEUS_CONNECT_STRNIG);
