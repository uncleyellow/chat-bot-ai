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

// 🧠 API Chatbot xử lý tin nhắn
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        console.log(`📩 Sending request to Ollama: ${message}`);
        const response = await axios.post(OLLAMA_URL, {
            model: "tinyllama",
            prompt: message,
            stream: false
        }, {
            headers: { "Content-Type": "application/json" }
        });

        console.log('✅ Ollama Response:', response.data);
        if (!response.data || !response.data.response) {
            throw new Error('Invalid response from Ollama');
        }

        const reply = response.data.response.trim();
        await saveChatToDB(message, reply);
        res.json({ reply });

    } catch (error) {
        console.error('❌ Chatbot Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Chatbot failed' });
    }
});

// 🗃️ Lưu lịch sử chat vào MSSQL
async function saveChatToDB(userMessage, botReply) {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('userMessage', sql.NVarChar, userMessage)
            .input('botReply', sql.NVarChar, botReply)
            .query("INSERT INTO ChatHistory (user_message, bot_reply, created_at) VALUES (@userMessage, @botReply, GETDATE())");
        console.log('💾 Chat saved to DB');
    } catch (error) {
        console.error('❌ DB Save Error:', error);
    }
}

// 📜 API xem lịch sử chat
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


// 🏋️ API Huấn luyện dữ liệu từ MSSQL
app.post('/trainByMSSQL', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM TrainingData");//Lấy tất cả dữ liệu qua database bên Thăng Long đổi câu lệnh querry
        
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

app.get('/train-all', async (req, res) => {
    try {
        const pool = await poolPromise;

        // Lấy danh sách tất cả các bảng(chỉ cần đổi tên database hiện tại là 'ratraco')
        const tablesResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM ratraco.INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
         `); 
    

        let allData = [];

        for (const row of tablesResult.recordset) {
            const tableName = row.TABLE_NAME;
            const dataResult = await pool.request().query(`SELECT * FROM ${tableName}`);
            allData = [...allData, ...dataResult.recordset];
        }

        res.json({ data: allData });
        console.log('✅ Huấn luyện dữ liệu thành công');
    } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu:', error);
        res.status(500).json({ error: 'Không thể lấy dữ liệu' });
    }
});


// 🚀 Khởi động server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
