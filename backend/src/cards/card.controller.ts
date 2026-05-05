import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Query } from 'mongoose';
import { CardService } from './card.service';
import { UserService } from '../users/user.service';
import { MatchService } from '../matches/match.service';
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {Role} from "../users/user.schema";

@Controller({ path: 'cards', version: '1' })
@UseGuards(FirebaseAuthGuard)
export class CardController {
  constructor(
    private cardService: CardService,
    private userService: UserService,
    private matchService: MatchService,
  ) {}

  @Get('my-card')
  async getMyCard(@Req() req) {
    console.log(req.user.dbUser._id);
    const user = await this.userService.findById(req.user.dbUser._id);
    if (!user) throw new NotFoundException('User not found');
    const match = await this.matchService.findById(user.currentMatchID);
    if (!match) throw new NotFoundException('Match Not Found');
    return this.cardService.findByUserAndMatch(user._id, match._id);
  }

  // @UseGuards(RolesGuard)
  // @Roles(Role.MASTER)
  // @Post('regenerate')
  // async regenerate(@Req() req, @Body('matchId') matchId: string) {
  //
  //   const user = await this.userService.findById(req.user.dbUser._id);
  //   if (!user) throw new NotFoundException('User not found');
  //   const match = await this.matchService.findById(matchId);
  //   if (!match) throw new NotFoundException('Match Not Found');
  //   return this.cardService.regenerateCard(user.id, match.id);
  // }

  @Put('cell')
  async toggleCell(
    @Req() req,
    @Body() body: { matchId: string; cellId: string; isChecked: boolean },
  ) {
    const user = await this.userService.findById(req.user.dbUser._id);
    if (!user) throw new NotFoundException('User not found');
    const match = await this.matchService.findById(user.currentMatchID);
    if (!match) throw new NotFoundException('Match Not Found');
    return this.cardService.updateCellState(
      user._id,
      match._id,
      body.cellId,
      body.isChecked,
    );
  }
}