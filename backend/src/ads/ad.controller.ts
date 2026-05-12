import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from "@nestjs/common";
import {AdService} from "./ad.service";
import {FirebaseAuthGuard} from "../auth/firebase-auth.guard";
import {Ad, CreateAdDto} from "./ad.shema";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {Role} from "../users/user.schema";

@UseGuards(FirebaseAuthGuard)
@Controller({path: 'ads', version: '1'})
export class AdController {
    constructor(private adService: AdService) {
    }

    @Get('random')
    async getRandom(@Body('placement') placement: string) {
        const ad = await this.adService.getRandomAd(placement);
        console.log(ad.url);
        return ad;
    }
}

@Controller({path: 'admin/ads', version: '1'})
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdsAdminController {
    constructor(private adService: AdService) {
    }

    @Get()
    async getAll() {
        return this.adService.findAllForAdmin();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.adService.findOneForAdmin(id);
    }

    @Post()
    async create(@Body() dto: CreateAdDto) {
        return this.adService.create(dto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: Partial<CreateAdDto>) {
        return this.adService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.adService.remove(id);
    }
}