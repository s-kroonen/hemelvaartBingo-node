import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class InviteMetadata {
  watchAdBeforeJoin: boolean;
  joinAsRole: 'user' | 'master' | 'admin';
  description?: string;
}
@Schema()
export class Invite {
  @Prop()
  name: string;
  @Prop({ type: Types.ObjectId, ref: 'Match' })
  matchId: Types.ObjectId;
  @Prop({ unique: true })
  token: string;
  @Prop({ default: true })
  isActive: boolean;
  @Prop()
  expiresAt: Date;
  @Prop()
  createdAt: Date;
  @Prop({ type: InviteMetadata })
  metadata: InviteMetadata;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
InviteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id; // Remove the original _id
  },
});
export class CreateInviteDto {
  @IsMongoId()
  matchId: string;
}
export class UpdateInviteDto {
  @IsOptional()
  @IsMongoId()
  matchId: string;

  @IsOptional()
  name: string;

  @IsOptional()
  token: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDate()
  expiresAt: Date;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  metadata: InviteMetadata;
}
