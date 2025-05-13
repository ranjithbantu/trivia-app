import mongoose from 'mongoose';

// Define the schema without any default indexes
const schema = new mongoose.Schema({
  _id: { type: Number, required: true }, 
  name: { type: String, required: true },
  count: { type: Number, default: 0 }
}, {
  _id: false,
  timestamps: false,
  versionKey: false,
  strict: true,
  autoIndex: false // Disable automatic indexing
});

// Drop any existing indexes before creating the model
const Category = mongoose.model('Category', schema);
Category.collection.dropIndexes().catch(() => {});

export default Category;