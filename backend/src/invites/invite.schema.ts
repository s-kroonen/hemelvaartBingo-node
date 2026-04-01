import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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