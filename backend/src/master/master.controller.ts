import {Body, Controller, Param, Post, UseGuards} from "@nestjs/common";
import {FirebaseAuthGuard} from "../auth/firebase-auth.guard";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {CardService} from "../cards/card.service";

@Controller('master')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('master')
export class MasterController {
    constructor(private cardService: CardService) {}

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'master')
    @Post('cards/:id/regenerate')
    regenerate(@Param('id') id: string, @Body() body) {
        return this.cardService.regenerateCard(id, body.size);
    }
}