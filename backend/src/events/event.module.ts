import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';
import { BingoEvent, EventSchema } from './event.schema';
import { MatchModule } from '../matches/match.module';
import { EventController } from './event.controller';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: BingoEvent.name, schema: EventSchema }]),
    MatchModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventModule {}
