const express = require("express");
const fs=require("fs")
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files"));
//mongodb connection----------------------------------------------
const mongoUrl = "mongodb://localhost:27017/pdf";

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));
//multer------------------------------------------------------------
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});



require("./pdfdetaile");
const PdfSchema = mongoose.model("PdfDetails");
const PdfSchemaExtra = mongoose.model("PdfDetailsSchemaStartend")
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  console.log(title);
  const fileName = req.file.filename;
  // const start=req.body.start;
  // const end=req.body.end;
  try {
    await PdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});
app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  console.log(title);
  const fileName = req.file.filename;
  const start=req.body.start;
  const end=req.body.end;
  console.log(start,end);
  try {
    await PdfSchemaExtra.create({ title: title, pdf: fileName,start:start,end:end });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      // console.log(data)
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});


app.post("/extract-pages", async (req, res) => {
    const { pdfName, startPage, endPage ,title} = req.body;
  console.log(pdfName,startPage,endPage);
    try {
      // Load the original PDF
      const pdfDoc = await PDFDocument.load(fs.readFileSync(`./files/${pdfName}`));
    
      // Create a new PDF document
      const extractedPdfDoc = await PDFDocument.create();
  
      // Extract pages from the original PDF and add to the new PDF
      for (let i = startPage; i <= endPage; i++) {
        const [copiedPage] = await extractedPdfDoc.copyPages(pdfDoc, [i - 1]);
        extractedPdfDoc.addPage(copiedPage);
      }
  console.log(extractedPdfDoc);
      // Save the new PDF to a file
      const newPdfBytes = await extractedPdfDoc.save();
      
      const newPdfName = `extracted_${pdfName}`;
      console.log(newPdfName);

      fs.writeFileSync(`./files/${newPdfName}`, newPdfBytes);
     await PdfSchemaExtra.create({pdf:newPdfName,})
      res.send({ status: "ok", newPdfName });
      // res.download(newPdfName)
    } catch (error) {
        console.log(error);
      res.json({ status: error });
    }
  });


  app.get("/download-pdf/:pdfName", (req, res) => {
    const pdfName = req.params.pdfName;
  console.log(pdfName);
    const filePath = `./files/${pdfName}`;
    res.download(filePath, pdfName);
  });
  
app.get("/extract",async(req,res)=>{
  const {pdf}= req.body
  const result = await PdfSchemaExtra.find({pdf})
  res.send(result)
})
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

app.listen(5000, () => {
  console.log("Server Started");
});