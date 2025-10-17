import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [scores, setScores] = useState({});
  const backendURL = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:8000";

  useEffect(() => {
    const s = io(backendURL);
    setSocket(s);
    s.on("currentQuestion", setQuestion);
    s.on("nextQuestion", setQuestion);
    s.on("winner", (d) => setMessage(`🏆 ${d.username} won! Answer: ${d.answer}`));
    s.on("scores", setScores);
    s.on("errorMsg", setMessage);
    return () => s.disconnect();
  }, []);

  const submit = () => {
    if (!username) return setMessage("Enter username");
    socket.emit("submitAnswer", { username, answer });
    setAnswer("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧮 Caimera Math Quiz</h1>
      <input
        placeholder="Enter name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div style={{ marginTop: 20 }}>
        {question ? (
          <>
            <h3>Question: {question.text}</h3>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer"
            />
            <button onClick={submit}>Submit</button>
          </>
        ) : (
          <p>Loading question...</p>
        )}
      </div>
      <p style={{ color: "green" }}>{message}</p>

      <h2>Leaderboard</h2>
      <ul>
        {Object.entries(scores)
          .sort((a, b) => b[1] - a[1])
          .map(([u, s]) => (
            <li key={u}>
              {u}: {s}
            </li>
          ))}
      </ul>
    </div>
  );
}
