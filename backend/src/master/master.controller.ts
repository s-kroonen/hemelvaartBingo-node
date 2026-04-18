import {Body, Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {FirebaseAuthGuard} from "../auth/firebase-auth.guard";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {CardService} from "../cards/card.service";
import {MatchService} from "../matches/match.service";
import {Role} from "../users/user.schema";

@Controller('master')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.MASTER)
export class MasterController {
    constructor(private cardService: CardService, private matchService : MatchService) {}

    @Post('cards/:id/regenerate')
    regenerate(@Param('id') id: string, @Body() body) {
        return this.cardService.regenerateCard(id);
    }
    @Get('matches')
    getMyMatches(@Req() req) {
        return this.matchService.getMatchesByMaster(req.user.dbUser.id);
    }
}