import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Put,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import { IsEnum } from 'class-validator';
import {
  CreateUserDto,
  Role,
  RoleDto,
  UpdateUserDto,
} from '../users/user.schema';
import { InviteService } from '../invites/invite.service';
import { Types } from 'mongoose';
import { CreateInviteDto, UpdateInviteDto } from '../invites/invite.schema';
import { CreateMatchDto, UpdateMatchDto } from '../matches/match.schema';
import { MatchService } from '../matches/match.service';
import { UserService } from '../users/user.service';
import { CardService } from '../cards/card.service';

@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private service: AdminService,
    private inviteService: InviteService,
    private matchService: MatchService,
    private userService: UserService,
    private cardService: CardService,
  ) {}

  // USERS
  @Get('users')
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }
  @Get('users/by-role/:role')
  getUserByRole(@Param('role') role: string) {
    console.log('looking for user with role', role);
    return this.userService.getUserByRole(role);
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Post('users/:id/promote')
  promote(@Param('id') id: string) {
    return this.service.promoteToAdmin(id);
  }

  @Put('users/:userId/role')
  updateRole(@Param('userId') userId: string, @Body() body: RoleDto) {
    return this.service.addRole(userId, body.role);
  }

  @Put('users/:userId/role/remove')
  removeRole(@Param('userId') userId: string, @Body() body: RoleDto) {
    return this.service.removeRole(userId, body.role);
  }

  // MATCHES
  @Get('matches')
  getMatches() {
    return this.matchService.findAll();
  }
  @Get('matches/:id')
  getMatch(@Param('id') id: string) {
    return this.matchService.findById(id);
  }
  @Delete('matches/:id')
  deleteMatch(@Param('id') id: string) {
    return this.matchService.delete(id);
  }
  @Post('matches')
  createMatch(@Body() dto: CreateMatchDto) {
    return this.matchService.createMatch(dto);
  }
  @Put('matches/:id')
  updateMatch(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchService.updateMatch(id, dto);
  }
  @Post('matches/:id/master/:userId')
  assignMaster(@Param('id') matchId: string, @Param('userId') userId: string) {
    return this.matchService.addMaster(matchId, userId);
  }
  @Delete('matches/:id/master/:userId')
  removeMaster(@Param('id') matchId: string, @Param('userId') userId: string) {
    return this.matchService.removeMaster(matchId, userId);
  }

  // INVITES
  @Post('/matches/:matchId/invites')
  createInvite(@Body() dto: CreateInviteDto) {
    return this.inviteService.createInvite(new Types.ObjectId(dto.matchId));
  }
  @Get('/matches/:matchId/invites')
  getForMatch(@Param('matchId') matchId: string) {
    return this.inviteService.findByMatch(matchId);
  }
  @Get('invites')
  getInvites() {
    return this.inviteService.findAll();
  }
  @Get('/invites/:id')
  getInvite(@Param('id') id: string) {
    return this.inviteService.findById(id);
  }
  @Put('/invites/:id')
  updateInvite(@Param('id') id: string, @Body() dto: UpdateInviteDto) {
    return this.inviteService.updateInvite(id, dto);
  }
  @Delete('/invites/:id')
  deleteInvite(@Param('id') id: string) {
    return this.inviteService.delete(id);
  }

  // CARDS
  @Get('/users/:userId/card')
  getUserCard(@Param('userId') userId: string) {
    return this.cardService.findByUserAndCurrentMatch(userId);
  }
  @Post('users/:userId/card/regenerate')
  regenerateCard(@Param('userId') userId: string) {
    return this.cardService.regenerateCard(userId);
  }
}
