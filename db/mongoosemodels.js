var mongoose = require("mongoose")

var User = mongoose.model('users', mongoose.Schema({
  date: Date,
  username: String,
  email: String,
  password: String,
  listRooms: [{ roomid: String, dateJoined: Date }]
}))
var Room = mongoose.model('rooms', mongoose.Schema({
  date: Date,
  name: String,
  listUsers: [String]
}))
var Message = mongoose.model('messages', mongoose.Schema({
  date: Date,
  userid: String,
  message: String
}))

module.exports = {
  User: User,
  Room: Room,
  Message: Message
}
