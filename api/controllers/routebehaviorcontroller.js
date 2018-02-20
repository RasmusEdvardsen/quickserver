var mongoose = require('mongoose')
var db = require('./../../db/mongo.js')

module.exports = {
  create_user: function(req, res){
    if(!validateEmail(req.body.email)) {
      res.status(406)
      res.send('Email needs to be present.')
      return
    }
    if(!req.body.username){
      res.status(411)
      res.send('Username needs to be present.')
      return
    }
    //TODO: Password needs to be a-zA-Z0-9 with some special chars
    try {
      if (req.body.password.length < 9) {
        res.status(411)
        res.send('Password needs to be 10 characters or more.')
        return
      }
    } catch (e) {
      res.status(400)
      res.send('Failed trying to validate password.\n'
      + 'Password needs to be present.\n'
      + e)
      return
    }
    db.User.find({ email: req.body.email }, function(err, user){
      if (err) {
        res.status(500)
        res.send(err)
        return
      } else if (user.length == 0) {
        var user = new db.User({
          date: new Date(),
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          listRooms: []
        })
        user.save(function(err, user, numAffected){
          if(err) {
            res.status(500)
            res.send(err)
            return
          } else {
            res.send(user)
            return
          }
        })
      } else {
        res.status(409)
        res.send('User already exists')
        return
      }
    })
  },

  read_user: function(req, res){
    if(!req.query.email || !req.query.password){
      res.status(406)
      res.send("Email and password needs to be supplied")
      return
    }
    if(!validateEmail(req.query.email)){
      res.status(406)
      res.send("Email needs to be present.")
      return
    }
    try {
      if (req.query.password.length < 9) {
        res.status(411)
        res.send('Password needs to be 10 characters or more.')
        return
      }
    } catch (e) {
      res.status(400)
      res.send('Failed trying to validate password.\n'
      + 'Password needs to be present.\n'
      + e)
      return
    }
    db.User.find({ email: req.query.email, password: req.query.password }, function(err, user){
      if (err) {
        res.send(err)
        return
      } else if (user.length == 0) {
        res.status(404)
        res.send(user)
        return
      } else {
        res.send(user)
        return
      }
    })
  }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email.toLowerCase())
}
