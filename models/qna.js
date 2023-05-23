const mongoose = require("mongoose");
const { Schema } = mongoose;

const qnaSchema = new Schema(
  {
    date: String,
    version: { default: "1", type: String },
    data: Object,
    fileName: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Qna", qnaSchema);
