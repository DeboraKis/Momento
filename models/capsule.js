const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    lockDate: { type: Date, required: true },
    isLocked: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Capsule', capsuleSchema);