"use strict";

    //NEW!!!!!!

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

 var mongoose = require('mongoose');
 var async = require('async');
 var session = require('express-session');
 var bodyParser = require('body-parser');
 var multer = require('multer');
 var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
 var fs = require("fs");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var ActivityObject = require('./schema/activityObject.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var express = require('express');
var app = express();



mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
 app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        //response.send("hello");
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            //response.end(JSON.stringify(cs142models.userModel('573a898dcc96a4085dd3f71e')));
            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
            //response.send("yeah");
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
        {name: 'user', collection: User},
        {name: 'photo', collection: Photo},
        {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
 app.get('/user/list', function (request, response) {
    if (request.session.isLoggedIn) {
        var query = User.find({}, function (err, users) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (users.length === 0) {
                response.status(500).send('Missing User');
                return;
            }
            response.end(JSON.stringify(users));
        });
        query.select("_id first_name last_name").exec();
    } else {
        response.status(401).send();
    }
});


/*
 * URL /admin/login - Return the information for User (id)
 */
 app.post('/admin/login', function (request, response) {
    var receivedName = request.body.loginName;
    var receivedPassword = request.body.loginPassword;
    User.findOne({login_name: receivedName, password: receivedPassword}, function (err, user) {
        if (err) {
            console.error('Doing /user/info error:', err);
            response.status(401).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            response.status(402).send('Missing User');
            return;
        }
        /*if (user.password !== receivedPassword) {
            response.status(400).send('Wrong password');
            return;
        }*/
        var result = JSON.parse(JSON.stringify(user)); 
        request.session.isLoggedIn = true;
        request.session.login_name = receivedName;
        request.session.user_id = result._id;
        request.session.first_name = result.first_name;
        request.session.last_name = result.last_name;
        response.status(200).end(JSON.stringify(result));
    });
});



/*
 * URL /admin/logout - Return the information for User (id)
 */
 app.post('/admin/logout', function (request, response) {
        delete request.session.loggedIn;
        delete request.session.login_name;
        delete request.session.user_id;
        request.session.destroy(function(err){ 
            response.end("logged out");
        });    
 });

/*
 * URL /commentsOfPhoto/:photo_id - Adds a comment
 */
 app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    
    var givenId = request.params.photo_id;
    var givenComment = request.body.givenComment;
    Photo.findOne({_id: givenId}, function (err, photo) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photo === null) {
            response.status(400).send('Missing phto');
            return;
        }
        
        if (givenComment === "") {
            response.status(400).send('Empty input');
            return;
        }

        //add code here to add the comment to the photo
        var newComment = {};
        newComment.comment = givenComment;
        newComment.date_time = new Date();
        newComment.user_id = request.session.user_id;

        photo.comments.push(newComment); //add new comment to database
        photo.save(function(err) {
            if (err) {
                console.log("Error");
            } else {
                response.status(200).send();
                response.end(JSON.stringify(photo));
            }
        });        
    });

 });
/*
 * URL /likes/set --sets true if the user liked that photo
 */
 app.post('/likes/set', function (request, response) {
    var photoId = request.body.photoId;
    var userId = request.body.userId;
    var marker = request.body.marker;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photo === null) {
            response.status(400).send('Missing User');
            return;
        }
        //now have the user
        if (marker == true) {
            photo.likes.push(userId);
            console.log("--add like");
            photo.save(function(err) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("saved Photo with added user Id");
                    response.end("  success"); 
                }
            });
        } else {
            //remove the photoId from the 
            if (photo.likes !== undefined) {
                for (var i = 0; i < photo.likes.length; i++) {
                    console.log("--remove like");
                    //search the array and see if the photoId is in there
                    if (photo.likes[i] === userId) {
                        //remove the id
                        photo.likes.splice(i, 1);
                        photo.save(function(err) {
                            if (err) {
                                console.log("Error");
                            } else {
                                console.log("saved Photo with removed user Id");
                                response.end("  success"); 
                            }
                        });
                    }
                }
            }
        }
             
    });
});

/*
 * URL /likes/get --returns true if the user liked that photo
 */
 app.post('/likes/get', function (request, response) {
    console.log("received!");
    var photoId = request.body.photoId;
    var userId = request.body.userId;
    Photo.findOne({_id: photoId}, function (err, photo) {
        if (err) {
            console.error('Doing photo error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photo === null) {
            response.status(400).send('Missing Photo');
            return;
        }
        //now have the photo
        var x = 0;
        if (photo.likes !== undefined) {
            for (var i = 0; i < photo.likes.length; i++) {
                //search the array
                if (photo.likes[i] === userId) {
                    console.log("user has liked this photo before");
                    x = 1;
                }
            }
        }
        response.end(JSON.stringify(x));      
    });
});

 app.post('/activity-object', function (request, response) {
    var receivedObject = request.body.activityObj;  
    console.log("about to begin creating object");
    function userCallback(err, nuAct) {
        if (err) {
            console.log("error activity");
            response.status(400).send(JSON.stringify(err));
            return;
        } else {
            console.log('Created new action by firstname', nuAct.first_name);  
            console.log("success");
            response.status(200).end("Successfully created!");
        }
    }
    ActivityObject.create({first_name: receivedObject.first_name, last_name: receivedObject.last_name, date_time: receivedObject.date_time, type: receivedObject.type, photo_id: receivedObject.photo_id, file_name:receivedObject.file_name}, userCallback);        
 });

/*
 * URL /user/list - Return all the User object.
 */
 app.get('/activity-object/list', function (request, response) {
    if (request.session.isLoggedIn) {
        var query = ActivityObject.find({}, function (err, activities) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (activities.length === 0) {
                //maybe get rid of this? you probably still want to to return an empty list
                response.status(500).send('No activities');
                return;
            }
            response.end(JSON.stringify(activities));
        });
        //query.limit(20);
    } else {
        response.status(401).send();
    }
});


/*
 * URL /user- registers the user
 */
 app.post('/user', function (request, response) {
        var username = request.body.loginName;
        var password = request.body.password;
        var firstname = request.body.firstname;
        var lastname = request.body.lastname;
        var location = request.body.location;
        var description = request.body.description;
        var occupation = request.body.occupation;   
        function userCallback(err, nuUser) {
            if (err) {
                console.log("error user");
                response.status(400).send(JSON.stringify(err));
                return;
            } else {
                console.log("success");
                response.status(200).end("Successfully created!");
            }
            console.log('Created user with firstname', nuUser.first_name);
        }
        

        User.findOne({login_name: username}, function (err, user) {
            if (err) {
                User.create({first_name: firstname, last_name: lastname, location: location, description: description, occupation: occupation, login_name: username, password: password}, userCallback);        
                response.status(200).end("success");
                return;
            }
            if (user === null) {
                User.create({first_name: firstname, last_name: lastname, location: location, description: description, occupation: occupation, login_name: username, password: password}, userCallback);        
                response.status(200).end("success");
                return;
            }
            response.status(400).end("failure");
        });
 });

/*
 * URL /admin/login - Return the information for User (id)
 */
 app.post('/photos/new', function (request, response) {
    if (request.session.isLoggedIn) {
        //write check later for if logged in user
        processFormBody(request, response, function (err) {
                if (err || !request.file) {
                    // XXX -  Insert error handling code here.
                    response.status(400).send(err);
                    return;
                }
                // request.file has the following properties of interest
                //      fieldname      - Should be 'uploadedphoto' since that is what we sent
                //      originalname:  - The name of the file the user uploaded
                //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
                //      buffer:        - A node Buffer containing the contents of the file
                //      size:          - The size of the file in bytes

                // XXX - Do some validation here.
                if (request.file !== null) {
                        // We need to create the file in the directory "images" under an unique name. We make
                    // the original file name unique by adding a unique prefix with a timestamp.
                    var timestamp = new Date().valueOf();
                    var filename = request.file.originalname; //'U' +  String(timestamp) + request.file.originalname;
                    //var filename = 'U' +  String(timestamp) + request.file.originalname;
                    fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
                      // XXX - Once you have the file written into your images directory under the name
                        var dateObj = new Date();
                        function photoCallback(err, nuPhoto) {
                            if (err) {
                                console.log("error photo");
                                response.status(400).send(JSON.stringify(err));
                                return;
                            } else {
                                console.log("success");
                                response.status(200).send();
                            }
                            console.log('Created photo with filename', nuPhoto.filename);
                        }
                        Photo.create({user_id: request.session.user_id, comments: [], file_name: filename, date_time: dateObj.now}, photoCallback);
                        
                    });
                }               
        });
    } else {
        response.status(401).send();
    }
});



/* TEST CODE
----------------------

    if (request.session.loggedIn) {
        
    } else {
        response.status(401).send();
    }
*/



/*
 * URL /user/:id - Return the information for User (id)
 */
 app.get('/user/:id', function (request, response) {
    if (request.session.isLoggedIn) {
        var id = request.params.id;
        User.findOne({_id: id}, function (err, user) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            if (user === null) {
                response.status(400).send('Missing User');
                return;
            }
            var result = JSON.parse(JSON.stringify(user)); 
            delete result.__v;
            response.end(JSON.stringify(result));
        });
    } else {
        response.status(401).send();
    }
});

/*
 * URL /user/list - Return all the User object.
 */
 app.post('/delete/:id', function (request, response) {
    if (request.session.isLoggedIn) {
        var id = request.params.id;
        User.remove({_id: id}, function (err, user) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (user.length === 0) {
                response.status(500).send('Missing users');
                return;
            }
            //get all photos
            Photo.find({}, function (err, photos) {
                if (err) {
                    console.error('Doing /user/info error:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                if (photos.length === 0) {
                    response.status(500).send('Missing User');
                    return;
                }
                for (var i=0; i<photos.length; i++) {
                    console.log("searching new photo");
                    console.log(photos);
                    if (photos[i].comments !== undefined) {
                        for (var j = 0; j< photos[i].comments.length; j++) {
                            console.log("  searching comments");
                            if (photos[i].comments[j].user_id == id) {
                                //delete this comment
                                console.log("  found comment to delete");
                                photos[i].comments.splice(j, 1);
                                j--;
                            }
                        }
                        photos[i].save(function(err) {
                            if (err) {
                                console.log("Error");
                            } else {
                                console.log("saved photo with removed comments");
                                //response.status(200).send();
                                //response.end(JSON.stringify(photo));
                            }
                        });
                    }
                }
                console.log("yo");
                
                //now remove all the users photos
                Photo.remove( {user_id: id}, function (err, photo) {
                    if (err) {
                        console.error('Doing /user/info error:', err);
                        response.status(500).send(JSON.stringify(err));
                        return;
                    }
                    if (photo.length === 0) {
                        response.status(500).send('Missing Photo');
                        return;
                    }
                    response.end("success");
                });
                //response.end(JSON.stringify(users));
            });
            //query.select("_id first_name last_name").exec();

            //if here then search and remove photos of user and comments
            /*Photo.remove( {user_id: id}, function (err, photo) {
                if (err) {
                    console.error('Doing /user/info error:', err);
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                if (photo.length === 0) {
                    response.status(500).send('Missing Photo');
                    return;
                }
                 
                response.end("success");
            });*/
            response.end("success");
        });
        //query.select("_id first_name last_name").exec();
    } else {
        response.status(401).send();
    }
});

/*
 * URL '/delete/comment/:id' - Deletes photo of user
 */
 app.post('/delete/comment/:id', function (request, response) {
    if (request.session.isLoggedIn) {
        var comment_id = request.params.id;
        var photo_id = request.body.photo_id;
        console.log("Photo Id: "+photo_id);
        Photo.findOne({_id: photo_id}, function (err, photo) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (photo.length === 0) {
                response.status(500).send('Missing photos');
                return;
            } 
            //found the photo, now iterate and find comment
            for (var i = 0; i < photo.comments.length; i++) {
                if (photo.comments[i]._id == comment_id) {
                    console.log("found comment");
                    //this is the comment to delete
                    photo.comments.splice(i, 1);
                    //save and update
                    photo.save(function(err) {
                        if (err) {
                            console.log("Error");
                        } else {
                            console.log("deleted photo");
                            response.status(200).send();
                            response.end(JSON.stringify(photo));
                        }
                    }); 
                }
            }     
            
        });
    } else {
        response.status(401).send();
    }
});



/*
 * URL '/delete/photo/:id' - Deletes photo of user
 */
 app.delete('/delete/photo/:id', function (request, response) {
    if (request.session.isLoggedIn) {
        var id = request.params.id;
        Photo.remove({_id: id}, function (err, photo) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (photo.length === 0) {
                response.status(500).send('Missing users');
                return;
            }  
            response.end("success");
        });
    } else {
        response.status(401).send();
    }
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
 app.get('/photosOfUser/:id', function (request, response) {
    if (request.session.isLoggedIn) {
        var id = request.params.id;
        Photo.find({user_id: id}, function (err, photos) {
            if (err) {
                console.error('Doing /user/info error:', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            var result = JSON.parse(JSON.stringify(photos));    
            async.each(result, function(photo, callback) {      
                delete photo.__v;
                async.each(photo.comments, function(comment, callback2) {
                    User.findOne({_id: comment.user_id}, function (err, user) {
                        if (err) {
                            console.error('Doing /user/info error:', err);
                            response.status(400).send(JSON.stringify(err));
                            return;
                        }
                        var editedUser = JSON.parse(JSON.stringify(user));
                        delete editedUser.__v;
                        delete editedUser.description;
                        delete editedUser.location;
                        delete editedUser.occupation;
                        comment.user = editedUser;
                        callback2();
                    }); 
                    delete comment.user_id;
                }, function(err) {
                //Main Inner Callback
                if (err) { 
                    console.log("Error"); 
                } else {
                    callback();
                }
            });
            }, function(err) {
            //Main callback
            if (err) {
                console.log("Error with loading photo");
            } else {
                console.log("Successfully loaded photos"); 
                response.end(JSON.stringify(result));   
            }
        });
        });
    } else {
        response.status(401).send();
    }

});


 var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


