import {DataSource} from "typeorm";
import {config} from "dotenv";
import {User} from "./user.schema.js";

config()
export const dataSource = new DataSource({
    type: "postgres",
    url: process.env.PSQL_CONNECTION_STRING,
    entities: [User],
    synchronize:true
})

const initDS = await dataSource.initialize()
if (!initDS) {
    throw new Error('problem syncing with Database')
}
console.log('Datasource initialized')