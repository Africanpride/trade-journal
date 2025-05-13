// server.js
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3002;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/trade_journal";
console.log("Mongo URI:", MONGO_URI);

// --- middleware to parse JSON and handle errors
app.use(express.json({ strict: true, limit: "100kb" }));
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    console.error("Invalid JSON received:", err.message);
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});

// --- CORS setup
// Allow 127.0.0.1, localhost, and any other origin and all ports
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


// --- MongoDB setup
let tradesCollection;
MongoClient.connect(MONGO_URI)
  .then((client) => {
    const db = client.db();
    tradesCollection = db.collection("trades");
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  });

// --- GET all trades
app.get("/test", async (req, res) => {
  try {

    console.log("#### WORKING ####:");
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});
// --- GET all trades
app.get("/trades", async (req, res) => {
  try {
    const all = await tradesCollection.find().sort({ _id: -1 }).toArray();
    res.json(all);
    console.log("Fetched trades:", all);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});

// --- POST trade
app.post("/trades", async (req, res) => {
  try {
    const trade = req.body;
    const result = await tradesCollection.updateOne(
      { ticket: trade.ticket },
      { $set: trade },
      { upsert: true }
    );

    res.json({
      status: "ok",
      operation: result.upsertedCount ? "inserted" : "updated",
      ticket: trade.ticket,
    });
  } catch (err) {
    console.error("Upsert error:", err);
    res.status(500).json({ error: "DB upsert failed" });
  }
});

// --- global error handler
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Server error" });
});

// --- start server
app.listen(port, () => {
  console.log(`✅ Trade journal server running on http://localhost:${port}`);
});
