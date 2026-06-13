const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  type: { type: String, enum: ['borrow', 'return', 'extend'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: Date, default: Date.now },
  durationDays: { type: Number, default: 30 },
  notes: { type: String },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
