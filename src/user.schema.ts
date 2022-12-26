import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
    @Column({nullable:true})
    username: string
    @Column()
    email: string
    @Column()
    password: string
    @Column({nullable:true})
    phone: string
    @Column({nullable:true})
    address: string
    @Column({nullable:true})
    bankAccount: string
}
