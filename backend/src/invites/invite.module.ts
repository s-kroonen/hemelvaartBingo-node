// invites/invite.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './invite.schema';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { InviteRepository } from './invite.repository';
import { UserModule } from '../users/user.module';
import { MatchModule } from '../matches/match.module';
import { CardModule } from '../cards/card.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
    UserModule,
    MatchModule,
    CardModule,
  ],
  providers: [InviteService, InviteRepository],
  controllers: [InviteController],
  exports: [InviteService],
})
export class InviteModule {}
