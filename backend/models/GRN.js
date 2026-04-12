import mongoose from "mongoose";

const grnSchema = new mongoose.Schema({
  // Define your schema fields here
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder",
    required: true,
    index: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
    items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      orderedQty: {
        type: Number,
        required: true,
      },
      receivedQty: {
        type: Number,
        required: true,
      },
      damageQty: {
        type: Number,
        default: 0,
      },
    },
  ],

  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  remarks: {
    type: String,
  },
},
{
   timestamps: true
});

const GRN = mongoose.model("GRN", grnSchema);

export default GRN;