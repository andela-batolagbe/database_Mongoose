var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = new Schema({

  firstname: {
    type: String,
    require: true,
    required: 'Provide a first name',
    validate: [/[a-zA-Z]/, 'provide only characters'],
  },

  lastname: {
    type: String,
    require: true,
    required: 'Provide a first name',
    validate: [/[a-zA-Z]/, 'provide only characters'],
  },

  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    require: true,
    required: 'Provide the user role',
  }
});

var Role = new Schema({

  title: {
    type: String,
    require: true,
    unique: true,
    required: 'Provide a Role title',
    validate: [/[a-zA-Z]/, 'provide only characters']

  }
});

var Document = new Schema({

  contents: {
    type: String,
    require: true,
    required: 'provide contents',
    validate: [/[a-zA-Z]/, 'provide only characters']
  },

  permission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    require: true,
    required: 'Provide the user role'
  },

  date: {
    type: Date,
    default: Date.now(),
    index: true
  },

  dateCreated: String

});

// User.pre('save', function(next, first, last, done) {
//   this.constructor.find({
//     firstname: first,
//     lastname: last
//   }).then(function(user) {
//     if (user && user !== [] && user !== {}) {
//       var err = new Error({
//         message: 'user already exists'
//       });
//       next(err);
//     } else {
//       done();
//     }
//   });
// });

module.exports = {

  User: mongoose.model('User', User),
  Document: mongoose.model('Document', Document),
  Role: mongoose.model('Role', Role)
};
