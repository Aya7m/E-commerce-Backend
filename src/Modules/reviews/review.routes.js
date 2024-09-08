import { Router } from "express";
import { approveOrRejectReview, createReview, getAllReviews } from "./review.controller.js";
import { auth } from "../../middleware/auth.js";
import { asyncHandel } from "../../utilites/globalErrorHandling.js";


const ReviewRouter=Router()

ReviewRouter.post('/create',auth(), asyncHandel(createReview));
ReviewRouter.get('/',auth(['user']),asyncHandel(getAllReviews));
ReviewRouter.put('/approve-reject/:reviewId',auth(['admin']),asyncHandel(approveOrRejectReview));

export default ReviewRouter