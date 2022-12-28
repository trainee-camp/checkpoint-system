import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CheckpointUser} from "./checkpoint_user.schema";

@Entity()
export class Checkpoint {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({nullable: false, unique: true})
    name: string
    // @OneToMany((type) => CheckpointUser, (checkpointuser) => checkpointuser.checkpoint)
    // users: CheckpointUser[]
}

