import { Controller, Get, Put, Req, Res, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from './user.service';
import { matches } from 'class-validator';

@Controller('users')
export class UserController {

  constructor(private service: UserService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const email = req.user.email;

    const user = await this.service.createIfNotExists(email);
    return user;
  }
  @Put('me')
  async updateProfile(@Req() req) {
    const email = req.user.email;

    const user = await this.service.createIfNotExists(email);
    return user;
  }
  @UseGuards(FirebaseAuthGuard)
  @Put("current-match")
  async updateCurrentMatch(@Req() req)  {
    const email = req.user.email;
    const user = await this.service.createIfNotExists(email);
    const match = await this.service.updateCurrentMatch(user.id, req.body.matchId);
    return match;

  }

}