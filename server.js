var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var db = require('./db/mongo.js')
var routes = require('./api/routes/routebehavior.js') //importing route
var bodyParser = require('body-parser')

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

db.connect()

routes(app) //register the route
app.listen(27017, function(){
  console.log('app listening on *:27017')
})

http.listen(3000, function(){
  console.log('socket listening on *:3000')
})

io.engine.generateId = (req) => {
  return req._query.uid
}

io.on('connection', function(socket){
    //meta events
    socket.on('getuserrooms', function(uid){
        getuserrooms(socket, uid)
    })
    //private events
    socket.on('privatemessage', function(room, username, msg){
        privatemessage(socket, room, username, msg)
    })
    socket.on('privatecreate', function(name, email){
        privatecreate(socket, name, email)
    })
    socket.on('privateenter', function(room){
        privateenter(socket, room)
    })
    socket.on('privateexit', function(room){
        privateexit(socket, room)
    })
    //socket.on('privateadd', function(uid, rid){})
    //socket.on('privateoldmsgs', function(room, earliestfetchedmsg){})
    //standard events
    socket.on('disconnect', function () {
        disconnect(socket)
    });
})

// Meta Events
function getuserrooms(socket, uid){
  db.findRooms(uid, function(rtrnVal){
    var roomIDs = [];
    rtrnVal.forEach(function(element){
      roomIDs.push(element._id)
    })
    io.to(socket.id).emit('userrooms', roomIDs)
  })
}
//private events
function privatecreate(socket, name, email){
  //TODO: IF THEY ALREADY HAVE A ROOM, THEN GO TO SAME
  db.User.find({ email: email }, function(err, user){
    if(err) throw err //TODO: Figure out what to do here
    db.save(new db.Room({
      date: new Date(),
      name: name,
      listUsers: [ socket.id, user[0]._id ]
    }), function(doc){
      db.push([socket.id, user[0]._id], doc)
      socket.join(doc._id)
      //If undefined, means user isn't connected.
      if(io.sockets.connected[user[0]._id])
        io.sockets.connected[user[0]._id].join(doc._id)

      //TODO: ONLY FOR TEST
      io.to(doc._id).emit('newroom', doc._id.toString())
    })

    //TODO: NOTIFICATION ABOUT INVITE TO ROOM!
  })
}
function privatemessage(socket, room, username, msg){
  console.log("\n\n\n" + room + "\n")
  console.log(socket.rooms)
  io.to(room).emit('privatemessage', username + ": " + msg)
  db.save(new db.Message({
    date: new Date(), //TODO: LOCAL DATETIME
    userid: 'dummy', //TODO: change when implemented.
    message: msg //TODO:: remember when testing only server
  }), function(doc){/*TODO: DUMB*/}) //TODO: Expand with userid and datecreated.
}
function privateenter(socket, room){
    //SOCKETIO already checks if user is in room,
    //Might still to know for other reasons. TODO.
    socket.join(room)
}
function privateexit(socket, room){
    socket.leave(room)
}
//USE DESTROY NAMING FOR WHEN ERASING ROOM!
//standard events
function disconnect(){
  console.log("user disconnected")
}
