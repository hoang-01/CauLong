// import models  from "../models/index.js";
// import ApiError from '../utils/ErrorClass.js';
// import sequelize from '../config/database.js';
// import { InventoryReason } from "../validations/inventory.validation.js";

// export class InventoryService {
//     static async addInventory(variantId: number, facilityId: number, qtyDelta: number, note: string) {
//         const t = await sequelize.transaction();
//         try {
//         // Tận dụng UNIQUE index (variant_id, facility_id) để Tìm hoặc Tạo mới
//         const [inventory, created] = await models.InventoryLevel.findOrCreate({
//             where: { variant_id: variantId, facility_id: facilityId },
//             defaults: { 
//                 variant_id: variantId,
//                 facility_id: facilityId, // Cập nhật theo schema mới
//                 quantity_on_hand: qtyDelta 
//             },
//             transaction: t
//         });

//         // Nếu đã có sẵn trong kho, cộng dồn thêm số lượng nhập
//         if (!created) {
//             await inventory.increment('quantity_on_hand', { by: qtyDelta, transaction: t });
//         }

//         // Ghi log vào bảng inventory_movements với lý do 'import'
//         await models.InventoryMovement.create({
//             variant_id: variantId,
//             facility_id: facilityId, // Cập nhật theo schema mới
//             qty_delta: qtyDelta,
//             reason: InventoryReason.IMPORT,
//             note: note
//         }, { transaction: t });

//         await t.commit();
//         return { message: 'Nhập kho thành công', inventory };
//         } catch (error) {
//         await t.rollback();
//         throw new ApiError('Lỗi khi thao tác với dữ liệu kho', 500);
//         }
//     }

//   // 6. Cập nhật tồn kho tự động (Trừ kho khi Bán, Cộng kho khi Trả hàng)
//   static async autoUpdateInventory(variantId: number, facilityId: number, qtyDelta: number, reason: InventoryReason, orderId?: number) {
//         const t = await sequelize.transaction();
//         try {
//         const inventory = await models.InventoryLevel.findOne({
//             where: { variant_id: variantId, facility_id: facilityId },
//             transaction: t
//         });

//         // Kiểm tra nghiệp vụ: Nếu là xuất kho (qtyDelta âm) thì phải xem kho còn đủ hàng không
//         if (!inventory || (qtyDelta < 0 && inventory.quantity_on_hand + qtyDelta < 0)) {
//             throw new ApiError('Số lượng tồn kho không đủ để xử lý đơn hàng', 400);
//         }

//         // Cập nhật số lượng
//         await inventory.increment('quantity_on_hand', { by: qtyDelta, transaction: t });

//         // Ghi log chuyển động kho
//         await models.InventoryMovement.create({
//             variant_id: variantId,
//             facility_id: facilityId, // Cập nhật theo schema mới
//             qty_delta: qtyDelta,
//             reason:  reason, // Hoặc reason khác tùy theo logic của bạn
//             ref_order_id: orderId ?? null
//         }, { transaction: t });

//         await t.commit();
//         return { message: 'Cập nhật hệ thống kho tự động thành công' };
//         } catch (error) {
//         await t.rollback();
//         throw error; 
//         }
//     }
// }