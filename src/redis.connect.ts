import {createClient} from 'redis'
import {config} from "dotenv";

config()
export const client = createClient({url: process.env.REDIS_CONNECTION_STRING})
export type clientType = typeof client
await client.connect()
