const express = require('express');
const helmet = require('helmet');
const apiRoutes = require('./routes/api');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api', apiRoutes);

// Página inicial simples
app.get('/', (req, res) => {
  res.send('Stock Price Checker API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
