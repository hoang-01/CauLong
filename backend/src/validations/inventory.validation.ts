// import { z } from 'zod';

// // ===============================================================
// // KHAI BÁO ENUM TRỰC TIẾP TẠI ĐÂY
// // ===============================================================
// export enum InventoryReason {
//   SALE = 'sale',
//   RETURN = 'return',
//   ADJUSTMENT = 'adjustment',
//   IMPORT = 'import'
// }

// // ... (Các schema khác như createProductSchema giữ nguyên)

// // ===============================================================
// // SCHEMA KIỂM TRA TỒN KHO TỰ ĐỘNG
// // ===============================================================
// export const autoUpdateInventorySchema = z.object({
//     body: z.object({
//         variant_id: z.number().positive('ID biến thể phải lớn hơn 0'),
//         facility_id: z.number().positive('ID cơ sở phải lớn hơn 0'),
        
//         qty_delta: z.number({ message: 'Số lượng biến động là bắt buộc' }), 
        
//         // Zod sẽ dùng thẳng Enum được khai báo ở trên để kiểm tra
//         reason: z.nativeEnum(InventoryReason, { 
//              message: 'Lý do kho không hợp lệ (chỉ nhận: sale, return, adjustment, import)'
//         }),
        
//         ref_order_id: z.number().positive().optional() 
//     })
// });

// export const addInventorySchema = z.object({
//     body: z.object({
//         // Bắt buộc phải biết là nhập cho biến thể nào (ví dụ: Vợt 3U màu Đỏ)
//         variant_id: z.number({ message: 'ID biến thể (variant_id) là bắt buộc' })
//             .positive('ID biến thể phải lớn hơn 0'),
            
//         // Bắt buộc phải biết là cất vào cơ sở/kho nào
//         facility_id: z.number({ message: 'ID cơ sở (facility_id) là bắt buộc' })
//             .positive('ID cơ sở phải lớn hơn 0'),
        
//         // Số lượng nhập thêm vào bắt buộc phải là SỐ DƯƠNG (không ai đi nhập kho -5 sản phẩm cả)
//         qty_delta: z.number({ message: 'Số lượng nhập là bắt buộc' })
//             .positive('Số lượng nhập kho phải lớn hơn 0'), 
        
//         // Ghi chú (VD: "Nhập hàng lô tháng 10") - Có thể bỏ trống
//         note: z.string().nullish()
//     })
// });

// export type AutoUpdateInventoryInput = z.infer<typeof autoUpdateInventorySchema>['body'];