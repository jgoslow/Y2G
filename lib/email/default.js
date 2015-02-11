var config = require('../../config');
var email = {
    "key": config.mandrill.key,
    "template_name": "Default",
    "template_content": [
        {
            "name": "Default Email",
            "content": "example content"
        }
    ],
    "message": {
        "subject": '',
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
            "Reply-To": 'hello@y2g.org'
        },
        "merge": true,
        "merge_language": "mailchimp",
        "merge_vars": [
            {
                "rcpt": "",
                "vars": [
                    {
                      "name": "preview",
                      "content": ""
                    },
                    {
                      "name": "name",
                      "content": ""
                    },
                    {
                      "name": "message",
                      "content": ""
                    }
                ]
            }
        ],
        "tags": [
            "general"
        ],
    }
};

module.exports = email;
