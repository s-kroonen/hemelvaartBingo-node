import {
  Body,
  Controller, Delete,
  Get,
  Param,
  Post, Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { IsMasterGuard } from '../auth/isMaster.guard';
import { CreateInviteDto, UpdateInviteDto } from './invite.schema';
import { Types } from 'mongoose';

@Controller({ path:'invites', version:'1' })
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
@Controller({ path:'matches/:matchId/invites', version:'1' })
@UseGuards(FirebaseAuthGuard, IsMasterGuard)
export class InviteMatchController {
  constructor(private service: InviteService) {}

  @Get()
  async findByMatch(@Req() req) {
    return this.service.findByMatch(req.match._id);
  }
  @Post()
  createInvite(@Body() dto: CreateInviteDto) {
    return this.service.createInvite(dto);
  }
  @Put(':id')
  updateInvite(@Param('id') id: string, @Body() dto: UpdateInviteDto) {
    return this.service.updateInvite(id, dto);
  }
  @Delete(':id')
  deleteInvite(@Param('id') id: string) {
    return this.service.delete(id);
  }
}