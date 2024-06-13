const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());

const Document = require("./Document");

const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://divyparekh1810:divyparekh1810@cluster0.3hrodsw.mongodb.net/documents"
);

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, username, isEditable) => {
    let document = await Document.findById(documentId);
    if (!document) {
      document = await Document.create({
        _id: documentId,
        data: {},
        owner: username,
        isEditable: Boolean(isEditable), // Cast to Boolean
      });
    }

    socket.join(documentId);
    socket.emit("load-document", {
      data: document.data,
      owner: document.owner,
      isEditable: document.isEditable,
    });

    socket.on("send-changes", async (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });

    socket.on("send-generated-text", (generatedText) => {
      socket.broadcast.to(documentId).emit("receive-generated-text", generatedText);
    });
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
