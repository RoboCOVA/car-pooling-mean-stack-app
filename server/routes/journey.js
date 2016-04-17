/**
 * Created by PRASHANT on 10-04-2016.
 */
var express = require('express');
var router = express.Router();
var Car = require('../models/car');
var Journey = require('../models/journey');
var Vehicle = require('../models/vehicle')
var ifLoggedIn = function(req, res, next) {
        if (req.user) {
            return next();
        }
        res.json({
            error: 'Not logged in'
        });
    }
    /* GET list of all the journeys . */
router.get('/journeys/', function(req, res, next) {
    Journey.find({
        departure: {
            $gt: new Date()
        }
    }).lean().populate('posted_by vehicle').exec(function(err, journeys) {
        if (err) return res.send(err);
        console.log(journeys)
        res.json(journeys);
    });
});
/* GET list of all the past journeys . */
router.get('/journeys/past', function(req, res, next) {
    Journey.find({
        departure: {
            $lt: new Date()
        }
    }).lean().sort('-departure').limit(5).populate('posted_by vehicle').exec(function(err, journeys) {
        if (err) return res.send(err);
        console.log(journeys)
        res.json(journeys);
    });
});
/* GET list of all the journeys of current user . */
router.get('/journeys/user', ifLoggedIn, function(req, res, next) {
    Journey.find({
        posted_by: req.user._id
    }).lean().sort('-departure').limit(5).populate('posted_by vehicle').exec(function(err, journeys) {
        if (err) return res.send(err);
        console.log(journeys)
        res.json(journeys);
    });
});
/* GET list of all the journeys of the user. */
router.get('/users/:uid/journeys/', function(req, res, next) {
    Journey.find({
        posted_by: req.params.uid
    }).populate('posted_by').exec(function(err, journey) {
        if (err) return res.send(err);
        res.json(journey);
    });
    console.log(req.params.uid);
});
/* To add new journeys . */
router.post('/journeys', ifLoggedIn, function(req, res, next) {
    var newJourney = new Journey();
    newJourney.start = {};
    newJourney.end = {};
    console.log(req.body);
    newJourney.start.street = req.body.startStreet;
    newJourney.start.area = req.body.startArea;
    newJourney.end.street = req.body.endStreet;
    newJourney.end.area = req.body.endArea;
    newJourney.departure = req.body.departure;
    newJourney.vehicle = req.body.vehicle;
    newJourney.availableSeats = req.body.availableSeats;
    newJourney.genderPreference = req.body.genderPreference;
    newJourney.description = req.body.description;
    newJourney.fare = req.body.fare;
    newJourney.posted_by = req.user._id;
    newJourney.save(function(err, journeyDetail) {
        if (err) {
            return res.send(err);
        }
        req.user.journeys.push(journeyDetail._id);
        req.user.save(function(err, user) {
            res.send(journeyDetail);
        });
    });
});
/* To delete the journeys . */
router.delete('/journeys/:id', ifLoggedIn, function(req, res, next) {
    Journey.findOneAndRemove({
        _id: req.params.id
    }, function(err, deletedJourney) {
        if (err) {
            return res.send(err);
        }
        req.user.journeys.pull(deletedJourney._id);
        req.user.save(function(err, user) {
            res.send(deletedJourney);
        });
    });
});
/* To Get one journeys . */
router.get('/journeys/:id', function(req, res, next) {
    Journey.findOne({
        _id: req.params.id
    }).populate('posted_by vehicle').exec(function(err, journey) {
        if (err) {
            return res.send(err);
        }
        res.send(journey);
    });
});
/* To Delete one journeys . */
router.delete('/journeys/:id', function(req, res, next) {
    Journey.findOneAndRemove({
        _id: req.params.id
    }).exec(function(err, journey) {
        if (err) {
            return res.send(err);
        }
        res.send(journey);
    });
});
module.exports = router;