const Listing = require("../models/listing");
const Review = require("../models/review");

// create review route
module.exports.createReview = async (req, res) => {
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
   newReview.author = req.user._id; //just storing the author of that review which is currently logged in user
//    console.log(newReview);
   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();
   req.flash("success", "New review created!");
//    console.log("new review saved");
//    res.send("new review saved");
    res.redirect(`/listings/${listing._id}`);
};

// delete review route
module.exports.destroyReview = async (req, res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
};