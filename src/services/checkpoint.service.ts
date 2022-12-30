import {Repository} from "typeorm";
import {User} from "../schema/user.schema";
import {Credentials_IF, UserDataVaried} from "../interfaces/user.interface";
import bcrypt from "bcrypt";
import {dataSource} from "../connectors/db.connect.js";
import {CheckpointUser} from "../schema/checkpoint_user.schema.js";
import {Checkpoint} from "../schema/checkpoint.schema.js";

class CheckpointUserService {
    repo: Repository<CheckpointUser>
    checkpointRepo: Repository<Checkpoint>

    constructor(checkpointUserRepo: Repository<CheckpointUser>, checkpointRepo: Repository<Checkpoint>) {
        this.repo = checkpointUserRepo
        this.checkpointRepo = checkpointRepo
    }

    async find(user: string, checkpoint: string) {
        const checkpointId = await this.checkpointRepo.findOneBy({name: checkpoint})
        if (!checkpointId) {
            throw new Error('No such Checkpoint found in Database')
        }
        return this.repo.findOne({where: {user: user, checkpoint: checkpointId.id}, select: {id: true}})
    }

    async initiate(user: string, checkpoint: string) {
        const point = new CheckpointUser()
        const checkpointId = await this.checkpointRepo.findOneBy({name: checkpoint})
        if (!checkpointId) {
            throw new Error('No such Checkpoint found in Database')
        }
        const exists = await this.repo.findOneBy({checkpoint: checkpointId.id, user: user})
        if (exists) {
            return exists.id
        }
        point.user = user
        point.checkpoint = checkpointId.id
        point.createdAt = new Date()
        const saved = await this.repo.save(point)
        return saved.id
    }

    //finish or rollback checkpoint
    async activate(id: string, activated: boolean) {
        await this.repo.update({id: id}, {finished: activated})
    }

    //get temp data
    async checkTemp(id: string) {
        return this.repo.findOne({
            where: {id: id}, order: {}, select: {
                temp_data: true
            }
        })
    }

    //leave temp data
    async leaveTemp(id: string, data: any) {
        data = typeof data === 'string' ? data : JSON.stringify(data)
        await this.repo.update({id: id}, {temp_data: data})
    }

    //delete temp data
    async clearTemp(id: string) {
        await this.repo.update({id: id}, {temp_data: undefined})
    }


}

export const checkpointUserService = new CheckpointUserService(dataSource.getRepository(CheckpointUser), dataSource.getRepository(Checkpoint))