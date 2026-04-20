import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MatchSchema } from '../matches/match.schema';

@Schema({ timestamps: true })
export class BingoEvent {
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true })
  matchId: Types.ObjectId;

  // Content
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Game state
  @Prop({ default: false })
  called: boolean;

  @Prop()
  calledAt?: Date;

  // Numbers assigned when called
  @Prop({ type: [Number], default: [] })
  numbers: number[];
}

export const EventSchema = SchemaFactory.createForClass(BingoEvent);
EventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id; // Remove the original _id
  },
});
export class CreateEventDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  metadata: Record<string, any>;
}
export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  matchId: Types.ObjectId;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  metadata: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  called: boolean;

  @IsOptional()
  @IsDateString()
  calledAt: Date;

  @IsOptional()
  @IsNumber()
  numbers: number[];
}
