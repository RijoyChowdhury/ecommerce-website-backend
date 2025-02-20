import { Router } from "express";
import { 
    addAddressController, 
    getAddressController, 
    updateAddressController, 
    getAllAddressController, 
    toggleActiveAddressController,
    deleteAddressController,
} from "../controllers/address.controllers.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/add', auth, addAddressController);
router.post('/update/:id', auth, updateAddressController);

router.get('/toggle-active/:id', auth, toggleActiveAddressController);
router.get('/', auth, getAllAddressController);
router.get('/:id', auth, getAddressController);

router.delete('/:id', auth, deleteAddressController);

export default router;