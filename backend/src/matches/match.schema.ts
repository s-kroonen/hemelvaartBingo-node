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

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  masters: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  players: Types.ObjectId[];

  @Prop({ default: 5 })
  cardSize: number;

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

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  cardSize: number;

  @IsEnum(MatchStatus, { each: true })
  status: MatchStatus;
}
export class UpdateMatchDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  cardSize: number;

  @IsOptional()
  @IsEnum(MatchStatus, { each: true })
  status: MatchStatus;

  @IsOptional()
  @IsArray()
  calledNumbers: number[];

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numbersPerEvent: number;

  @IsOptional()
  @IsBoolean()
  autoNumberDistribution: boolean;

}
