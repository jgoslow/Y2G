var config = require('../../config');
var email = {
    "key": config.mandrill.key,
    "template_name": "Message Email",
    "template_content": [
        {
            "name": "Message Email",
            "content": "example content"
        }
    ],
    "message": {
        "subject": "Y2G Response: ",
        "from_email": "no-reply@y2g.org",
        "from_name": "FROMNAME @y2g",
        "to": [
          {
            "email": "",
            "name": "",
            "type": "to"
          }
        ],
        "headers": {
            "Reply-To": "FROMEMAIL"
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
