import {InjectModel} from "@nestjs/mongoose";
import {Invite} from "./invite.schema";
import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";

@Injectable()
export class InviteRepository {
    constructor(@InjectModel(Invite.name) private model: Model<Invite>) {}

    findByToken(token: string) {
        return this.model.findOne({ token, isActive: true });
    }

    create(data: Partial<Invite>) {
        return this.model.create(data);
    }
}