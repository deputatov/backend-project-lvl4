import { Model, AjvValidator } from 'objection';

class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv: (ajv) => ({ ...ajv }),
      options: {
        allErrors: true,
        validateSchema: false,
        ownProperties: true,
        v5: true,
        coerceTypes: 'array',
      },
    });
  }
}

export default BaseModel;
