// ================= ENV =================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Study = require("./models/Study");

// ================= GEMINI SETUP =================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ================= EXPRESS APP =================
const app = express();
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
mongoose
  .connect("mongodb://127.0.0.1:27017/studyplanner")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// ================= ADD STUDY =================
app.post("/add-study", async (req, res) => {
  try {
    const { subject, deadline } = req.body;

    const newStudy = new Study({ subject, deadline });
    await newStudy.save();

    res.json({ message: "Study task saved!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// ================= GET STUDIES =================
app.get("/studies", async (req, res) => {
  try {
    const studies = await Study.find().sort({ deadline: 1 });
    res.json(studies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= DELETE STUDY =================
app.delete("/studies/:id", async (req, res) => {
  try {
    await Study.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= UPDATE STUDY =================
app.put("/studies/:id", async (req, res) => {
  try {
    const { subject, deadline } = req.body;

    const updatedStudy = await Study.findByIdAndUpdate(
      req.params.id,
      { subject, deadline },
      { new: true }
    );

    res.json(updatedStudy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= GEMINI AI ROUTE =================
app.post("/generate-plan", async (req, res) => {
  try {
    console.log("AI request received");

    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
      return res.json({ plan: "No tasks available." });
    }

const prompt = `
You are an intelligent study planner.

Create a structured weekly study plan.

Tasks:
${tasks.map(t => `${t.subject} - deadline ${t.deadline}`).join("\n")}

Rules:
- Prioritize closer deadlines
- Divide workload daily
- Keep sessions realistic (1-3 hrs)
- Format nicely using headings and bullet points
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ plan: text });
  } catch (error) {
    console.log("AI ERROR:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// ================= SERVER =================
app.listen(5000, () => console.log("Server started on port 5000 🚀"));