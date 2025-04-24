const express = require('express');
const helmet = require('helmet');
const apiRoutes = require('./routes/api');
const cors = require('cors');

const app = express();

// Helmet com CSP restrito
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  })
);

// Middleware CSP manual para FreeCodeCamp
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self'"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api', apiRoutes);

// Página inicial simples
app.get('/', (req, res) => {
  res.send('Stock Price Checker API');
});

// CORS explícito
app.use(cors({ origin: 'self' }));

// Logging detalhado
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip} - Query:`, req.query);
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
