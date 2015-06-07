var Schema = require('mongoose').Schema;

var RelationSchema = module.exports = new Schema({
  context: {
    type: String,
    required: 'context is required',
    index: true
  },
  subject: {
    type: String,
    required: 'subject is required',
    index: true
  },
  role: {
    type: String,
    required: 'role is required',
    index: true
  },
  object: {
    type: String,
    required: false,
    default: '',
    index: true
  }
});

RelationSchema.index({context: 1, subject: 1, role: 1, object: 1}, {unique: true});
RelationSchema.index({context: 1, role: 1, object: 1});