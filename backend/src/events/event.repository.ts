import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from "./event.schema";

@Injectable()
export class EventRepository {
    constructor(@InjectModel(Event.name) private model: Model<Event>) {}

    create(data: Partial<Event>) {
        return this.model.create(data);
    }

    findByMatch(matchId: string) {
        return this.model.find({ matchId });
    }

    update(id: string, data: Partial<Event>) {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }
}