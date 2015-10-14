var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

var models = require('./schema');

var db = 'mongodb://localhost:checkpoint_db';

mongoose.connect(db);

module.exports = {

  findOneUser: function(first, last) {
    return models.User.findOne({
      firstname: first,
      lastname: last
    }).populate('role');

  },

  findRole: function(role) {
    return models.Role.findOne({
      title: role
    });
  },

  createUser: function(first, last, role) {

    var promise, self = this;
    if (!first || !last) {
      return 'Invalid, firstname or lastname';
    } else if (!role) {
      return 'provide user role';
    } else {

      promise = self.findOneUser(first, last);

      promise.then(function(user) {
          if (!user || user === [] || user === {}) {

            return self.findRole(role);

          } else {
            return 'user already exists';
          }
        })
        .then(function(userRole) {

          if (!userRole || userRole === [] || userRole === {}) {

            return self.createRole(role);

          } else {
            return userRole;
          }
        })
        .then(function(newRole) {
          return self.findRole(role);

        })
        .then(function(data) {

          var userDetails = {
            firstname: first,
            lastname: last,
            role: data._id
          };

          var newUser = new models.User(userDetails);

          return newUser.save();

        }).then(function(data) {
          return data;
        }).catch(function(err) {
          return err;
        });
    }
  },

  createDocument: function(content, permittedRole) {

    /**
     * [Create date in YYYY/MM/DD format]
     * for seach by date purposes
     */
    var date = new Date(),
      promise, self = this,
      year = date.getFullYear(),
      month = date.getMonth() + 1,
      day = date.getDate();

    createdDate = year + '-' + month + '-' + day;

    promise = self.findRole(permittedRole);
    promise.then(function(role) {
        if (!role || role === [] || role === {}) {

          return self.createRole(permittedRole);
        } else {
          return role;
        }
      }).then(function(newRole) {
        return self.findRole(permittedRole);

      }).then(function(role) {

        var docInfo = {
          contents: content,
          permission: role._id,
          dateCreated: createdDate
        };

        var newDoc = new models.Document(docInfo);

        return newDoc.save();

      })
      .then(function(doc) {
        return doc;
      }).catch(function(err) {
        console.log(err);
      });
  },

  createRole: function(roleTitle) {

    var roleInfo = {
        title: roleTitle
      },
      newRole = new models.Role(roleInfo);

    newRole.save(function(err, roles) {

      if (err) {
        console.log(err);
      }
      return 'role saved';

    });

  },

  getAllUsers: function() {

    return models.User.find({}).sort({
        firstname: 'ascending'
      })
      .populate('role');

  },

  getAllDocuments: function(limit) {

    return models.Document
      .find({})
      .limit(limit)
      .sort({
        date: 'descending'
      })
      .select('dateCreated permission contents')
      .populate('permission');
  },

  getAllDocumentsByDate: function(date, limit) {

    var createDate = date;

    var year = createDate.getFullYear(),
      month = createDate.getMonth() + 1,
      day = createDate.getDate();
    var givenDate = year + '-' + month + '-' + day;

    return models.Document.find({
        dateCreated: givenDate
      })
      .limit(limit)
      .sort({
        date: 'descending'
      })
      .select('dateCreated permission contents')
      .populate('permission');
  },

  getAllDocumentsByRole: function(role, limit) {

    return models.Role.find({
        title: role
      })
      .then(function(accessRole) {

        return models.Document
          .find({
            permission: accessRole[0]._id
          })
          .limit(limit)
          .sort({
            date: 'descending'
          })
          .select('dateCreated permission contents')
          .populate('permission');
      });
  },
  getAllRoles: function() {

    return models.Role.find({})
    .sort({
        title: 'ascending'
      });

  },

  removeUsers: function() {
    models.User.find({}).remove(function(err) {

      if (err) {
        return err;
      } else {
        return 'All users deleted';
      }

    });

  },

  removeDocuments: function() {
    models.Document.find({}).remove(function(err) {

      if (err) {
        return err;
      } else {
        return 'All documents deleted';
      }

    });

  },

  removeRoles: function() {
    models.Role.find({}).remove(function(err) {

      if (err) {
        return err;
      } else {
        return 'All roles removed';
      }

    });

  }

};
