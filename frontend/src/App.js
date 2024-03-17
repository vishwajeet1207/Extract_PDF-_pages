import { useEffect, useState } from "react";
import axios from "axios";
import { pdfjs } from "react-pdf";
import PdfComp from "./pdfComp";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [start, setstart] = useState("")
  const [end, setend] = useState("")
  const [allImage, setAllImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    getPdf();
  }, []);
  const getPdf = async () => {
    const result = await axios.get("http://localhost:5000/get-files");
    console.log(result.data.data);
    setAllImage(result.data.data);
  };

  const submitImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("start", start);
    formData.append("end", end);
    console.log(title, file, start,end);
    console.log(start);

    const result = await axios.post("http://localhost:5000/upload-files",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log(result);
    if (result.data.status == "ok") {
      alert("Uploaded Successfully!!!");
      getPdf();
    }
  };


  const showPdf = (pdf) => {
    

    setPdfFile(`http://localhost:5000/files/${pdf}`)
  };


const downloadExtractedPages = async (pdfName, startPage, endPage) => {
  try {
    const response = await fetch(`http://localhost:5000/extract-pages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfName,
        startPage,
        endPage,
      }),
    });
    const result = await response.json();
    if (result.status === "ok") {
      const url = `http://localhost:5000/download-pdf/${result.newPdfName}`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", result.newPdfName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Error downloading extracted pages:", result.status);
    }
  } catch (error) {
    console.error("Error downloading extracted pages:", error);
  }
};


  return (
    <div className="App">
      <form className="formStyle" onSubmit={submitImage}>
        <h4>Upload Pdf here</h4>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          type="file"
          class="form-control"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        
        <br />
        <button class="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
      <from className="formStyle" onSubmit={submitImage}>
      <h4>Set pages</h4>
        <input
          type="int"
          className="form-control"
          placeholder="Start"
          required
          onChange={(e) => setstart(e.target.value)}
        />
        <br />
        <input
          type="int"
          className="form-control"
          placeholder="End"
          required
          onChange={(e) => setend(e.target.value)}
        />
        <br />

      </from>
      <div className="uploaded">
        <h4>Uploaded PDF:</h4>
        <div className="output-div">
          {allImage == null
            ? ""
            : allImage.map((data) => {
              return (
                <div className="inner-div">
                  <h6>Title: {data.title}</h6>
                  <button
                    className="btn btn-primary"
                    onClick={() => showPdf(data.pdf)}
                  >
                    Show Pdf
                  </button>
                  <br/>
                  <button
                    className="btn btn-secondary"
                    onClick={() => downloadExtractedPages(data.pdf,start,end)}
                  >
                    Download New Extracted Pdf
                  </button>
                </div>
              );
            })}
        </div>
      </div>
      <PdfComp pdfFile={pdfFile} />
    </div>
  );
}

export default App;