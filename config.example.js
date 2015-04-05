// Set Environment
var env = 'development';

var config = {
    development: {
      //url to be used in link generation
      url: 'http://localhost:3000',
      //mongodb connection settings
      db: {
        user:   'dbUSER',
        pass:   'dbPASS',
        host:   'localhost',
        port:   '27017',
        db:     'dbNAME'
      },
      //server details
      server: {
        host: 'localhost',
        port: '3000'
      },
      //redis cache details
      redis: {
        host: 'localhost',
        port: '6379'
      },
      // Mandrill Details
      mandrill: {
        key: 'mandrillKEY'
      },
      google: {
        recaptcha: 'googleRECAPTCHA'
      }
    }
  , production: {
      //url to be used in link generation
      url: 'http://localhost:3000',
      //mongodb connection settings
      db: {
        user:   'dbUSER',
        pass:   'dbPASS',
        host:   'localhost',
        port:   '27017',
        db:     'dbNAME'
      },
      //server details
      server: {
        host: 'localhost',
        port: '3000'
      },
      // Mandrill Details
      mandrill: {
        key: 'mandrillKEY'
      },
      google: {
        recaptcha: 'googleRECAPTCHA'
      }
    }
};

module.exports = config[env];
