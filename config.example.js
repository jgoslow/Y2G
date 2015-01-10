// Set Environment
var env = 'development';

var config = {
  development: {
    //url to be used in link generation
    url: 'http://localhost/',
    //mongodb connection settings
    db: {
      user:   'dbuser',
      pass:   'dbpass',
      host:   'dbhost',
      port:   'dbport',
      db:     'dbname'
    },
    //server details
    server: {
      host: 'host',
      port: 'serverport'
    }
  },
  production: {
    //url to be used in link generation
    url: 'http://productionurl/',
    //mongodb connection settings
    db: {
      user:   'dbuser',
      pass:   'dbpass',
      host:   'dbhost',
      port:   'dbport',
      db:     'dbname'
    },
    //server details
    server: {
      host: 'host',
      port: 'serverport'
    }
  }
};

module.exports = config[env];
