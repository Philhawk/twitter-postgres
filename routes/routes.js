'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db/index.js')

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT name, tweets.userid, pictureurl, content FROM users INNER JOIN tweets ON tweets.userid = users.id;', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index.html', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT name, tweets.id, pictureurl, content FROM users INNER JOIN tweets ON tweets.userid = users.id;', function (err, result) {
      var tweets = result.rows;

      var tweetsForName = tweets.filter(function(tweet) {
        return tweet.name === req.params.username;
      });

      res.render('users.html', {
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT name, tweets.id, pictureurl, content FROM users INNER JOIN tweets ON tweets.userid = users.id;', function (err, result) {

      var tweets = result.rows;

      var tweetsWithThatId = tweets.filter(function(tweet){
        return tweet.id == req.params.id;
      });

      res.render('tweet.html', {
        tweets: tweetsWithThatId
      });
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = tweetBank.add(req.body.name, req.body.content);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
