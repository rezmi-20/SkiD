const net = require('net');

const client = net.connect({ host: 'fd10:aec2:5dae::', port: 443 }, () => {
  console.log('Successfully connected to [fd10:aec2:5dae::]:443 via TCP');
  client.end();
});

client.on('error', (err) => {
  console.error('TCP connection failed:', err.message);
});
