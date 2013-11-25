/**
 * @author Jan Zaloudek
 * @date 28.10.13
 * @time 0:25
 * @filename
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//client.query("CREATE TABLE IF NOT EXISTS `relations` ("
//    + "`context` VARCHAR(255) NOT NULL,"
//    + "`subject` VARCHAR(255) NOT NULL,"
//    + "`role` VARCHAR(255) NOT NULL,"
//    + "`object` VARCHAR(255) NOT NULL,"
//    + "PRIMARY KEY (`context`, `subject`, `role`, `object`),"
//    + "INDEX object (`context`, `role`, `object`)"
//    + ") ENGINE=InnoDB", cb);

var RelationSchema = new Schema({
    context: String,
    subject: String,
    role: String,
    object: String
});

RelationSchema.index({ context: 1, subject: 1, role: 1, object: 1 }, { unique: true });
RelationSchema.index({ context: 1, role: 1, object: 1 });

module.exports = mongoose.model('Relation', RelationSchema);