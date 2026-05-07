import { Module } from '@nestjs/common';

import {MongooseModule} from "@nestjs/mongoose";
import {Ad, AdSchema} from "./ad.shema";
import {AdController, AdsAdminController} from "./ad.controller";
import {AdService} from "./ad.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Ad.name, schema: AdSchema}
        ]),
    ],
    controllers: [AdController, AdsAdminController],
    providers: [AdService],
})
export class AdModule {}
