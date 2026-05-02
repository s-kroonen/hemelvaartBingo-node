import { Module } from '@nestjs/common';
import { Card, CardSchema } from './card.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { MatchModule } from '../matches/match.module';
import { UserModule } from '../users/user.module';
import { CardController } from './card.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    MatchModule,
    UserModule,
  ],
  controllers: [CardController],
  providers: [CardService, CardRepository],
  exports: [CardService],
})
export class CardModule {}
