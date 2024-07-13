const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, push } = require("firebase/database");
const firebaseConfig = require("./firebaseConfig");

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const CHAT_BOT = "ChatBot";
let chatRoom = "";
let allUsers = [];

// Firebase functions
const createRoom = async (roomId, roomname) => {
  const roomRef = ref(db, "rooms/" + roomId);
  await set(roomRef, {
    roomname: roomname,
    members: {},
    messages: {},
  });
};

const addMember = async (roomId, userId, username) => {
  const membersRef = ref(db, "rooms/" + roomId + "/members/" + userId);
  await set(membersRef, { username: username });
};

const addMessage = async (roomId, message, username) => {
  const messagesRef = ref(db, "rooms/" + roomId + "/messages");
  await push(messagesRef, {
    message: message,
    username: username,
    timestamp: Date.now(),
  });
};

// Listen for when the client connects via socket.io-client
io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  // Add a user to a room
  socket.on("join_room", async (data) => {
    const { username, room } = data;
    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);

    socket.to(room).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);

    socket.join(room);

    let __createdtime__ = Date.now();

    socket.to(room).emit("receive_message", {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    // Send welcome msg to user that just joined chat only
    socket.emit("receive_message", {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });

    // Add member to the room in Firebase
    await addMember(room, socket.id, username);

    socket.on("send_message", async (data) => {
      const { message, username, room, __createdtime__ } = data;

      // Send message to all users in the room, including the sender
      io.in(room).emit("receive_message", data);

      // Save message in the Firebase database
      try {
        await addMessage(room, message, username);
        console.log("Message saved successfully.");
      } catch (err) {
        console.log("Error saving message:", err);
      }
    });
  });

  // Handle user disconnect
  socket.on("end-chat", () => {
    console.log(`User disconnected ${socket.id}`);

    // Remove user from allUsers array
    allUsers = allUsers.filter((user) => user.id !== socket.id);

    // Notify remaining users in the room
    const roomUsers = allUsers.filter((user) => user.room === chatRoom);
    io.in(chatRoom).emit("chatroom_users", roomUsers);

    const __createdtime__ = Date.now();
    socket.to(chatRoom).emit("receive_message", {
      message: `User has left the chat`,
      username: CHAT_BOT,
      __createdtime__,
    });
  });
});

server.listen(4000, () => console.log("Server is running on port 4000"));
