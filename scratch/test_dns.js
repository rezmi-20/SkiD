const dns = require('dns');

dns.resolve6('auth.neon.tech', (err, addresses) => {
  if (err) {
    console.error('AAAA record lookup failed:', err);
  } else {
    console.log('AAAA records:', addresses);
  }
});

dns.resolve4('auth.neon.tech', (err, addresses) => {
  if (err) {
    console.error('A record lookup failed:', err);
  } else {
    console.log('A records:', addresses);
  }
});

dns.lookup('auth.neon.tech', (err, address, family) => {
  if (err) {
    console.error('dns.lookup failed:', err);
  } else {
    console.log('dns.lookup returned:', address, 'family:', family);
  }
});
