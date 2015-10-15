var fs = require('fs');

var documentManager = require('../src/documentManager');
var models = require('../src/schema');

//load fixtures
var data = fs.readFileSync(__dirname + '/fixtures.json');

var testData = JSON.parse(data);

//users collection test
describe('User', function() {

  var users = testData[0].Users;

  beforeEach(function(done) {

    runs(function() {
      for (var user in users) {
        var roleId;
        var createUser = documentManager
          .createUser(users[user]
            .firstname, users[user].lastname, users[user].role);
      }
    });
    waits(500);
    done();
  });

  afterEach(function(done) {

    documentManager.removeUsers({});
    documentManager.removeDocuments({});
    documentManager.removeRoles({});
    done();
  });

  it('is unique', function(done) {

    runs(function() {
      var addUser = new models.User({
        firstname: users[0].firstname,
        lastname: users[0].lastname,
        role: "561e3d2a349aae0e8328bd56"
      });

      addUser.save(function(err, user) {
        console.log(err);
        expect(err).toBeDefined();
        expect(err).not.toBeNull();
        expect(typeof err).toEqual(typeof []);
        done();
      });
    });
  });

  it('has a defined role', function(done) {

    runs(function() {
      var noRole = documentManager.createUser('Simon', 'John', undefined);
      var getAllUsers = documentManager.getAllUsers();

      getAllUsers.then(function(users) {

        expect(noRole).toBeDefined();
        expect(noRole).toEqual('provide user role');
        expect(users).toBeDefined();
        expect(users[0].role.title).toBeDefined();
        expect(users[2].firstname).toEqual('Michael');
        expect(users[2].role.title).toEqual('regular');
        expect(users[3].firstname).toEqual('Ore');
        expect(users[3].role.title).toEqual('admin');
        done();
      }).catch(function(err) {
        console.log(err);
      });
    });
  });

  it('has both first and last name', function(done) {

    runs(function() {
      var noFirst = documentManager.createUser('Simon', undefined, 'regular');
      var noLast = documentManager.createUser(undefined, 'John', 'regular');
      var getOne = documentManager.findOneUser(users[0].firstname, users[0].lastname);

      getOne.then(function(user) {

        expect(noFirst).toEqual('Invalid, firstname or lastname');
        expect(noLast).toEqual('Invalid, firstname or lastname');
        expect(user.lastname).toBeDefined();
        expect(user.lastname).toEqual('Adewale');
        expect(user.firstname).toBeDefined();
        expect(user.firstname).toEqual('Ore');
        done();
      }).catch(function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  });

  it(' request for all return all users', function(done) {

    runs(function() {

      var getAllUsers = documentManager.getAllUsers();

      getAllUsers.then(function(users) {

        expect(users).toBeDefined();
        expect(users[0].firstname).toEqual('John');
        expect(users[1].firstname).toEqual('Lionel');
        expect(users[2].lastname).toEqual('Johnson');
        expect(users[3].lastname).toEqual('Adewale');
        expect(users[4].role.title).toEqual('regular');
        expect(users[0].role.title).toEqual('moderator');
        done();
      }).catch(function(err) {
        console.log(err);
      });
    });
  });

});

//roles collection test
describe('Role', function() {

  var roles = testData[0].Roles;

  beforeEach(function(done) {

    for (var role in roles) {
      documentManager.createRole(roles[role]);
    }


    done();
  });

  afterEach(function(done) {

    documentManager.removeUsers({});
    documentManager.removeDocuments({});
    documentManager.removeRoles({});
    done();
  });

  it('has a unique title', function(done) {


    var newRole = new models.Role({
      title: roles[0]
    });

    newRole.save(function(err) {
      expect(err).toBeDefined();
      expect(err).not.toBeNull();
      expect(typeof err).toEqual(typeof {});
      done();
    });
  });

  it(' request for all return all roles', function(done) {

    var allRoles = documentManager.getAllRoles();

    allRoles.exec(function(err, roles) {
      if (err) {
        console.log(err);
      }
      expect(roles).toBeDefined();
      expect(typeof roles).toEqual(typeof JSON);
      expect(roles[0].title).toEqual('admin');
      expect(roles[1].title).toEqual('moderator');
      expect(roles[2].title).toEqual('regular');
      done();
    });

  });

});

//document collection test
describe('Document', function() {

  var documents = testData[0].Documents;
  var roles = testData[0].Roles;

  beforeEach(function(done) {

    documentManager.removeUsers({});
    documentManager.removeDocuments({});
    documentManager.removeRoles({});
    done();

    runs(function() {
      for (var doc in documents) {
        documentManager
          .createDocument(documents[doc].contents, documents[doc].permitted);
      }
    });

    waits(500);

    done();
  });

  afterEach(function(done) {

    documentManager.removeUsers({});
    documentManager.removeDocuments({});
    documentManager.removeRoles({});
    done();
  });

  it(' getAllDocuments should return all documents limited by a specified number', function(done) {

    runs(function() {
      var getAllDocs = documentManager.getAllDocuments(2);
      getAllDocs.then(function(docs) {

        expect(docs).toBeDefined();
        expect(docs.length).toEqual(2);
        expect(docs[0].contents).toEqual('The admin own this file');
        expect(docs[1].contents).toEqual('This is owned by the footballer');
        expect(docs[0].permission.title).toEqual('admin');
        expect(docs[1].permission.title).toEqual('regular');
        done();
      }).catch(function(err) {
        console.log(err);
      });
    });



  });

  it(' getAllDocuments should return all documents in order of their published dates', function(done) {

    var getAllDocs = documentManager.getAllDocuments(4);

    var createDate = new Date();

    var year = createDate.getFullYear(),
      month = createDate.getMonth() + 1,
      day = createDate.getDate();
    var date = year + '-' + month + '-' + day;

    runs(function() {
      var getAllDocs = documentManager.getAllDocuments(4);
      getAllDocs.then(function(docs) {

        expect(docs).toBeDefined();
        expect(docs.length).toEqual(4);
        expect(docs[0].dateCreated).toEqual(date);
        expect(docs[1].dateCreated).toEqual(date);
        expect(docs[2].dateCreated).toEqual(date);
        expect(docs[3].dateCreated).toEqual(date);
        expect(docs[3].permission.title).toEqual('moderator');

        done();
      }).catch(function(err) {
        console.log(err);
      });

    });
  });
});

//document search test
describe('Search', function() {


  var documents = testData[0].Documents;
  var roles = testData[0].Roles;

  beforeEach(function(done) {

    documentManager.removeUsers({});
    documentManager.removeDocuments({});
    documentManager.removeRoles({});
    done();

    runs(function() {
      for (var doc in documents) {
        documentManager
          .createDocument(documents[doc].contents, documents[doc].permitted);
      }

    });

    waits(500);

    done();
  });

  afterEach(function(done) {

    documentManager.removeUsers({});
    documentManager.removeDocuments({});
    documentManager.removeRoles({});
    done();
  });

  it('getAllDocumentsByRole should return documents that can be accessed by that role', function(done) {

    runs(function() {
      var getByRole = documentManager.getAllDocumentsByRole('regular', 2);
      getByRole.then(function(docs) {

          expect(docs).toBeDefined();
          expect(docs.length).toEqual(2);
          expect(docs[0].contents).toEqual('This is owned by the footballer');
          expect(docs[1].contents).toEqual('This is for the fans');
          expect(docs[0].permission.title).toEqual('regular');
          expect(docs[1].permission.title).toEqual('regular');
          done();
        })
        .catch(function(err) {
          console.log(err);
        });

    });
  });

  it(' getAllDocumentByDate should return documents published on the specified date', function(done) {

    var date = new Date();

    runs(function() {
      var getByDate = documentManager.getAllDocumentsByDate(date, 3);

      getByDate.then(function(docs) {

        expect(docs).toBeDefined();
        expect(docs.length).toEqual(3);
        expect(docs[0].contents).toEqual('This is owned by the footballer');
        expect(docs[1].contents).toEqual('The admin own this file');
        expect(docs[2].contents).toEqual('This is for the fans');
        expect(docs[0].permission.title).toEqual('regular');
        expect(docs[1].permission.title).toEqual('admin');
        done();
      }).catch(function(err) {
        console.log(err);
      });
    });
  });
});
