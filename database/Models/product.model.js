
// global setup
import mongoose from "../global-setup.js";
import slugify from "slugify";
import { badge, DescountType } from "../../src/utilites/enums.js";
import { calculateProductPrice } from "../../src/utilites/calculatePrice.js";


// utils


const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    // Strings Section
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      default: function () {
        return slugify(this.title, { lower: true, replacement: "_" });
      },
    },
    overview: String,
    specs: Object, // Map of Strings
    badge: {
      type: String,
      enum:Object.values(badge),
    },

    // Numbers Section
    price: {
      type: Number,
      required: true,
      min: 50,
    },
    appliedDiscount: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      type: {
        type: String,
        enum:Object.values(DescountType),
        default: DescountType.PERCENTAGE

      },
    },
    appliedPrice: {
      type: Number,
      required: true,
      default: function () {
       return calculateProductPrice(this.price, this.appliedDiscount)

      }

    }, // price , price - discount
    stock: {
      type: Number,
      required: true,
      min: 10,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // Images Section
    Images: {
      URLs: [
        {
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
      ],
      customId: {
        type: String,
        required: true,
        unique: true,
      },
    },

    // Ids sections
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true,toJSON:{virtuals:true} ,toObject:{virtuals:true},id: false }
);


productSchema.virtual('Reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
  
});

export const Product =
  mongoose.models.Product || model("Product", productSchema);

// Amira ezaat
// amira-ezaat
