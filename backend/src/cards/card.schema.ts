import { Types } from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Match} from "../matches/match.schema";

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

export const CardSchema = SchemaFactory.createForClass(Card);