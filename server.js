const http = require('http');
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const url = req.url;
    if (!global.clans) global.clans = {};
    if (!global.messages) global.messages = {};
    if (url === '/clans' && req.method === 'GET') {
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(Object.values(global.clans))); return;
    }
    if (url === '/clan/create' && req.method === 'POST') {
      const d = JSON.parse(body);
      const id = Math.random().toString(36).substr(2,6).toUpperCase();
      global.clans[id] = {id, name:d.name, language:d.language, description:d.description, leader:d.username, members:[d.username], xp:0, created:Date.now()};
      global.messages[id] = [];
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(global.clans[id])); return;
    }
    if (url === '/clan/join' && req.method === 'POST') {
      const d = JSON.parse(body);
      const clan = global.clans[d.clanId];
      if (!clan) { res.writeHead(404); res.end(JSON.stringify({error:'Clan not found'})); return; }
      if (!clan.members.includes(d.username)) clan.members.push(d.username);
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(clan)); return;
    }
    if (url.startsWith('/clan/') && url.endsWith('/messages') && req.method === 'GET') {
      const clanId = url.split('/')[2];
      const msgs = global.messages[clanId] || [];
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(msgs.slice(-50))); return;
    }
    if (url.startsWith('/clan/') && url.endsWith('/message') && req.method === 'POST') {
      const clanId = url.split('/')[2];
      const d = JSON.parse(body);
      if (!global.messages[clanId]) global.messages[clanId] = [];
      const msg = {id:Date.now(), username:d.username, text:d.text, time:Date.now()};
      global.messages[clanId].push(msg);
      if (global.messages[clanId].length > 100) global.messages[clanId].shift();
      if (global.clans[clanId]) global.clans[clanId].xp += 1;
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(msg)); return;
    }
    if (url.startsWith('/clan/') && req.method === 'GET') {
      const clanId = url.split('/')[2];
      const clan = global.clans[clanId];
      if (!clan) { res.writeHead(404); res.end(JSON.stringify({error:'Clan not found'})); return; }
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(clan)); return;
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({status:'ok', clans:Object.keys(global.clans).length}));
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Lingua Royale running on port ' + PORT));
