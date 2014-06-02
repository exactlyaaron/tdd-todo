'use strict';

var _ = require('lodash');
var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
//var Mongo = require('mongodb');

class User{

  static register(obj, fn){
    var user = new User();
    user.email = obj.email;
    user.password = bcrypt.hashSync(obj.password, 8);
    user = _.create(User.prototype, user);

    users.save(user, ()=>{
      fn(user);
    });
  }

}

module.exports = User;
