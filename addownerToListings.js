const mongoose = require('mongoose');
const Listing = require('./models/listing'); // adjust path if needed
const User = require('./models/user');       // adjust path if needed

const MONGO_URL = 'mongodb://127.0.0.1:27017/your-db-name'; // replace with your DB name

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected to DB');
        return addOwnerToListings();
    })
    .catch((err) => {
        console.log('DB connection error:', err);
    });

const ownerId = '686a59296c5a0d829806da2b'; // paste your chosen user's _id

async function addOwnerToListings() {
    try {
        const updated = await Listing.updateMany(
            { owner: { $exists: false } },         // only listings that don’t have an owner
            { $set: { owner: ownerId } }           // assign the selected owner
        );
        console.log(`${updated.modifiedCount} listings updated.`);
    } catch (err) {
        console.log('Error updating listings:', err);
    } finally {
        mongoose.connection.close();
    }
}



