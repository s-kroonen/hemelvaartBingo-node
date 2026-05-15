import {Injectable, NotFoundException} from '@nestjs/common';
import {Types} from 'mongoose';
import {EventRepository} from './event.repository';
import {CreateEventDto, UpdateEventDto} from './event.schema';
import {MatchService} from '../matches/match.service';
import {NotificationService} from "../notifications/notification.service";
import {MatchGateway} from "../matches/match.gateway";

@Injectable()
export class EventService {
    constructor(
        private eventRepo: EventRepository,
        private matchService: MatchService,
        private notificationService: NotificationService,
        private matchGateway: MatchGateway,
    ) {
    }

    async findByMatch(matchId: Types.ObjectId) {
        return this.eventRepo.findByMatch(matchId);
    }

    async findById(eventId: string | Types.ObjectId) {
        return this.eventRepo.findById(eventId);
    }

    async create(data: any) {
        return this.eventRepo.create(data);
    }

    async update(id: Types.ObjectId, data: any) {
        return this.eventRepo.update(id, data);
    }

    async createForMatch(dto: CreateEventDto, matchId: string) {
        const data = {
            ...dto,
            matchId: new Types.ObjectId(matchId),
        };
        const event = await this.eventRepo.create(data);
        if (dto.autoCall) {
            await this.callEvent(new Types.ObjectId(matchId), event.id);
        }
        return event;
    }

    async updateForMatch(
        dto: UpdateEventDto,
        matchId: Types.ObjectId,
        eventId: Types.ObjectId,
    ) {
        const data: any = {
            ...dto,
            matchId: matchId,
        };

        // null means explicitly clear — use $unset otherwise spread won't clear it
        if (dto.manualNumbers === null) {
            data.$unset = {manualNumbers: 1};
            delete data.manualNumbers;
        }
        return this.eventRepo.update(eventId, data);
    }

    async deleteForMatch(matchId: Types.ObjectId, eventId: Types.ObjectId) {
        await this.recallEvent(matchId, eventId);
        return this.eventRepo.deleteForMatch(eventId, matchId);
    }


    async callEvent(matchId: Types.ObjectId, eventId: string | Types.ObjectId) {
        const match = await this.matchService.findById(matchId);
        const event = await this.eventRepo.findById(eventId);
        if (!event) throw new NotFoundException(`Event with id ${eventId} not found`);
        if (!match) throw new NotFoundException(`Match with id ${matchId} not found`);

        const alreadyCalled = match.calledNumbers || [];
        const newNumbers: number[] = [];

        if (event.manualNumbers && event.manualNumbers.length > 0) {
            const valid = event.manualNumbers.filter(n => !alreadyCalled.includes(n));
            newNumbers.push(...valid);
        } else {
            const availableNumbers = this.getAvailableNumbers(alreadyCalled);
            const numbersPerEvent = match.numbersPerEvent;
            for (let i = 0; i < numbersPerEvent; i++) {
                if (availableNumbers.length === 0) break;
                const index = Math.floor(Math.random() * availableNumbers.length);
                newNumbers.push(availableNumbers.splice(index, 1)[0]);
            }
        }

        event.called = true;
        event.calledAt = new Date();
        event.numbers.push(...newNumbers);
        match.calledNumbers.push(...newNumbers);

        await match.save();
        await event.save();

        // WebSocket update (live UI)
        this.matchGateway.emitEventUpdate(match.id, event.id, 'CALL');

        // Push notification (only on call, not recall)
        await this.notificationService.notifyNewNumber(match.id.toString());

        return {newNumbers};
    }

    async recallEvent(matchId: Types.ObjectId, eventId: Types.ObjectId) {
        const match = await this.matchService.findById(matchId);
        const event = await this.eventRepo.findById(eventId);
        if (!event) throw new NotFoundException(`Event with id ${eventId} not found`);
        if (!match) throw new NotFoundException(`Match with id ${matchId} not found`);

        const eventNumbers = event.numbers || [];

        match.calledNumbers = (match.calledNumbers || []).filter(n => !eventNumbers.includes(n));
        event.numbers = [];
        event.called = false;
        event.calledAt = undefined;

        await match.save();
        await event.save();

        // WebSocket update only — no push notification on recall
        this.matchGateway.emitEventUpdate(match.id, event.id, 'RECALL');

        return {removedNumbers: eventNumbers};
    }

    getAvailableNumbers(called: number[]) {
        const all = Array.from({length: 75}, (_, i) => i + 1);
        return all.filter((n) => !called.includes(n));
    }

    async getLatestCalled(matchId: string) {
        const match = await this.matchService.findById(matchId);
        if (!match) throw new NotFoundException(`Match with id ${matchId} not found`);
        return this.eventRepo.findLatestCalled(match._id);
    }

    async getCalledHistory(matchId: string) {
        const match = await this.matchService.findById(matchId);
        if (!match) throw new NotFoundException(`Match with id ${matchId} not found`);
        return this.eventRepo.findCalledHistory(match._id);
    }
}
