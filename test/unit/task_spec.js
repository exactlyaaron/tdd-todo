/*global describe, it, before, beforeEach*/
/*jshint expr:true*/
'use strict';

process.env.DBNAME = 'todo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');  //simulates browser
var traceur = require('traceur');

var sue;
var bob;
var task1, task2, task3;
var User;
var Task;


describe('Task', function(){
  before(function(done){
    request(app)   //causes db and routes to initialize
    .get('/')
    .end(function(){
      User = traceur.require(__dirname + '/../../app/models/user.js');
      Task = traceur.require(__dirname + '/../../app/models/task.js');
      done();
    });
  });


  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      global.nss.db.collection('tasks').drop(function(){
        User.register({email:'sue@aol.com', password:'abcd'}, function(u){
          sue = u;
          Task.create(sue._id, {title: 'Task1', date: '2014-06-10', color: 'blue'}, function(t1){
            Task.create(sue._id, {title: 'Task2', date: '2014-06-10', color: 'red'}, function(t2){
              User.register({email:'bob@aol.com', password:'abcd'}, function(u2){
                bob = u2;
                Task.create(bob._id, {title: 'Task3', date: '2014-06-10', color: 'green'}, function(t3){
                  console.log('xxxx BEFORE EACH NESTED xxxx');
                  task1 = t1;
                  task2 = t2;
                  task3 = t3;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should successfully create a task - stringId', function(done){
      var userIdString = sue._id.toString();
      Task.create(userIdString,{title: 'title', date: '2014-06-10', color: 'blue'} , function(t){
        expect(t).to.be.ok;
        expect(t.title).to.be.a('string');
        expect(t.due).to.be.an.instanceOf(Date);
        expect(t.color).to.be.a('string');
        expect(t).to.be.an.instanceof(Task);
        expect(t._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(t.userId).to.deep.equal(sue._id);
        expect(t.isComplete).to.equal(false);
        done();
      });
    });

    it('should successfully create a task - objectId', function(done){
      Task.create(sue._id, {title: 'title', date: '2014-06-10', color: 'blue'} , function(t){
        expect(t).to.be.ok;
        expect(t).to.be.an.instanceof(Task);
        done();
      });
    });
  });

  describe('.findByTaskId', function(){
    it('should successfully return a task', function(done){
      var taskIdString = task1._id.toString();
      Task.findByTaskId(taskIdString, function(t){
        expect(t).to.be.ok;
        expect(t._id).to.deep.equal(task1._id);
        done();
      });
    });

    it('should NOT return a task - INVALID ID', function(done){
      Task.findByTaskId('bad id', function(t){
        expect(t).to.be.null;
        done();
      });
    });

    it('should NOT return a task - WRONG ID', function(done){
      Task.findByTaskId('5388aec35a4b18ff2df2a9f0', function(t){
        expect(t).to.be.null;
        done();
      });
    });
  });

  describe('.findByUserId', function(){
    it('should successfully return sues tasks - good id', function(done){
      var userIdString = sue._id.toString();
      Task.findByUserId(userIdString, function(tasks){
        console.log('***IT TEST HERE - GOOD ID***');
        console.log(tasks);
        expect(tasks).to.be.ok;
        expect(tasks.length).to.equal(2);
        expect(tasks[0].userId).to.deep.equal(sue._id);
        done();
      });
    });

    it('should not return sues tasks - bad id', function(done){
      Task.findByUserId('bad id', function(tasks){
        console.log('***IT TEST HERE - BAD ID***');
        expect(tasks).to.be.null;
        done();
      });
    });

    it('should not return sues tasks - wrong id', function(done){
      Task.findByUserId('5388aec35a4b28ff2df2a9f0', function(tasks){
        console.log('***IT TEST HERE - WRONG ID***');
        expect(tasks.length).to.equal(0);
        done();
      });
    });
  });

  describe('#destroy', function(){
    it('should successfully delete a task', function(done){
      task1.destroy(function(){
        Task.findByUserId(sue._id.toString(), function(tasks){
          expect(tasks.length).to.equal(1);
          done();
        });
      });
    });
  });

  describe('#toggleComplete', function(){
    it('should successfully swap isComplete property', function(){
      task1.toggleComplete();
      console.log('xxxxxxxxx');
      console.log(task1);
      expect(task1.isComplete).to.equal(true);
    });
  });

  describe('#save', function(){
    it('should successfully updates a tasks properties', function(done){
      task1.toggleComplete();
      task1.save(function(){
        Task.findByTaskId(task1._id.toString(), function(foundTask){
          expect(foundTask.isComplete).to.be.true;
          done();
        });
      });
    });
  });

});
