const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

describe('Functional Tests', function () {
  this.timeout(5000);
  let likesBefore = 0;

  it('Viewing one stock: GET request to /api/stock-prices/', async () => {
    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('stockData');
    expect(res.body.stockData).to.include.all.keys('stock', 'price', 'likes');
    expect(res.body.stockData.stock).to.equal('GOOG');
    expect(res.body.stockData.price).to.be.a('number');
    expect(res.body.stockData.likes).to.be.a('number');
    likesBefore = res.body.stockData.likes;
  });

  it('Viewing one stock and liking it: GET request to /api/stock-prices/', async () => {
    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('stockData');
    expect(res.body.stockData).to.include.all.keys('stock', 'price', 'likes');
    expect(res.body.stockData.stock).to.equal('GOOG');
    expect(res.body.stockData.likes).to.be.at.least(likesBefore + 1);
    likesBefore = res.body.stockData.likes;
  });

  it('Viewing the same stock and liking it again: GET request to /api/stock-prices/', async () => {
    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('stockData');
    expect(res.body.stockData).to.include.all.keys('stock', 'price', 'likes');
    expect(res.body.stockData.stock).to.equal('GOOG');
    expect(res.body.stockData.likes).to.equal(likesBefore);
  });

  it('Viewing two stocks: GET request to /api/stock-prices/', async () => {
    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('stockData');
    expect(res.body.stockData).to.be.an('array').with.lengthOf(2);
    res.body.stockData.forEach(stockObj => {
      expect(stockObj).to.include.all.keys('stock', 'price', 'rel_likes');
      expect(stockObj.price).to.be.a('number');
      expect(stockObj.rel_likes).to.be.a('number');
    });
  });

  it('Viewing two stocks and liking them: GET request to /api/stock-prices/', async () => {
    const res = await chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('stockData');
    expect(res.body.stockData).to.be.an('array').with.lengthOf(2);
    res.body.stockData.forEach(stockObj => {
      expect(stockObj).to.include.all.keys('stock', 'price', 'rel_likes');
      expect(stockObj.price).to.be.a('number');
      expect(stockObj.rel_likes).to.be.a('number');
    });
  });
});
