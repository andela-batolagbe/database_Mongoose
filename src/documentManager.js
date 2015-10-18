
var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

var models = require('./schema');

//database definition
var db = 'mongodb://localhost:checkpoint_db';

mongoose.connect(db);

//export methods
module.exports = {

  /**
   * [findOneUser find a single user]
   * @param  {string} first [user's firstname]
   * @param  {string} last  [user's lastname]
   * @return {JSON}       [user details]
   */
  findOneUser: function(first, last) {
    return models.User.findOne({
      firstname: first,
      lastname: last
    }).populate('role');

  },

  /**
   * [findRole find a single role]
   * @param  {string} first [role title]
   * @return {JSON}       [role details]
   */

  findRole: function(role) {
    return models.Role.findOne({
      title: role
    });
  },

  /**
   * [createUser add a new user]
   * @param  {string} first [user's firstname]
   * @param  {string} last  [user's lastname]
   * @param  {string} role  [user's role]
   * @return {string}       [status message]
   */

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


  /**
   * [createDocument add a new document]
   * @param  {string} content  [document's content]
   * @param  {string} permittedRole  [role that can access it]
   * @return {string}       [status message]
   */
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

  /**
   * [createRole add a new role]
   * @param  {string} roleTitle  [role title]
   * @return {string}       [status message]
   */
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

  /**
   * [getAllUsers get all users in database]
   * @return {JSON}       [users' details]
   */

  getAllUsers: function() {

    return models.User.find({}).sort({
        firstname: 'ascending'
      })
      .populate('role');

  },

  /**
   * [getAllDocuments get all documents in database]
   * @param  {number} limit [max number of documents 
   * to be returned]
   * @return {JSON}       [document's details]
   */
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

  /**
   * [getAllDocumentsByDate get all documents in database by date]
   * @param  {number} limit [max number of documents 
   * to be returned]
   * @param  {date} date [date created]
   * @return {JSON}       [document's details]
   */
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

  /**
   * [getAllDocumentsByRole get all documents in database by 
   * role permitted]
   * @param  {number} limit [max number of documents 
   * to be returned]
   * @param  {string} role [role that can access it]
   * @return {JSON}       [document's details]
   */

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

  /**
   * [getAllRoles get all roles in database]
   * @return {JSON}       [role details]
   */
  getAllRoles: function() {

    return models.Role.find({})
      .sort({
        title: 'ascending'
      });

  },

  /**
   * [removeUsers delete all users]
   * @return {string} [success message]
   */
  removeUsers: function() {
    models.User.find({}).remove(function(err) {

      if (err) {
        return err;
      } else {
        return 'All users deleted';
      }

    });

  },

  /**
   * [removeUsers delete all documents]
   * @return {string} [success message]
   */
  removeDocuments: function() {
    models.Document.find({}).remove(function(err) {

      if (err) {
        return err;
      } else {
        return 'All documents deleted';
      }

    });

  },

  /**
   * [removeUsers delete all roles]
   * @return {string} [success message]
   */
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
