import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { UserSchema } from '../users/user.schema';
import { BingoMode } from '../shared/BingoConfig';

export class BingoResultDto {
  isValid: boolean;
  message: string;
  prize?: string;
}

export enum MatchStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
@Schema()
export class Match {
  @Prop()
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  masters: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  players: Types.ObjectId[];

  @Prop({
    type: String,
    enum: BingoMode,
    default: BingoMode.BINGO_75
  })
  mode: BingoMode;

  @Prop()
  status: MatchStatus;

  @Prop({ type: [Number], default: [] })
  calledNumbers: number[];

  @Prop({ default: 1 })
  numbersPerEvent: number;

  @Prop({ default: false })
  autoNumberDistribution: boolean;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
MatchSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id; // Remove the original _id
  },
});
export class CreateMatchDto {
  @IsString()
  name: string;

  @IsEnum(MatchStatus, { each: true })
  status: MatchStatus;
  @IsEnum(BingoMode) // Strict validation
  mode: BingoMode;
  @IsOptional()
  @IsNumber()
  @IsPositive()
  numbersPerEvent: number;

  @IsOptional()
  @IsBoolean()
  autoNumberDistribution: boolean;
}
export class UpdateMatchDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(BingoMode)
  mode: BingoMode;

  @IsOptional()
  @IsEnum(MatchStatus, { each: true })
  status: MatchStatus;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numbersPerEvent: number;

  @IsOptional()
  @IsBoolean()
  autoNumberDistribution: boolean;
}
