import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './user.schema';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {UserRepository} from './user.repository';
import {MatchModule} from "../matches/match.module";
import {CardModule} from "../cards/card.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema}
        ]),
        MatchModule,
        CardModule,
    ],
    providers: [UserService, UserRepository],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {
}