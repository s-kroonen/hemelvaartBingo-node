import {Module} from "@nestjs/common";
import {Card, CardSchema} from "./card.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {CardService} from "./card.service";
import {CardRepository} from "./card.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Card.name, schema: CardSchema},
        ]),
    ],
    providers: [CardService, CardRepository],
    exports: [CardService],
})
export class CardModule {}