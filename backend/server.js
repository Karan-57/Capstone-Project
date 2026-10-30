const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/config');
const { initSocket } = require('./src/socket');

connectDB();

const server = http.createServer(app);
initSocket(server);

const PORT = config.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} host 0.0.0.0 http://localhost:${PORT}`);
});
