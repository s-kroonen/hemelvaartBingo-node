import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {MatchService} from './match.service';
import {MatchRepository} from './match.repository';

import {Match, MatchSchema} from './match.schema';
import {UserModule} from '../users/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: Match.name, schema: MatchSchema}])
    ],
    providers: [MatchService, MatchRepository],
    exports: [MatchService],
})
export class MatchModule {
}
