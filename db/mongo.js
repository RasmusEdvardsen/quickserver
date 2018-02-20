var mongoose = require("mongoose")
var mongoosemodels = require('./mongoosemodels.js')

//TODO: CHECK IF mongoose INSTEAD OF mongodb
var ObjectId = require('mongodb').ObjectID;

var uri = "mongodb://localhost:27017/mydb"


//TODO: PROMISES
//TODO: SERVER NEEDS AUTHENTICATION
//TODO: SERIOUSLY, PROMISES NOW!
//TODO: http://mongoosejs.com/docs/promises.html

// ## External Interface
module.exports = {
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
    mongoosemodels.Room.find({ listUsers:uid }, function(err, records){
      if(err) throw err
      callback(records)
    })
  },

  push: function(arrUser, doc){
    mongoosemodels.User.updateMany(
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
