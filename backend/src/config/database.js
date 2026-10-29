const mongoose = require("mongoose");
const config = require("./config");

async function connectDB() {
    try {
        console.log("Mongo URI:", config.MONGO_URI.replace(/\/\/.*@/, "//***@"));

        await mongoose.connect(config.MONGO_URI);

        console.log("MongoDB connected");
        console.log("Database name:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);

        // Self-heal legacy null idempotencyKey records to prevent duplicate key index collisions
        try {
            const transactionModel = require("../model/transaction.model");
            const crypto = require("crypto");
            const nullDocs = await transactionModel.find({ idempotencyKey: null }).select('_id').lean();
            if (nullDocs && nullDocs.length > 0) {
                for (const doc of nullDocs) {
                    await transactionModel.updateOne(
                        { _id: doc._id },
                        { $set: { idempotencyKey: `legacy_${doc._id}_${crypto.randomUUID()}` } }
                    );
                }
                console.log(`[connectDB] Reconciled ${nullDocs.length} legacy transactions with null idempotencyKey`);
            }
        } catch (healErr) {
            console.warn('[connectDB] IdempotencyKey reconciliation warning:', healErr.message);
        }

    } catch (err) {
        console.log("Error connecting to database:", err);
        process.exit(1);
    }
}

module.exports = connectDB;
