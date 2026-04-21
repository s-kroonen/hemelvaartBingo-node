import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MASTER = 'master',
}
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  username: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Award' }] })
  awards: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Match' })
  currentMatchID: Types.ObjectId;


  @Prop({
    type: [String],
    enum: Role,
    default: [Role.USER],
  })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id; // Remove the original _id
  },
});
export class RoleDto {
  @IsEnum(Role)
  role: Role;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsMongoId()
  currentMatchId?: string;
}
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsMongoId()
  currentMatchId?: string;
}