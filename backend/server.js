import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { generateQuestion } from "./utils/generateQuestion.js";
import { getScores, incrementScore } from "./scoresStore.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let currentQuestion = generateQuestion();
let currentWinner = null;

async function broadcastScores() {
  const users = await getScores();
  io.emit("scores", users);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.emit("currentQuestion", { id: currentQuestion.id, text: currentQuestion.text });
  broadcastScores();

  socket.on("submitAnswer", async ({ username, answer }) => {
    if (!username) return socket.emit("errorMsg", "Username required");
    if (currentWinner) return socket.emit("roundOver", { winner: currentWinner });

    const num = Number(answer);
    if (Number.isNaN(num)) return socket.emit("errorMsg", "Answer must be a number");

    if (num === currentQuestion.answer && !currentWinner) {
      currentWinner = username;
      await incrementScore(username);
      io.emit("winner", { username, answer: currentQuestion.answer });
      broadcastScores();
      setTimeout(() => {
        currentQuestion = generateQuestion();
        currentWinner = null;
        io.emit("nextQuestion", { id: currentQuestion.id, text: currentQuestion.text });
      }, 3000);
    }
  });
});

app.get("/api/scores", async (req, res) => res.json(await getScores()));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
