import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UserService } from './user.service';

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
}