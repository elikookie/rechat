import styles from "./styles.module.css";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React from "react";
import { useState, useEffect } from "react";

const Home = ({ username, setUsername, room, setRoom, socket }) => {
  const [open, setOpen] = React.useState(false);

  // room logic

  const joinRoom = () => {
    if (room !== "" && username !== "") {
      socket.emit("join_room", { username, room });
    }
  };

  // Username dialogue logic
  useEffect(() => {
    if (!username) {
      setOpen(true);
    }
  }, [username]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    setUsername(username);
    setOpen(false);
  };

  return (
    <main>
      <br></br>
      <img src="../logo.png" alt=";) RECHAT" />

      <div className={styles.grid2x2}>
        <div className={styles.box}>
          <div className={styles.messageBox}>
            <input type="text" placeholder="Type in message..." />
          </div>
        </div>

        <div className={styles.box}>
          <br></br>
          <br></br>
          <br></br>
          <br></br>

          <h2>Chatting with name</h2>

          <br></br>
          <br></br>
          <br></br>
          <br></br>

          <div className={styles.vertical}>
            <button
              type="button"
              onClick={() => {
                setRoom("New");
                joinRoom();
              }}
            >
              New Chat
            </button>
            <button
              type="button"
              onClick={() => {
                setRoom("World");
                joinRoom();
              }}
            >
              World Chat
            </button>
            <button
              type="button"
              onClick={() => {
                setRoom("Group5");
                joinRoom();
              }}
            >
              Group of 5 Chat
            </button>
          </div>

          <br></br>
          <br></br>
          <br></br>
          <br></br>

          <div className={styles.vertical}>
            <button type="button" onClick={handleClickOpen}>
              Change name
            </button>
            <button type="button">End Chat</button>
          </div>
        </div>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Your Username</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your username that you would like to use for Re:chat
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </main>
  );
};

export default Home;
