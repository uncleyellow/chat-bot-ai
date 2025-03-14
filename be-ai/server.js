const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const { poolPromise, sql } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// API Chatbot
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        exec(`python chat.py "${message}"`, async (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Chatbot Error:', stderr);
                return res.status(500).json({ error: 'Chatbot failed' });
            }

            const reply = stdout.trim();
            await saveChatToDB(message, reply);
            res.json({ reply });
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Chatbot failed' });
    }
});

// Lưu lịch sử chat vào MSSQL
async function saveChatToDB(userMessage, botReply) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('userMessage', sql.NVarChar, userMessage)
            .input('botReply', sql.NVarChar, botReply)
            .query("INSERT INTO ChatHistory (user_message, bot_reply) VALUES (@userMessage, @botReply)");
    } catch (error) {
        console.error('❌ DB Save Error:', error);
    }
}

// API xem lịch sử chat
app.get('/history', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM ChatHistory ORDER BY created_at DESC");
        res.json(result.recordset);
    } catch (error) {
        console.error('❌ Fetch History Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
