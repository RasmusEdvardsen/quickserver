var mongoose = require('mongoose')

//TODO: CHECK IF mongoose INSTEAD OF mongodb
var ObjectId = require('mongodb').ObjectID;

var uri = "mongodb://localhost:27017/mydb"


//TODO: PROMISES
//TODO: SERVER NEEDS AUTHENTICATION
//TODO: SERIOUSLY, PROMISES NOW!
//TODO: http://mongoosejs.com/docs/promises.html

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

// ## External Interface
module.exports = {
  User: User,
  Room: Room,
  Message: Message,
  connect: function(){
    mongoose.connect(uri, { useMongoClient: true }, function(err){
        if(err) console.log(err)
      })
  },
  save: function(doc, callback){
    doc.save(function(err, doc, numAffected){
      if(err) console.log(err)
    })
    callback(doc)
  },
  findRooms: function(uid, callback){
    Room.find({ listUsers:uid }, function(err, records){
      if(err) throw err
      callback(records)
    })
  },
  push: function(arrUser, doc){
    User.updateMany(
      {_id:
        {$in:
          arrToObjectIDs(arrUser)
        }
      },
      {$push:
        {listRooms:
          {roomid:doc._id,
          dateJoined:new Date()}
        }
      },
      function(err, records){
        if(err) throw err
        console.log(records);
      }
    )
  },
  privateleave: function(room, user){
      console.log(room + " " + user)
      Room.update(
          { _id: ObjectId(room) },
          { $pull: { listUsers: user } },
          function(err, records){
              if(err) throw err
              console.log(records)
          }
      )
  },
  close: function(){
    db.close()
  }
}

// ## Internal Interface
function arrToObjectIDs(arr){
  var newArr = [];
  arr.forEach(function(element) {
    newArr.push(ObjectId(element))
  })
  return newArr;
}
