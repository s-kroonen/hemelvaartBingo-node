import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { InviteService } from './invite.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('invites')
export class InviteController {
  constructor(private service: InviteService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('join/:token')
  async join(@Body() body, @Req() req, token: string) {
    return this.service.joinMatch(token, req.user.email);
  }
}
