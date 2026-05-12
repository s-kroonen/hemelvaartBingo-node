import {NotificationService} from "./notification.service";
import {Module} from "@nestjs/common";

@Module({
    providers: [NotificationService],
    exports: [NotificationService], // MUST EXPORT
})
export class NotificationModule {}