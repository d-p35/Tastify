import { config } from 'dotenv';
import { createServer } from 'http';
import { parse } from 'url';
import handler from './api/parseRecipe.js';

// Load environment variables
config();

const server = createServer((req, res) => {
  const parsed = parse(req.url || '', true);
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (parsed.pathname === '/api/parseRecipe') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const mockReq = {
          method: req.method,
          body: body ? JSON.parse(body) : {},
          headers: req.headers
        };
        
        const mockRes = {
          status: (code: number) => ({
            json: (data: any) => {
              res.writeHead(code, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data, null, 2));
            }
          }),
          setHeader: (key: string, value: string) => res.setHeader(key, value)
        };
        
        // @ts-ignore
        handler(mockReq, mockRes);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`🚀 Tastify Backend running on http://localhost:${port}`);
  console.log(`📡 API endpoint: http://localhost:${port}/api/parseRecipe`);
  console.log('');
  console.log('Test with:');
  console.log(`curl -X POST http://localhost:${port}/api/parseRecipe \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"videoUrl": "https://www.tiktok.com/@user/video/123"}\'');
});
