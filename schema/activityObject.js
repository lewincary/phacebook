"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var activityObjectSchema = new mongoose.Schema({
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    date_time: String,    // time of activity
    type: String,  // type of activity
    photo_id: String,   // id of photo if needed
    file_name: String   // id of photo if needed
});

// the schema is useless so far
// we need to create a model using it
var ActivityObject = mongoose.model('ActivityObject', activityObjectSchema);

// make this available to our users in our Node applications
module.exports = ActivityObject;
