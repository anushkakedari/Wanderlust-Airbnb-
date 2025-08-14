const axios = require('axios');
const Listing = require("../models/listing");
// const geocode = require('../utils/geocode');


module.exports.index = async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

// new route 
module.exports.renderNewForm = (req, res) =>{
    res.render("listings/new.ejs");
};

// show route
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate: {
            path: "author", //coz, with the reviews, we also want who posted that review
        },
    })
    .populate("owner");
  if(!listing){
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
  }
  console.log(listing);
    res.render("listings/show.ejs", { listing });
};

// create new post


// shraddha didi 
module.exports.createListing = async (req, res, next) => {
    // try {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
    // const { location, country } = req.body.listing;
    // const fullLocation = `${req.body.listing.location}, ${req.body.listing.country}`;
    // console.log("Sending request to Geocoding API...");
    // const geoResponse = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    //         params: {
    //             address: fullLocation,
    //             key: process.env.AIzaSyDp1Cst5HKNndJ0AZ023LNSqIunV9LPTpo, // Store your key in .env
    //         },
    //         timeout: 10000 // 10 seconds timeout
    //     });
    //     console.log("Received response from Geocoding API");

    // if (geoResponse.data.status !== "OK") {
    //         throw new Error("Geocoding failed: " + geoResponse.data.status);
    //     }

    // const coordinates = geoResponse.data.results[0].geometry.location;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    // newListing.geometry = {
    //     type: "Point",
    //     coordinates: [coordinates.lng, coordinates.lat]
    // };
    await newListing.save();
    req.flash("success", "New Listing Created!"); //this msg is flashed when new listing is created
    res.redirect("/listings");
    // } catch (err) {
    //     console.error(err);
    //     req.flash("error", "Failed to create listing. Please try again.");
    //     res.redirect("/listings/new");
    // }
};

// edit route
module.exports.renderEditForm = async (req, res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

// update route
module.exports.updateListing = async (req, res) =>{
    let { id } = req.params; 
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${ id }`);
};

// delete route
module.exports.destroyListing = async (req, res) =>{
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    req.flash("success", "listing deleted successfully");
    res.redirect("/listings");
};