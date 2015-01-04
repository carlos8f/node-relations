'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/*
 "`context` VARCHAR(255) NOT NULL,"
 + "`subject` VARCHAR(255) NOT NULL,"
 + "`role` VARCHAR(255) NOT NULL,"
 + "`object` VARCHAR(255) NOT NULL,"
 + "PRIMARY KEY (`context`, `subject`, `role`, `object`),"
 + "INDEX object (`context`, `role`, `object`)"
 + ") ENGINE=InnoDB", cb);
 */
var RelationSchema = new Schema({
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
    required: 'object is required',
    index: true
  }
});

RelationSchema.index({ context: 1, subject: 1, role: 1, object: 1 }, {unique: true});
RelationSchema.index({ context: 1, role: 1, object: 1 });
module.exports = mongoose.model('Relation', RelationSchema);
