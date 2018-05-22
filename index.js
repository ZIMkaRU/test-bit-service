'use strict';

const ws = require('ws');
const w = new ws('wss://api.bitfinex.com/ws/2');

const Wasteland = require('wasteland');
const GrenacheBackend = require('wasteland/backends/Grenache');

const { PeerRPCServer } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');
const ed = require('ed25519-supercop');

const _ = require('lodash');

let hash = null;
let isAnnounceWorker = false;
const opts = { seq: 0, salt: 'salt' };

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});
link.start();

const { publicKey, secretKey } = ed.createKeyPair(ed.createSeed());

const gb = new GrenacheBackend({
  transport: link,
  keys: { publicKey, secretKey }
});

const wl = new Wasteland({ backend: gb });

const peer = new PeerRPCServer(link, {
  timeout: 300000
});
peer.init();

const service = peer.transport('server');
service.listen(_.random(1000) + 1024);

const announceWorker = () => {
  setInterval(() => {
    link.announce('rest:bfx:ticker:BTCUSD', service.port, {});
  }, 1000);
};

service.on('request', (rid, key, payload, handler) => {
  handler.reply(null, hash);
});

const handlerTicker = msg => {
  const data = JSON.parse(msg);
  console.log('---Ticker, data--- ', msg);

  if (!Array.isArray(data) || !Array.isArray(data[1])) {
    return;
  }

  opts.seq += 1;
  opts.salt = 'salt:' + (new Date()).getTime();

  wl.put(msg, opts, (err, _hash) => {
    if (err) throw err;

    hash = _hash;

    if (!isAnnounceWorker) {
      announceWorker();

      isAnnounceWorker = true;
    }

    console.log('---HASH--- ', hash);
  });
};

w.on('message', handlerTicker);

let msg = JSON.stringify({
  event: 'subscribe',
  channel: 'ticker',
  symbol: 'tBTCUSD'
});

w.on('open', () => w.send(msg));
