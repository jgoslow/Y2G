var config = require('../../config');
var email = {
    "key": config.mandrill.key,
    "template_name": "Activation Email",
    "template_content": [
        {
            "name": "Activation Email",
            "content": "example content"
        }
    ],
    "message": {
        "from_email": 'hello@y2g.org',
        "from_name": 'Yards to Gardens',
        "to": [
          {
            "email": "",
            "name": "",
            "type": "to"
          }
        ],
        "headers": {
            "Reply-To": "hello@y2g.org"
        },
        "merge": true,
        "merge_language": "mailchimp",
        "merge_vars": [
            {
                "rcpt": "",
                "vars": [
                    {
                      "name": "activationlink",
                      "content": ""
                    },
                    {
                      "name": "name",
                      "content": ""
                    }
                ]
            }
        ],
        "tags": [
            "account-confirmation"
        ],
    }
};

module.exports = email;
