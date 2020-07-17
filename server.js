const fs = require('fs');
const http = require('http');
const os = require('os');
const ifaces = os.networkInterfaces();

const listenPort = process.env.LISTEN_PORT || 8080;
let listenInterfaces = ['127.0.0.1', 'localhost'];

try {
  listenInterfaces = [];
  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family !== 'IPv4') {
        return;
      }

      listenInterfaces.push(iface.address);
    });
  });
} catch (err) {
  if (listenInterfaces.length === 0) {
    listenInterfaces = ['127.0.0.1', 'localhost'];
  }

  console.error('Error getting local interfaces:');
  console.error(err);
}

try {
  if (process.env.LISTEN_INTERFACE) {
    listenInterfaces = JSON.parse(process.env.LISTEN_INTERFACE);
  }
} catch (err) {
  console.error('Could not parse environment variable LISTEN_INTERFACE. Using default:', listenInterfaces);
}

const allowedFiles = [
  '',
  '/',
  '/index.html',
  '/logic.js',
  '/morseSound.js'
];

const httpListeningPromise = new Promise((resolve, reject) => {
  http.createServer((req, res) => {
    let getFile = req.url;
    if (allowedFiles.includes(getFile)) {
      if (getFile === '/' || getFile === '') {
        getFile = '/index.html';
      }
      fs.readFile(__dirname + getFile, (err, data) => {
        if (err) {
          res.writeHead(404);
          console.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
          return res.end("File not found.");
        }
        console.log(`[HTTP]::GET '${req.url}'`);
        res.writeHead(200);
        res.end(data);
      });
    } else {
      console.log(`[HTTP]::GET '${req.url}'`);
      console.log('  Not on allow list: ', allowedFiles);
      res.writeHead(401);
      return res.end("Unauthorized");
    }
  }).listen(listenPort, listenInterfaces, (error) => {
    if (error) {
      return reject();
    }
    return resolve();
  });
});

httpListeningPromise.then(() => {
  console.log(`Connect using:`);
  listenInterfaces.forEach((ipAddress) => {
    console.log(`http://${ipAddress}:${listenPort}/`)
  });
  console.log('');
  console.log(`Started waiting for connections`);
});

