import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserSchema } from '../users/user.schema';

@Schema({ timestamps: true })
export class BingoCell {
  @Prop({ required: true })
  value: string;

  @Prop({ default: false })
  isChecked: boolean;

  @Prop({ required: true })
  position: number;
}

const BingoCellSchema = SchemaFactory.createForClass(BingoCell);
BingoCellSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id; // Remove the original _id
  },
});

@Schema({ timestamps: true })
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Match', required: true })
  matchId: Types.ObjectId;

  @Prop({ type: [BingoCellSchema], default: [] })
  cells: BingoCell[];
}

export const CardSchema = SchemaFactory.createForClass(Card);
CardSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id; // Remove the original _id
  },
});
