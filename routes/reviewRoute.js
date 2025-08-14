const express = require("express");
const router = express.Router({mergeParams: true}); //we wrote this bcoz, reviews were not adding
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
// reviews
// 1.post route and also using the validateReview as a middleware here
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// 2. delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;