const sql = require('mssql');

const config = {
    user: 'sa', // Thay bằng tài khoản SQL của bạn
    password: '1', // Thay bằng mật khẩu của bạn
    server: 'localhost', // Nếu SQL chạy trên máy, để 'localhost', nếu dùng Azure thì thay bằng server name
    database: 'ChatBotDB',
    options: {
        encrypt: false, // Nếu dùng Azure, đặt là true
        enableArithAbort: true
    }
};

// Tạo pool kết nối
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err.message);
    });

module.exports = { sql, poolPromise };
