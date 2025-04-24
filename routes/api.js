const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Utilitário para anonimizar IP (hash simples/truncamento)
function anonymizeIp(ip) {
  // Exemplo: remove o último octeto para IPv4
  if (ip.includes('.')) {
    return ip.split('.').slice(0, 3).join('.') + '.0';
  }
  // Para IPv6, remove o último bloco
  if (ip.includes(':')) {
    return ip.split(':').slice(0, -1).join(':') + ':0';
  }
  return ip;
}

// Banco de dados em memória para likes (substituir por persistência real em produção)
const stockLikes = {};

async function getStockData(symbol) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return {
    stock: data.symbol,
    price: Number(data.latestPrice),
  };
}

router.get('/stock-prices', async (req, res) => {
  let { stock, like } = req.query;
  like = like === 'true' || like === true;
  const ip = anonymizeIp(req.ip || req.connection.remoteAddress || '');

  // Suporte para 1 ou 2 ações
  let stocks = Array.isArray(stock) ? stock : [stock];
  stocks = stocks.map(s => s.toUpperCase());

  try {
    const results = await Promise.all(stocks.map(getStockData));
    if (results.some(r => !r)) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    // Likes
    results.forEach(({ stock }, idx) => {
      if (!stockLikes[stock]) stockLikes[stock] = { count: 0, ips: new Set() };
      if (like && !stockLikes[stock].ips.has(ip)) {
        stockLikes[stock].count++;
        stockLikes[stock].ips.add(ip);
      }
    });

    if (results.length === 1) {
      const stock = results[0].stock;
      return res.json({
        stockData: {
          stock,
          price: results[0].price,
          likes: stockLikes[stock] ? stockLikes[stock].count : 0,
        },
      });
    } else if (results.length === 2) {
      const [s1, s2] = results;
      const l1 = stockLikes[s1.stock] ? stockLikes[s1.stock].count : 0;
      const l2 = stockLikes[s2.stock] ? stockLikes[s2.stock].count : 0;
      return res.json({
        stockData: [
          {
            stock: s1.stock,
            price: s1.price,
            rel_likes: l1 - l2,
          },
          {
            stock: s2.stock,
            price: s2.price,
            rel_likes: l2 - l1,
          },
        ],
      });
    } else {
      return res.status(400).json({ error: 'Invalid stock parameter' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
