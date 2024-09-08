import mongoose from "../global-setup.js";
import { Product } from "./product.model.js";
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // TODO: Change to true after adding authentication
    },
    Images: {
      secure_url: {
        type: String,
        required: true,

      },
      public_id: {
        type: String,
        required: true,
        unique: true,
      },
    },
    customId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

categorySchema.post("findOneAndDelete", async function () {
  const _id = this.getQuery()._id
  const deleteSubcatagory = await mongoose.models.SubCategory.deleteMany({ categoryId: _id })

  console.log("subCatagory are delete already..", deleteSubcatagory);


  if (deleteSubcatagory.deletedCount) {

    const deletebrand = await mongoose.models.Brand.deleteMany({ categoryId: _id })

    console.log("brand are delete already..", deletebrand);

    if (deletebrand.deletedCount) {
      await mongoose.models.Product.deleteMany({ categoryId: _id })
    }

  }

  // next()
  
})

export const Category =
  mongoose.models.Category || model("Category", categorySchema);
