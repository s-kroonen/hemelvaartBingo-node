import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from './user.service';
import { MatchService } from '../matches/match.service';
import { Types } from 'mongoose';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private matchService: MatchService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const email = req.user.email;

    const user = await this.userService.createIfNotExists(email);
    return user;
  }

  @Put('me')
  async updateProfile(@Req() req) {
    const email = req.user.email;

    const user = await this.userService.createIfNotExists(email);
    return user;
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('me/current-match')
  async updateCurrentMatch(@Req() req, @Body() body: { matchId: string }) {
    const email = req.user.email;
    const user = await this.userService.createIfNotExists(email);

    return this.userService.updateCurrentMatch(user.id, body.matchId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me/current-match')
  async getCurrentMatchContext(@Req() req) {
    const email = req.user.email;
    const user = await this.userService.createIfNotExists(email);

    return this.userService.getCurrentMatchContext(user.id);
  }
  @UseGuards(FirebaseAuthGuard)
  @Get('me/matches')
  async getMyMatches(@Req() req) {
    const email = req.user.email;

    const user = await this.userService.createIfNotExists(email);

    const userId = new Types.ObjectId(user._id);
    return this.matchService.getPlayerMatches(userId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me/matches/:id')
  async getMatchContext(@Param('id') matchId: string, @Req() req) {
    const email = req.user.email;

    const user = await this.userService.createIfNotExists(email);

    return this.userService.getMatchContext(user._id, matchId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('me/card/cell')
  async toggleCell(
    @Req() req,
    @Body() body: { cellId: string; isChecked: boolean },
  ) {
    const email = req.user.email;

    const user = await this.userService.createIfNotExists(email);
    if (!user.currentMatchID) {
      throw new NotFoundException('No current match selected');
    }

    return this.userService.updateCellState(
      user._id,
      user.currentMatchID,
      body.cellId,
      body.isChecked,
    );
  }
}
