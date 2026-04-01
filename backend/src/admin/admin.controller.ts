import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import {InviteRepository} from "../invites/invite.repository";

@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private service: AdminService, private inviteRepo: InviteRepository) {}

    @Post('invites')
    createInvite(@Body() body) {
        return this.inviteRepo.create({
            matchId: body.matchId,
            token: crypto.randomUUID(),
            isActive: true,
        });
    }

    @Post('matches')
    createMatch(@Body() body) {
        return this.service.createMatch(body);
    }

    @Get('matches')
    getMatches() {
        return this.service.getAllMatches();
    }

    @Patch('matches/:id')
    updateMatch(@Param('id') id: string, @Body() body) {
        return this.service.updateMatch(id, body);
    }

    @Post('matches/:id/master/:userId')
    assignMaster(
        @Param('id') matchId: string,
        @Param('userId') userId: string,
    ) {
        return this.service.assignMaster(matchId, userId);
    }

    @Get('users')
    getUsers() {
        return this.service.getAllUsers();
    }

    @Post('users/:id/promote')
    promote(@Param('id') id: string) {
        return this.service.promoteToAdmin(id);
    }
}