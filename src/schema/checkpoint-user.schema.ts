import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class CheckpointUser {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column()
    user: string
    @Column()
    checkpoint: string
    @Column({type: "text", nullable: true})
        //various temporary data needed for checkpoint verification ( a token for email verification e.g.)
    temp_data: string | null
    @Column({default: false})
    finished: boolean
    @Column()
    createdAt: Date
}