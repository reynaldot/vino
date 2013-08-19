var vino = require('../vino.js'), client;

if (process.argv.length != 5) {
  console.error('usage: node signup.js [username] [password] [email]');
  process.exit(1);
}

client = new vino({username: process.argv[2], password: process.argv[3], email: process.argv[4]});

client.signup(function(err, key, userId) {
  if (err) throw new Error(err);
  console.log('successfully signed up, key and username: ', key, userId);
});