import { Types } from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Match' })
  matchId: Types.ObjectId;

  @Prop({ type: [[Number]] })
  grid: number[][];

  @Prop({ type: [[Boolean]] })
  marked: boolean[][];
}
