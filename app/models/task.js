'use strict';


//var users = global.nss.db.collection('users');
var tasks = global.nss.db.collection('tasks');
var Mongo = require('mongodb');
var _ = require('lodash');

class Task{

  static create(userId, obj, fn){
    if(userId instanceof String){
      if(userId.length !== 24){fn(null); return;}
    }

    userId = Mongo.ObjectID(userId);

    var task = new Task();
    task.title = obj.title;
    task.due = new Date(obj.date);
    task.color = obj.color;
    task.isComplete = false;
    task.userId = userId;

    tasks.save(task, (err, task)=>fn(task));
  }

  static findByTaskId(taskId, fn){

    if(taskId.length !== 24){fn(null); return;}

    taskId = Mongo.ObjectID(taskId);
    tasks.findOne({_id:taskId}, (e,t)=>{
      // if(t !== null){
      //   t = _.create(Task.prototype, t);
      // }
      if(t){
        t = _.create(Task.prototype, t);
        fn(t);
      }else{
        fn(null);
      }
    });
  }

  static findByUserId(userId, fn){
    if(userId.length !== 24){fn(null); return;}
    userId = Mongo.ObjectID(userId);
    tasks.find({userId:userId}).toArray((e,tasks)=>{
      fn(tasks);
    });
  }

  destroy(fn){
    tasks.remove({_id: this._id}, ()=>{
      fn();
    });
  }

  toggleComplete(){
    if(this.isComplete === false){
      this.isComplete = true;
    }else{
      this.isComplete = true;
    }

  }

  save(fn){
    tasks.save(this, (e,t)=>fn(t));
  }

}

module.exports = Task;
