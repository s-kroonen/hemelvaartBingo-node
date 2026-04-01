import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Match} from "../matches/match.schema";
import {AdminService} from "./admin.service";
import {MatchRepository} from "../matches/match.repository";
import {AdminController} from "./admin.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Match.name, schema: Match },
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService, MatchRepository],
})
export class AdminModule {}