import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  cards: Types.ObjectId[];

  @Prop({
    type: [String],
    enum: Role,
    default: [Role.USER],
  })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
