import {NotificationService} from "./notification.service";
import {Module} from "@nestjs/common";
import {UserModule} from "../users/user.module";
import {MatchModule} from "../matches/match.module";

@Module({
    imports: [UserModule,MatchModule],
    providers: [NotificationService],
    exports: [NotificationService], // MUST EXPORT
})
export class NotificationModule {}