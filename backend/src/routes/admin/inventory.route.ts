// import { Router } from 'express';
// import { AdminInventoryController } from '../../controllers/admin/inventory.controller.js';
// import { validate } from '../../middlewares/validate.middleware.js';
// import { verifyToken } from '../../middlewares/auth.middleware.js';
// import { requireRoles } from '../../middlewares/role.middleware.js';
// import { autoUpdateInventorySchema, addInventorySchema } from '../../validations/inventory.validation.js';

// const router = Router();
// router.use(verifyToken);

// router.post('/inventory/add', requireRoles(['admin']), validate(addInventorySchema), AdminInventoryController.addInventoryLevels);
// router.put('/inventory/auto-update', requireRoles(['admin', 'staff']), validate(autoUpdateInventorySchema), AdminInventoryController.updateInventoryLevel);

// export default router;