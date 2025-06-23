import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {getAllReviews, getNext5Reviews, postReview, likeReview, dislikeReview} from '../controllers/review.controllers.js';

const router = Router();

router.get('/:id', getAllReviews);
router.get('/getNext5/:id/:index', getNext5Reviews);

router.post('/like/:id', likeReview);
router.post('/dislike/:id', dislikeReview);

router.post('/:id', postReview);

export default router;