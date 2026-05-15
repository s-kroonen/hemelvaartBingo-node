import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Delete,
    Put,
    NotFoundException,
    BadRequestException,
    Query,
} from '@nestjs/common';
import {FirebaseAuthGuard} from '../auth/firebase-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {AdminService} from './admin.service';
import {
    CreateUserDto,
    Role,
    RoleDto,
    UpdateUserAdminDto,
} from '../users/user.schema';
import {InviteService} from '../invites/invite.service';
import {CreateInviteDto, UpdateInviteDto} from '../invites/invite.schema';
import {CreateMatchDto, UpdateMatchDto} from '../matches/match.schema';
import {MatchService} from '../matches/match.service';
import {UserService} from '../users/user.service';
import {CardService} from '../cards/card.service';
import {CreateAdDto} from '../ads/ad.shema';
import {NotificationPayload, NotificationService} from '../notifications/notification.service';
import {NotificationTarget, SendNotificationDto} from "../notifications/notification.schema";

@Controller({path: 'admin', version: '1'})
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(
        private adService: AdminService,
        private service: AdminService,
        private inviteService: InviteService,
        private matchService: MatchService,
        private userService: UserService,
        private cardService: CardService,
        private notificationService: NotificationService,
    ) {
    }

    // ─── USERS ───────────────────────────────────────────────────────────────

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
        return this.userService.getUserByRole(role);
    }

    @Post('users')
    createUser(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto);
    }

    @Put('users/:id')
    updateUser(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
        return this.userService.updateUser(id, dto);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }

    @Put('users/:userId/role')
    updateRole(@Param('userId') userId: string, @Body() body: RoleDto) {
        return this.service.addRole(userId, body.role);
    }

    @Put('users/:userId/role/remove')
    removeRole(@Param('userId') userId: string, @Body() body: RoleDto) {
        return this.service.removeRole(userId, body.role);
    }

    // ─── MATCHES ─────────────────────────────────────────────────────────────

    @Get('matches')
    getMatches() {
        return this.matchService.findAll();
    }

    @Get('matches/:id')
    getMatch(@Param('id') id: string) {
        return this.matchService.findById(id);
    }

    @Delete('matches/:id')
    async deleteMatch(@Param('id') id: string) {
        const match = await this.matchService.findById(id);
        if (!match) throw new NotFoundException(`Match with id ${id} not found`);
        return this.matchService.delete(match._id);
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

    // ─── INVITES ─────────────────────────────────────────────────────────────

    @Post('/matches/:matchId/invites')
    createInvite(@Body() dto: CreateInviteDto) {
        return this.inviteService.createInvite(dto);
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

    // ─── CARDS ───────────────────────────────────────────────────────────────

    @Get('/users/:userId/card')
    getUserCard(@Param('userId') userId: string) {
        return this.service.findByUserAndCurrentMatch(userId);
    }

    @Post('users/:userId/card/regenerate')
    regenerateCard(@Param('userId') userId: string) {
        return this.cardService.regenerateCard(userId);
    }

    // ─── ADS ─────────────────────────────────────────────────────────────────

    @Post('ads')
    async createAd(@Body() dto: CreateAdDto) {
        return this.adService.create(dto);
    }

    // ─── NOTIFICATIONS ───────────────────────────────────────────────────────

    /**
     * POST /api/v1/admin/notifications/send
     * Body: SendNotificationDto
     * Returns: { sent: number }  — number of FCM tokens the message was sent to
     */
    @Post('notifications/send')
    async sendNotification(@Body() dto: SendNotificationDto) {
        const {target, title, body, matchId, userId} = dto;

        const payload: NotificationPayload = {title, body, type: 'ADMIN_MESSAGE', matchId, userId};

        if (target === NotificationTarget.ALL) {
            return this.notificationService.sendToAll(payload);
        }

        if (target === NotificationTarget.MATCH) {
            if (!matchId) throw new BadRequestException('matchId is required when target is "match"');
            await this.notificationService.sendToMatch(matchId, payload, {includeMasters: true});
            return {sent: true};
        }

        if (target === NotificationTarget.USER) {
            if (!userId) throw new BadRequestException('userId is required when target is "user"');
            await this.notificationService.sendToUser(userId, payload);
            return {sent: true};
        }
    }

    /**
     * GET /api/v1/admin/notifications/preview
     * Query params: target, matchId?, userId?
     * Returns a recipient count so the UI can show a confirmation before sending.
     */
    @Get('notifications/preview')
    async previewRecipients(
        @Query('target') target: string,
        @Query('matchId') matchId?: string,
        @Query('userId') userId?: string,
    ) {
        if (target === NotificationTarget.ALL) {
            const users = await this.userService.getUsers();
            return {count: users.length};
        }

        if (target === NotificationTarget.MATCH) {
            if (!matchId) throw new BadRequestException('matchId required');
            const match = await this.matchService.findById(matchId);
            if (!match) throw new NotFoundException(`Match ${matchId} not found`);
            const count = (match.masters?.length ?? 0) + (match.players?.length ?? 0);
            return {count, matchName: match.name};
        }

        if (target === NotificationTarget.USER) {
            if (!userId) throw new BadRequestException('userId required');
            const user = await this.userService.getUser(userId);
            if (!user) throw new NotFoundException(`User ${userId} not found`);
            return {count: 1, email: user.email};
        }

        return {count: 0};
    }
}