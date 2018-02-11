module.exports = function(app){
  var routebehavior = require('../controllers/routebehaviorcontroller.js')

  app.route('/users/')
    .get(routebehavior.read_user)
    .post(routebehavior.create_user)
}
