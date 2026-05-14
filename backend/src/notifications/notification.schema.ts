import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export enum NotificationTarget {
    ALL = 'all',
    MATCH = 'match',
    USER = 'user',
}

export class SendNotificationDto {
    @IsEnum(NotificationTarget)
    target: NotificationTarget;

    @IsString()
    title: string;

    @IsString()
    body: string;

    /** Required when target === 'match' */
    @IsOptional()
    @IsMongoId()
    matchId?: string;

    /** Required when target === 'user' */
    @IsOptional()
    @IsMongoId()
    userId?: string;
}