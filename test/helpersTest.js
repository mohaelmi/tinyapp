const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrl = {
  xVn2: {
    longURL: "http://www.testURL.ca",
    userID: "userRandomID"
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });

  it('should return null with invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    assert.equal(user, null)
  });
});



describe('urlsForUser', function() {
  it('should return an specific url for provided userID', function() {
    const urls = urlsForUser("userRandomID", testUrl)
    const expectedURLS = { xVn2: 'http://www.testURL.ca' };
    assert.deepEqual(urls, expectedURLS)
  });

  it('should return empty object if user has not added urls', function() {
    const urls = urlsForUser("user2RandomID", testUrl)
    const expectedResult = { }
    assert.deepEqual(urls, expectedResult)
  });
});