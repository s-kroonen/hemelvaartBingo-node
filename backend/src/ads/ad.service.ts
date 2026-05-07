import {Injectable, NotFoundException} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {Ad} from "./ad.shema";
import {Model} from "mongoose";

@Injectable()
export class AdService {
    constructor(@InjectModel(Ad.name) private adModel: Model<Ad>) {}

    async getRandomAd(placement?: string): Promise<Ad> {
        const query: any = { isActive: true };

        if (placement) {
            query.placementTags = placement;
        }

        // MongoDB aggregate to get 1 random document
        const ads = await this.adModel.aggregate([
            { $match: query },
            { $sample: { size: 1 } }
        ]);

        if (!ads.length) {
            throw new NotFoundException('No active ads found for this placement');
        }

        // Convert the raw aggregate result into a Mongoose document to trigger toJSON
        return new this.adModel(ads[0]);
    }

    // ADMIN METHODS: Returns everything
    async findAllForAdmin() {
        const docs = await this.adModel.find().exec();
        // Use toObject({ transform: false }) to ignore the schema's public toJSON transform
        return docs.map(doc => {
            const obj = doc.toJSON({ virtuals: true, transform: false });
            // delete obj._id;
            delete (obj as any)._id;
            return obj;
        });
    }

    async findOneForAdmin(id: string) {
        const doc = await this.adModel.findById(id).exec();
        if (!doc) throw new NotFoundException();

        const obj = doc.toJSON({ virtuals: true, transform: false });
        delete (obj as any)._id;
        return obj;
    }

    // CRUD
    async create(dto: any) {
        return this.adModel.create(dto);
    }

    async update(id: string, dto: any) {
        return this.adModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async remove(id: string) {
        return this.adModel.findByIdAndDelete(id);
    }
}