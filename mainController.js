'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);
cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            when('/activity-feed', {
                templateUrl: 'components/activity-feed/activity-feedTemplate.html',
                controller: 'ActivityFeedController'
            }).
            when('/delete-user', {
                templateUrl: 'components/delete-user/delete-userTemplate.html',
                controller: 'DeleteUserController'
            }).
            otherwise({
                redirectTo: '/login-register'
            });
    }]);

cs142App.run(function($rootScope) {
    $rootScope.context = "Login Page";
    $rootScope.currentUser = {};
    $rootScope.logMessage = "";
    $rootScope.firstname = "";
    $rootScope.lastname = "";
    $rootScope.user_id = "";
    $rootScope.loggedIn = false;
});

cs142App.controller('MainController', ['$scope', '$routeParams', '$resource', '$rootScope', '$location', '$http',   
    function ($scope, $routeParams, $resource, $rootScope, $location, $http) {        
        $scope.main = {};
        $scope.main.title = 'Users';
        $scope.myName = "Lewin Cary";
        $scope.curID = $routeParams.userId;

        $scope.$on('loggedIn', function() {
                //Do something here
                //reload user list
        });
       
        function noOneIsLoggedIn() {
            return $rootScope.loggedIn; 
        }

       
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if (!noOneIsLoggedIn()) {
                // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }
        }); 
        //--------------------------------------------------------//
            //document.getElementById("uploadButton").onclick = function() {$scope.uploadPhoto()};
            var selectedPhotoFile;   // Holds the last file selected by the user

            // Called on file selection - we simply save a reference to the file in selectedPhotoFile
            $scope.inputFileNameChanged = function (element) {
                selectedPhotoFile = element.files[0];
            };

            // Has the user selected a file?
            $scope.inputFileNameSelected = function () {
                return !!selectedPhotoFile;
            };

            // Upload the photo file selected by the user using a post request to the URL /photos/new
            $scope.uploadPhoto = function () {
                console.log("here");
                if (!$scope.inputFileNameSelected()) {
                    console.error("uploadPhoto called will no selected file");
                    return;
                }
                console.log('fileSubmitted', selectedPhotoFile);
                // Create a DOM form and add the file to it under the name uploadedphoto
                var domForm = new FormData();
                domForm.append('uploadedphoto', selectedPhotoFile);

                // Using $http to POST the form
                $http.post('/photos/new', domForm, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).success(function(newPhoto){
                    // The photo was successfully uploaded. XXX - Do whatever you want on success.
                    console.log("successfully uploaded");
                    //-------------------------------------------
                    var Activity = $resource('/activity-object');
                    var x = new Date();
                    var obj = { 
                        type:"Photo Uploaded",
                        first_name:$rootScope.currentUser.first_name,
                        last_name:$rootScope.currentUser.last_name,
                        date_time:x.toString(),
                        file_name:selectedPhotoFile.name 
                    };
                    console.log("about to send: ", obj)
                    Activity.save( {activityObj: obj}, function(result) {
                        console.log(result);
                    }, function errorHandling(err) {
                        console.log("Error creating activity-object.");
                    });    
                    //-------------------------------------------     
                }).error(function(err){
                    // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                    console.error('ERROR uploading photo', err);
                });
            };
        //--------------------------------------------------------//
        $scope.deleteFunction = function() {
            $location.path('/delete-user');
        }
        $scope.activityFunction = function() {
            $location.path('/activity-feed');
        }
        
        
    }]);


