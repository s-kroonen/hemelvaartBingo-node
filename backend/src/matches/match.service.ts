import { Injectable } from '@nestjs/common';
import { MatchRepository } from './match.repository';
import {Match} from "./match.schema";

import {Types} from "mongoose";
@Injectable()
export class MatchService {
    constructor(private repo: MatchRepository) {}

    async getUserMatches(userId: Types.ObjectId): Promise<Match[]> {
        const objectId = new Types.ObjectId(userId);
        return this.repo.findByUser(objectId);
    }
}