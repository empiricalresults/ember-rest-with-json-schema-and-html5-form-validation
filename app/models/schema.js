App.Schema = {};
App.Schema.Profile = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "resProfile",
  "description": "represents a user profile",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "firstName": {
      "type": "string",
      "maxLength": 50
    },
    "lastName": {
      "type": "string",
      "maxLength": 50
    },
    "phone": {
      "type": "string",
      "maxLength": 20
    },
    "email": {
      "type": "string",
      "format" : "email",
      "maxLength": 50
    },
    "city": {
      "type": "string",
      "maxLength": 50
    },
    "dateOfBirth": {
      "type": "string",
      "format" : "date-time"
    }
  },
  "required": ["firstName", "lastName", "email", "city"]
};