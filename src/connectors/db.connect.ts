import {DataSource} from "typeorm";
import {config} from "dotenv";
import {User} from "../schema/user.schema.js";
import {Checkpoint} from "../schema/checkpoint.schema";
import {CheckpointUser} from "../schema/checkpoint_user.schema";

config()
export const dataSource = new DataSource({
    type: "postgres",
    url: process.env.PSQL_CONNECTION_STRING,
    entities: [User, Checkpoint, CheckpointUser],
    synchronize: true
})

const initDS = await dataSource.initialize()
if (!initDS) {
    throw new Error('problem syncing with Database')
}
console.log('Datasource initialized')