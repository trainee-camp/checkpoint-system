import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class CheckpointUser {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column()
    user: string
    @Column()
    checkpoint: string
    @Column({nullable: true})
        //various temporary data needed for checkpoint verification ( a token for email verification e.g.)
    temp_data: string
    @Column({default: false})
    finished: boolean
    @Column()
    createdAt: Date
}