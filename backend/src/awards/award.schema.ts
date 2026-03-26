import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Award {
  @Prop()
  name: string;

  @Prop()
  issuedAt: Date;
}
