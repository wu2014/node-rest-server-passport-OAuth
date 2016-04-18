var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify    = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({ postedBy: req.decoded._doc._id })
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    // find Favorites by user id
    Favorites.findOne({ postedBy: req.decoded._doc._id }, function(err, favorite) {
        if (err) {
            console.log(err);
        }
        // if this favorite for the current user exists
        if (!err && favorite !== null) {
            // if the dish is new, add it
            if (favorite.dishes.indexOf(req.body._id) < 0) {
                favorite.dishes.push(req.body._id);
                favorite.save(function (err, favorite) {
                    if (err) throw err;
                    res.json(favorite);
                });
            // if the dish has been added to the favorites before, just return it
            } else {
                res.json(favorite);
            }
        // create new favorite and add the dish
        } else {
            favorite = new Favorites({
                postedBy: req.decoded._doc._id  
            });
            favorite.dishes.push(req.body._id);
                favorite.save(function (err, favorite) {
                        if (err) throw err;
                        res.json(favorite);
                });
                
        }
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    // find Favorites by user id
    Favorites.findOne({ postedBy: req.decoded._doc._id }, function(err, favorite) {
        if (err) {
            console.log(err);
        }
        // if the favorite exists
        if (!err && favorite !== null) {
            for(var i = (favorite.dishes.length - 1); i >= 0 ; i--) {
                            favorite.dishes.remove(favorite.dishes[i]);
                        }
            favorite.save(function (err, favorite) {
                if (err) throw err;
                res.json(favorite);
            });
        // favorite does not exist for the current user
        } else {
            console.log('Could not find favorite to remove');
        }
    });
});


favoriteRouter.route('/:dishObjectId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({ postedBy: req.decoded._doc._id }, function (err, favorite) {
        favorite.dishes.remove(String(req.params.dishObjectId));
            favorite.save(function (err, favorite) {
                    if (err) throw err;
                    res.json(favorite);
            });
    });
});


module.exports = favoriteRouter;