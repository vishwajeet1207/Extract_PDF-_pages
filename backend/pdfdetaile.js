const mongoose = require("mongoose");

const PdfDetailsSchema = new mongoose.Schema(
  {
    pdf: String,
    title: String,
   
  },
  { collection: "PdfDetails" }
);

const PdfDetailsSchemaStartend = new mongoose.Schema(
  {
    pdf: String,
    title: String,
    start:Number,
    end:Number,
  },
  { collection: "PdfDetailsSchemaStartend" }
);

mongoose.model("PdfDetails", PdfDetailsSchema);
mongoose.model("PdfDetailsSchemaStartend", PdfDetailsSchemaStartend);
