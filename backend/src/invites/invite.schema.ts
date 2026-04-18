import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsEmail, IsMongoId } from 'class-validator';

@Schema()
export class Invite {
  @Prop({ type: Types.ObjectId, ref: 'Match' })
  matchId: Types.ObjectId;

  @Prop({ unique: true })
  token: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiresAt: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsMongoId()
  matchId: string;
}