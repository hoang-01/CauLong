// import type { Request, Response, NextFunction } from "express";
// import AppResponse from "../../utils/AppResponse.js";
// import { InventoryService } from "../../services/inventory.service.js";

// export class AdminInventoryController {
//     static async addInventoryLevels(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { variant_id, facility_id, qty_delta, note } = req.body;
//             const result = await InventoryService.addInventory(variant_id, facility_id, qty_delta, note);
//             return AppResponse.success(res, result, 'Nhập kho thành công', 201);
//         } catch (error) {
//             next(error);
//         }
//     }

//     static async updateInventoryLevel(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { variant_id, facility_id, qty_delta, reason, ref_order_id } = req.body;
//             const result = await InventoryService.autoUpdateInventory(
//                 variant_id,
//                 facility_id,
//                 qty_delta,
//                 reason,
//                 ref_order_id
//             );
//             return AppResponse.success(res, result, 'Hệ thống đã cập nhật tồn kho tự động', 200);
//         } catch (error) {
//             next(error);
//         }
//     }
// }