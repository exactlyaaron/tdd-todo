'use strict';


var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
// var Mongo = require('mongodb');
// var _ = require('lodash');

class User{

  static register(obj, fn){
    users.findOne({email:obj.email}, (e,u)=>{
      if(!u){
        var user = new User();
        user.email = obj.email;
        user.password = bcrypt.hashSync(obj.password, 8);
        users.save(user, ()=>fn(user));
      }else{
        fn(null);
      }
    });
  }

  static login(obj, fn){
    users.findOne({email: obj.email}, (e,u)=>{
      if(u){
        var isMatch = bcrypt.compareSync(obj.password, u.password);
        if(isMatch){
          fn(u);
        }else{
          fn(null);
        }
      }else{
        fn(null);
      }
    });
  }

}

module.exports = User;
