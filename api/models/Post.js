import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  bodyType: { type: String, required: true },
  generation: { type: String, required: true },
  engine: { type: String, required: true },
  drivetrain: { type: String, required: true },
  transmission: { type: String, required: true },
  modification: { type: String, required: true },
  color: { type: String, required: true },
  mileage: { type: Number, required: true },
  photos: [{ type: String }],
  ptsType: { type: String, required: true },
  description: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number, required: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

postSchema.index({ brand: 1, model: 1 });

export default mongoose.model("Post", postSchema);
