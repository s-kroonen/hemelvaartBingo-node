import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('invites')
export class InviteController {
  constructor(private service: InviteService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('join/:token')
  async join(@Param('token') token: string,@Body() body, @Req() req) {
    return this.service.joinMatch(token, req.user.email);
  }
  @Get('token/:token')
  async findByToken(@Param('token') token: string) {
    return this.service.findByToken(token);
  }
}
