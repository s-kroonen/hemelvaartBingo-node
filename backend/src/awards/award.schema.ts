import { Prop, Schema } from '@nestjs/mongoose';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

@Schema()
export class Award {
  @Prop()
  type: AwardType;

  @Prop()
  title: string;

  @Prop()
  description?: string;

  @Prop()
  matchId: string;

  @Prop()
  earnedAt: string;
}
enum AwardType {
  BINGO = 'BINGO',
  FULLCARD = 'FULL_CARD',
  FIRSTBINGO = 'FIRST_BINGO',
  SPECIAL = 'SPECIAL',
}
export class CreateAwardDto {
  @IsEnum(AwardType)
  type: AwardType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  matchId: string;

  @IsDateString()
  earnedAt: string;
}
