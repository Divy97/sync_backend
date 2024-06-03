const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());
// const createNonStreamingMultipartContent  = require("./utils/vertexAi");
const Document = require("./Document");


const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },  
  transports: ['websocket'], 
});


app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://divyparekh1810:divyparekh1810@cluster0.3hrodsw.mongodb.net/documents",

);

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, username, isEditable) => {
    let document = await Document.findById(documentId);
    if (!document) {
      document = await Document.create({
        _id: documentId,
        data: {},
        owner: username,
        isEditable: isEditable,
      });
    }

    socket.join(documentId);
    socket.emit("load-document", {
      data: document.data,
      owner: document.owner,
      isEditable: document.isEditable,
    });

    socket.on("send-changes", async (delta, username) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data, username) => {
      if (document.owner === username) {
        await Document.findByIdAndUpdate(documentId, { data });
      }
    });

    socket.on("send-generated-text", (generatedText, username) => {
      socket.broadcast
        .to(documentId)
        .emit("receive-generated-text", generatedText);
    });
  });
});

// app.post("/generate-text", async (req, res) => {
//   try {
//     const { text } = req.body;
//     if (!text) {
//       throw new Error("Text is required");
//     }
//     // const response = await createNonStreamingMultipartContent(text);
//     res.status(200).json({ status: "success", response });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });


server.listen(3001, () => {
  console.log("Server running on port 3001");
});