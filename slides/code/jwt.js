module.exports = `const jwt = require("jsonwebtoken");
const payload = {
  "jti": "c2e56471-9241-44bc-a6be-6ad3763d2847",
  "sub": "jtanguy",
  "exp": 1524080400,
  "name": "Julien Tanguy",
  "role": ["SPEAKER"],
  "isAdmin": false
};
const token = jwt.sign(payload, "mysecret");`;
