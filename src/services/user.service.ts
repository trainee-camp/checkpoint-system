import bcrypt from 'bcrypt'
import {Repository} from "typeorm";
import {User} from "../schema/user.schema.js";
import {dataSource} from "../connectors/db.connect.js";

import {Credentials_IF, isUser, User_IF, UserDataVaried} from "../interfaces/user.interface.js";

const bcryptConf = {
    saltRounds: 10
}

class UserService {
    repo: Repository<User>

    constructor(userRepo: Repository<User>) {
        this.repo = userRepo
    }

    async find(id: string) {
        return this.repo.findOneBy({id: id})
    }

    async create(data: Credentials_IF) {
        const user = new User()
        user.email = data.email
        user.password = await bcrypt.hash(data.password, bcryptConf.saltRounds)
        const saved = await this.repo.save(user)
        return saved.id
    }

    async edit(id: string, data: UserDataVaried) {
        await this.repo.update({id: id}, {...data})
    }

    async delete(id: string) {
        await this.repo.delete({id: id})
    }

}

export const userService = new UserService(dataSource.getRepository(User))