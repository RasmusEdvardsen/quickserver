var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var db = require('./db/mongo.js')
var routes = require('./api/routes/routebehavior.js') //importing route
var mongoosemodels = require('./db/mongoosemodels.js')
var bodyParser = require('body-parser')

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

db.connect()
routes(app) //register the route
app.listen(27017, function(){
  console.log('app listening on *:27017')
})

//getuserrooms('5a84b9be36fa0822e0efef3f')

io.engine.generateId = (req) => {
  return req._query.uid
}

io.on('connection', function(socket){
  socket.on('getuserrooms', getuserrooms(userid))

  //private events
  socket.on('privatemessage', privatemessage(room, username, msg))
  socket.on('privatecreate', privatecreate(name, email))
  socket.on('privateadd', function(name, email){
    //TODO: WAAAY LATER
  })
})

http.listen(3000, function(){
  console.log('socket listening on *:3000')
})

//meta events
function getuserrooms(uid){
  db.findRooms(uid, function(rtrnVal){
    //TODO: return user rooms to user here
  })
}

//private events
function privatecreate(name, email){
  mongoosemodels.User.find({ email: email }, function(err, user){
    if(err){
      //TODO: Figure out what to do here
      console.log(err)
    }
    db.save(new mongoosemodels.Room({
      date: new Date(),
      name: name,
      listUsers: [ socket.id, user[0]._id ]
    }), function(doc){
      db.push([socket.id, user[0]._id], doc)
      socket.join(doc._id)
      //If undefined, means user isn't connected.
      if(io.sockets.connected[user[0]._id])
        io.sockets.connected[user[0]._id].join(doc._id)
      console.log(io.sockets.adapter.rooms)

      //TODO: make this
      io.to(doc._id).emit("newroom", doc._id.toString())
    })

    //TODO: NOTIFICATION ABOUT INVITE TO ROOM!
  })
}
function privatemessage(room, username, msg){
  console.log(io.sockets.adapter.rooms)
  io.to(room).emit('newmessage', username + ": " + msg)
  db.save(new mongoosemodels.Message({
    date: new Date(), //TODO: LOCAL DATETIME
    userid: 'dummy', //TODO: change when implemented.
    message: msg //TODO:: remember when testing only server
  }), function(doc){/*TODO: DUMB*/}) //TODO: Expand with userid and datecreated.
}
