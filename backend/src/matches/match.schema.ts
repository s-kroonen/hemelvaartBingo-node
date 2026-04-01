import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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
}
