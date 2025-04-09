const users = [];

function addUser(user) {
  users.push(user);
}

function getUserByUsername(username) {
  return users.find((u) => u.username === username);
}

module.exports = {
  users,
  addUser,
  getUserByUsername,
};
