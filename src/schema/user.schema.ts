import {Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CheckpointUser} from "./checkpoint-user.schema.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({nullable: true, unique: true})
    username: string
    @Column({unique: true})
    email: string
    @Column()
    password: string
    @Column({nullable: true})
    phone: string
    @Column({nullable: true})
    address: string
    @Column({nullable: true})
    bank_account: string
    @OneToMany((type) => CheckpointUser, (checkpointuser) => checkpointuser.user, {cascade: true})
    checkpoints: CheckpointUser[]
    @Column({default: false})
    activated: boolean
}
