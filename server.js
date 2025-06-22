// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = 3621;

function getIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const iface of networkInterface) {
            if (iface.family === 'IPv4' && !iface.internal && iface.netmask == '255.255.255.0') {
                return iface.address;
            }
        }
    }
}
const localIpAddress = getIpAddress()

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Determine the file path: serve index.html for root, otherwise the requested file
    let filePath = path.join(__dirname, req.url === '/' ? 'walkman.html' : req.url);

    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    const extname = path.extname(filePath).toLowerCase();
    switch (extname) {
        case '.html': contentType = 'text/html'; break;
        case '.css':  contentType = 'text/css'; break;
        case '.js':   contentType = 'text/javascript'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png':  contentType = 'image/png'; break;
        case '.jpg':  contentType = 'image/jpeg'; break;
        case '.gif':  contentType = 'image/gif'; break;
        case '.svg':  contentType = 'image/svg+xml'; break;
    }

    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            // Handle file not found (404) or other server errors (500)
            res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/html' });
            res.end(error.code === 'ENOENT' ? '<h1>404 Not Found</h1>' : `<h1>500 Server Error: ${error.code}</h1>`, 'utf-8');
        } else {
            // Serve the file with a 200 OK status
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start the server
if (localIpAddress) {
    server.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${port}/ and at http://${localIpAddress}:${port}/`);
    });
} else {
    console.log('Could not determine local network IP address. Check your network configuration.');
}