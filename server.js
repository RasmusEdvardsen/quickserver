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

io.engine.generateId = (req) => {
  return req._query.uid
}

io.on('connection', function(socket){
  socket.on('newmessage', function(username, msg){
    console.log("test")
    io.emit('newmessage', username + ": " + msg)
    db.save(new mongoosemodels.Message({
      date: new Date(), //TODO: LOCAL DATETIME
      userid: 'dummy', //TODO: change when implemented.
      message: msg //TODO:: remember when testing only server
    }), function(doc){/*TODO: DUMB*/}) //TODO: Expand with userid and datecreated.
  })
  socket.on('privatecreate', function(name, email){
    mongoosemodels.User.find({ email: email }, function(err, user){
      if(err){
        //TODO: Figure out what to do here
        console.log(err)
      }
      console.log
      db.save(new mongoosemodels.Room({
        date: new Date(),
        String,
        name: name,
        listUsers: [ socket.id, user[0]._id ]
      }), function(doc){
        console.log(doc)
        db.push([socket.id, user[0]._id], doc)
      })
      //TODO: NEEDS TO ACTUALLY JOIN THE ROOM!
      //TODO: NOTIFICATION ABOUT INVITE TO ROOM!
    })
  })
  socket.on('privateadd', function(name, email){
    //TODO: WAAAY LATER
  })
})

http.listen(3000, function(){
  console.log('socket listening on *:3000')
})
