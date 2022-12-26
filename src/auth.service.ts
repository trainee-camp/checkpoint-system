import bcrypt from 'bcrypt'
import {Repository} from "typeorm";
import {User} from "./user.schema.js";
import {dataSource} from "./db.connect.js";
import {client} from "./redis.connect.js";
// import {RedisClientType, RedisFunctions, RedisModules, RedisScripts} from "redis";
import {clientType} from "./redis.connect.js";
import {isUser, User_IF} from "./interfaces/user.interface.js";

const bcryptConf = {
    saltRounds: 10
}

class AuthService {
    repo: Repository<User>
    cache: clientType

    constructor(userRepo: Repository<User>,
                cache: clientType) {
        this.repo = userRepo
        this.cache = cache
    }

    basic = async (body: any, index: string) => {
        const {email, password} = body
        const hashed = await bcrypt.hash(password, bcryptConf.saltRounds)
        await this.cache.json.set(index, '.', {
            email: email,
            password: hashed
        })
    }

    async basicMailVerification(body: any, index: string) {
        const {email, password} = body
        const hashed = await bcrypt.hash(password, bcryptConf.saltRounds)
        await this.cache.json.set(index, '.', {
            temp_email: email,
            temp_password: hashed
        })
    }

    async verifyMail(body: any, index: string) {
        const {token} = body
        const expected = this.cache.json.get(index, {
            path: '.email_verification'
        })
        if (token !== expected) {
            throw new Error()
        }
        const temp = <any>await this.cache.json.get(index, {
            path: [
                '.temp_email',
                '.temp_password'
            ]
        })
        await Promise.all([this.cache.json.del(index, '.temp_email'), this.cache.json.del(index, '.temp_password')])
        await this.cache.json.set(index, '.', {
            email: temp['.temp_email'],
            password: temp['.temp_password']
        })
    }

    async save(index: string) {
        const userdata = await this.cache.json.get(index, {path: '.'})
        //
        console.log(userdata)
        //
        const checkForm = isUser(userdata)
        if (!checkForm) {
            throw Error('User malformed, authentication illegible')
        }
        await this.repo.save(userdata)
        await this.cache.del(index)
    }
}

export const authService = new AuthService(dataSource.getRepository(User), client)