var vino = require('../vino.js'), client;

if (process.argv.length != 5) {
	console.error('usage: node search.js [username] [password] [tag-to-search]');
	process.exit(1);
}

// if (!(process.argv[4].match(/^#/))) {
// 	console.error('tag to search for must begin with #');
// 	process.exit(1);
// }

client = new vino({username: process.argv[2], password: process.argv[3]});
client.login(function(err, key, username) {
	if (err) throw new Error(err);
	console.log('successfully logged in, key and username: ', key, username);

	client.tagSearch(
		process.argv[4],
		{
			// size: 10000,
			anchor: 0
		},
		function(err, feed) {
			if (err) throw new Error(err);
			var records = feed.records
			feed.records = [];
			console.log(records);
			console.log('your timeline', feed, records.length);
			for (var i in records) {
				var entry = records[i];
				// console.log(entry);
			}
		});

});
