// invites/invite.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './invite.schema';
import { InviteRepository } from './invite.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Invite.name, schema: InviteSchema },
        ]),
    ],
    providers: [InviteRepository],
    exports: [InviteRepository],
})
export class InviteModule {}