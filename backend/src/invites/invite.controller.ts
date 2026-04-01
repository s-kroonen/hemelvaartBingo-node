import {Body, Controller, Post, Req, UseGuards} from "@nestjs/common";
import {InviteService} from "./invite.service";
import {FirebaseAuthGuard} from "../auth/firebase-auth.guard";

@Controller('invites')
export class InviteController {
    constructor(private service: InviteService) {}

    @UseGuards(FirebaseAuthGuard)
    @Post('join')
    async join(@Body() body, @Req() req) {
        return this.service.joinMatch(
            body.token,
            req.user.email,
        );
    }
}