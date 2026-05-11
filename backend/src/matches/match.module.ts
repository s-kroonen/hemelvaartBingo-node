import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {MatchService} from './match.service';
import {MatchRepository} from './match.repository';

import {Match, MatchSchema} from './match.schema';
import {UserModule} from '../users/user.module';
import {MatchController} from './match.controller';
import {MatchGateway} from "./match.gateway";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Match.name, schema: MatchSchema}]),
        UserModule,
    ],
    controllers: [MatchController],
    providers: [MatchGateway, MatchService, MatchRepository],
    exports: [MatchService, MatchGateway],
})
export class MatchModule {
}
