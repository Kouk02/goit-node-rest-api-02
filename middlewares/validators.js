const { body, validationResult } = require('express-validator');

const validateBody = (schema) => {
  const schemaArray = Array.isArray(schema) ? schema : [schema];
  return [
    ...schemaArray.map((field) => body(field.name).exists().withMessage(`Missing field: ${field.name}`)),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

module.exports = { validateBody };