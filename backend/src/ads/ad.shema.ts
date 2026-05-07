// ads/ad.schema.ts
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {IsArray, IsBoolean, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString} from "class-validator";
export enum AdType {
    PHOTO = 'photo',
    VIDEO = 'video',
}

@Schema({timestamps: true})
export class Ad {
    @Prop({required: true, enum: AdType})
    type: AdType;

    @Prop({required: true})
    url: string;

    @Prop({default: 5})
    forcedWatchTime: number;

    // Backend/Admin Only Data
    @Prop({required: true})
    name: string; // Internal name for the admin panel

    @Prop({default: true})
    isActive: boolean;

    @Prop({type: [String], default: []})
    placementTags: string[]; // e.g., ['main_menu', 'bingo_overlay']

    @Prop({type: Object, default: {}})
    metadata: Record<string, any>; // For dynamic video settings, aspect ratios, etc.

    @Prop({default: 0})
    clickCount: number;
}

export const AdSchema = SchemaFactory.createForClass(Ad);

AdSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete (ret as any)._id;
        // Optionally hide internal admin fields from the public API
        delete (ret as any).name;
        delete (ret as any).isActive;
        delete (ret as any).clickCount;
    },
});

export class CreateAdDto {
    @IsEnum(AdType)
    type: AdType;

    @IsString()
    url: string;

    @IsNumber()
    forcedWatchTime: number;

    @IsString()
    name: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    placementTags: string[];

    @IsOptional()
    metadata?: Record<string, any>;

    @IsOptional()
    @Prop({default: true})
    isActive: boolean;



}