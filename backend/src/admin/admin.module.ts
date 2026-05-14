import {Module} from '@nestjs/common';
import {AdminService} from './admin.service';
import {AdminController} from './admin.controller';

import {UserModule} from '../users/user.module';
import {InviteModule} from '../invites/invite.module';
import {MatchModule} from '../matches/match.module';
import {CardModule} from '../cards/card.module';
import {NotificationModule} from "../notifications/notification.module";

@Module({
    imports: [UserModule, InviteModule, MatchModule, CardModule, NotificationModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {
}
