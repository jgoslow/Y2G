var config = require('../../config');
var email = {
    "key": config.mandrill.key,
    "template_name": "Message",
    "template_content": [
        {
            "name": "Message Email",
            "content": "example content"
        }
    ],
    "message": {
        "subject": '',
        "from_email": '',
        "from_name": '',
        "to": [
          {
            "email": "",
            "name": "",
            "type": "to"
          }
        ],
        "headers": {
            "Reply-To": ''
        },
        "merge": true,
        "merge_language": "mailchimp",
        "merge_vars": [
            {
                "rcpt": "",
                "vars": [
                    {
                      "name": "name",
                      "content": ""
                    },
                    {
                      "name": "message",
                      "content": ""
                    },
                    {
                      "name": "toemail",
                      "content": ""
                    },
                    {
                      "name": "fromname",
                      "content": ""
                    },
                    {
                      "name": "respondlink",
                      "content": ""
                    },
                    {
                      "name": "listingtitle",
                      "content": ""
                    },
                    {
                      "name": "listinglink",
                      "content": ""
                    },
                    {
                      "name": "phone",
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
