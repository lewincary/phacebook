'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$rootScope', '$resource', '$location',
  function($scope, $routeParams, $rootScope, $resource, $location) {
    $scope.likes = 0;
    $scope.curID = $routeParams.userId;
    var userId = $routeParams.userId;
    var UserPhotos = $resource('/photosOfUser/:userId');    
    var UserDetail = $resource('/user/:userId'); 
    var likesGet = $resource('/likes/get'); 
    var likesSet = $resource('/likes/set');    
    //var photosOnPage;
    UserDetail.get( { userId : userId }, function(user) {
        var response = user;
        $rootScope.firstname = response.first_name;
        $rootScope.lastname = response.last_name;
    }); 
    UserPhotos.query( { userId : userId }, {},  function(photos) {
        var response = photos;
        response.sort(function(photo1, photo2) {
            if (photo2.likes.length > photo1.likes.length) return 1;
            if (photo2.likes.length < photo1.likes.length) return -1;
            if (photo2.date_time > photo1.date_time) {
                return -1;
            } else {
                return 1;
            }
        });
        //photosOnPage = photos;
        $scope.photos = response;
        console.log(response);
        $rootScope.context = "Photos of " + $rootScope.firstname + " " + $rootScope.lastname;
    }); 
    $scope.likeFunction = function(photoId, $event) {
        console.log(photoId, $event);
        //if the user has liked this photo before, unlike the photo
        //therefore must store a list of the photos this user has liked
        var ifLiked = false;
        var styleRed = function() {
            window.document.getElementById(photoId).style.color="red";
        };
        likesGet.save( {photoId: photoId, userId:$rootScope.user_id}, function(marker) {
            console.log("likes get!", marker);
            ifLiked = marker[0];//JSON.parse(marker);
            if (ifLiked == 1) {
                
                //the user had already liked this photo, set to unliked
                //get the object that called the function

                console.log("user has liked this photo before");
                likesSet.save( {photoId: photoId, userId:$rootScope.user_id, marker:false}, function(result) {
                    console.log("saved as unliked", photoId);
                    //var s = document.getElementById(photoId);
                    window.document.getElementById(photoId).style.color="red";
                    ifLiked = 1;
                    $scope.likes--;
                    UserPhotos.query( { userId : userId }, {},  function(photos) {
                        var response = photos;
                        response.sort(function(photo1, photo2) {
                            
                            if (photo2.likes.length > photo1.likes.length) return 1;
                            if (photo2.likes.length < photo1.likes.length) return -1;
                            if (photo2.date_time > photo1.date_time) {
                                return -1;
                            } else {
                                return 1;
                            }
                        });
                        //photosOnPage = photos;
                        $scope.photos = response;
                        console.log(response);
                        $rootScope.context = "Photos of " + $rootScope.firstname + " " + $rootScope.lastname;
                        //styleRed();
                        window.document.getElementById(photoId).style.color="red";
                    }); 
                });

                //$scope.likes--;
            } else {
                //the user had not already liked this photo, set to liked
                console.log("user has not liked this photo before");
                window.document.getElementById(photoId).style.color="blue";
                likesSet.save( {photoId: photoId, userId:$rootScope.user_id, marker:true}, function(result) {
                    console.log("saved as liked");
                    ifLiked = 0;
                    UserPhotos.query( { userId : userId }, {},  function(photos) {
                        var response = photos;
                        response.sort(function(photo1, photo2) {
                            if (photo2.likes.length > photo1.likes.length) return 1;
                            if (photo2.likes.length < photo1.likes.length) return -1;
                            if (photo2.date_time > photo1.date_time) {
                                return -1;
                            } else {
                                return 1;
                            }
                        });
                        //photosOnPage = photos;
                        $scope.photos = response;
                        console.log(response);
                        window.document.getElementById(photoId).style.color="blue";
                        $rootScope.context = "Photos of " + $rootScope.firstname + " " + $rootScope.lastname;
                        
                    }); 
                   
                });
                
            }
        });
    };
    
    $scope.commentFunction = function(comment, photoId, filename) {
        var addComment = $resource('/commentsOfPhoto/'+photoId);  
        console.log(comment, photoId, filename);

        addComment.save( {givenComment:comment}, function(something) {
            //don't think I need to do anything with the response
            //location.reload();
            //var path = $location.path();
            //-------------------------------------------
            var Activity = $resource('/activity-object');
            var x = new Date();
            var obj = { 
                type:"Comment added",
                first_name:$rootScope.currentUser.first_name,
                last_name:$rootScope.currentUser.last_name,
                date_time:x.toString(),
                photo_id:photoId,
                file_name:filename 
            };
            console.log("about to send: ", obj)
            Activity.save( {activityObj: obj}, function(result) {
                console.log(result);
            }, function errorHandling(err) {
                console.log("Error creating activity-object.");
            });    
            //------------------------------------------- 
            UserPhotos.query( { userId : userId }, {},  function(photos) {
                var response = photos;
                //photosOnPage = photos;
                $scope.photos = response;
                console.log(response);
                $rootScope.context = "Photos of " + $rootScope.firstname + " " + $rootScope.lastname;
            }); 
            //$location.path('/users/'+$rootScope.user_id);
            //$location.path(path);
            //$location.path(window.location.href);
        });     
    };
    $scope.deletePhoto = function(photoId) {
        //var deletePhoto = $resource('/commentsOfPhoto/'+photoId);  
        var deleteComment = $resource('/delete/photo/'+photoId);
        deleteComment.delete( {}, function(something) {
            UserPhotos.query( { userId : userId }, {},  function(photos) {
                var response = photos;
                //photosOnPage = photos;
                $scope.photos = response;
                console.log(response);
                $rootScope.context = "Photos of " + $rootScope.firstname + " " + $rootScope.lastname;
            }); 
            //var path = $location.path();
            //$location.path('/users/'+$rootScope.user_id);
            //$location.path(path);
        });
        
        console.log("deleting photo " + photoId);   
    };
    $scope.deleteComment = function(commentId, photoId) {
        //var deletePhoto = $resource('/commentsOfPhoto/'+photoId);  
        var deleteComment = $resource('/delete/comment/'+commentId);
        console.log("photo id: "+ photoId);
        deleteComment.save( {photo_id:photoId}, function(something) {
            UserPhotos.query( { userId : userId }, {},  function(photos) {
                var response = photos;
                //photosOnPage = photos;
                $scope.photos = response;
                console.log(response);
                $rootScope.context = "Photos of " + $rootScope.firstname + " " + $rootScope.lastname;
            }); 
            //coode that executes once the comment has been deleted
            console.log("succesfully deleted comment");
        });
        console.log("deleting comment " +commentId);   
    };
    

  }]);
