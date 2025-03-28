const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { poolPromise, sql } = require('./db');

const app = express();
const PORT = 3000;
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate'; // Chỉnh đúng localhost

app.use(cors());
app.use(bodyParser.json());

// 🧠 API Chatbot xử lý tin nhắn theo user_id
app.post('/chat', async (req, res) => {
    const { user_id, message } = req.body;
    if (!user_id || !message) {
        return res.status(400).json({ error: 'User ID và Message là bắt buộc' });
    }

    try {
        console.log(`📩 User ${user_id} gửi: ${message}`);
        const response = await axios.post(OLLAMA_URL, {
            model: "tinyllama",
            prompt: message,
            stream: false
        }, {
            headers: { "Content-Type": "application/json" }
        });

        if (!response.data || !response.data.response) {
            throw new Error('Lỗi phản hồi từ Ollama');
        }

        const reply = response.data.response.trim();
        await saveChatToDB(user_id, message, reply);
        res.json({ reply });

    } catch (error) {
        console.error('❌ Lỗi Chatbot:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Chatbot thất bại' });
    }
});

// 🗃️ Lưu lịch sử chat theo user_id
async function saveChatToDB(user_id, userMessage, botReply) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('userMessage', sql.NVarChar, userMessage)
            .input('botReply', sql.NVarChar, botReply)
            .query(`
                INSERT INTO ChatHistory (user_id, user_message, bot_reply, created_at) 
                VALUES (@user_id, @userMessage, @botReply, GETDATE())`);
        console.log(`💾 Chat của User ${user_id} đã được lưu`);
    } catch (error) {
        console.error('❌ Lỗi khi lưu lịch sử chat:', error);
    }
}

// 📜 API lấy lịch sử chat theo user_id
app.get('/history/:user_id', async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(400).json({ error: 'User ID là bắt buộc' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT * FROM ChatHistory 
                WHERE user_id = @user_id 
                ORDER BY created_at DESC`);
        res.json(result.recordset);
    } catch (error) {
        console.error('❌ Lỗi khi lấy lịch sử chat:', error);
        res.status(500).json({ error: 'Không thể lấy lịch sử chat' });
    }
});

// 🏋️ API Huấn luyện dữ liệu từ MSSQL
app.post('/trainByMSSQL', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM TrainingData"); // Đổi query theo database của bạn

        if (!result.recordset.length) {
            return res.status(400).json({ error: 'Không có dữ liệu huấn luyện' });
        }

        console.log(`📚 Đang huấn luyện với ${result.recordset.length} mẫu dữ liệu`);

        for (const row of result.recordset) {
            await axios.post(OLLAMA_URL, {
                model: "tinyllama",
                prompt: `Học dữ liệu: ${row.data}`,
                stream: false
            }, { headers: { "Content-Type": "application/json" } });
        }

        res.json({ message: 'Huấn luyện hoàn tất!' });
    } catch (error) {
        console.error('❌ Lỗi khi huấn luyện:', error);
        res.status(500).json({ error: 'Huấn luyện thất bại' });
    }
});

// 🚀 Khởi động server
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
