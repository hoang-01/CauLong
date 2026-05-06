import type { Request, Response, NextFunction } from "express";
import { UserService } from "../../services/user.service.js";
import AppResponse from "../../utils/AppResponse.js";

export class UserController {
    static async searchUserByPhone(req: Request, res: Response, next: NextFunction) {
    try {
        const { phone } = req.query;
        const user = await UserService.getUserByPhone(phone as string);
        if (!user) {
            return AppResponse.error(res, 'Không tìm thấy khách hàng', 404);
        }
        return AppResponse.success(res, user, 'Tìm thấy khách hàng', 200);
    } catch (error) {
        next(error);
    }
}
}