import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
@Schema()
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'Match' })
  matchId: Types.ObjectId;

  @Prop()
  number: number;

  @Prop()
  name: string;

  @Prop({ default: false })
  called: boolean;
}
