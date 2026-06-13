const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  astId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Software License', 'Digital Course', 'Digital Document'] 
  },
  location: { type: String, default: 'Online' }, // Lab Room / Repository URL
  status: { 
    type: String, 
    enum: ['available', 'maintaining', 'allocated'], 
    default: 'available' 
  },
  totalSlots: { type: Number, default: 1 },
  allocatedSlots: { type: Number, default: 0 },
  is_deleted: { type: Boolean, default: false } // Soft delete
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);
