import { Router } from "express";
import { 
    addAddressController, 
    getAddressController, 
    updateAddressController, 
    getAllAddressController, 
} from "../controllers/address.controllers.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/add', auth, addAddressController);
router.post('/update', auth, updateAddressController);
router.get('/', auth, getAllAddressController);
router.get('/:id', auth, getAddressController);

export default router;