import  models  from "../models/index.js";

export class ProductService {
    static async getAllProducts(facilityId?: number) {
        return await (models.Product as any).findAll({
            where: { is_active: true },
            include: [
                {
                    model: models.ProductVariant,
                    as: 'variants',
                    required: facilityId ? true : false, // Nếu có facilityId, bắt buộc phải có variant
                    include: [
                        {
                            model: models.InventoryLevel,
                            as: 'inventory_levels',
                            required: facilityId ? true : false, // Nếu có facilityId, bắt buộc phải có kho
                            where: facilityId ? { facility_id: facilityId } : {}
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    static async getBySlug(slug: string) {
        return await (models.Product as any).findOne({
            where: { slug, is_active: true },

            include: [
                {
                    model: models.ProductVariant,
                    as: 'variants'
                }
            ]
        });
    }
}
