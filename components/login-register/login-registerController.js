'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$routeParams', '$rootScope', '$resource', '$location',
  function ($scope, $routeParams, $rootScope, $resource, $location) { 
        
        
        
        $scope.regMessage = "";
        $scope.result = "";


        function loginFunction() {
            //var UserDetail = $resource('/admin/:userId'); 
            var Login = $resource('/admin/login');    
            var input = $scope.loginName;
            var inputPassword = $scope.loginPassword;
            //console.log(Login);
            Login.save( { loginName : input, loginPassword: inputPassword }, function(user) {
                $rootScope.loggedIn = true;
                $rootScope.user_id = user._id;
                var response = user;
                $rootScope.currentUser = response;
                $rootScope.logMessage = "Hi " + response.first_name + " " + response.last_name;
                $scope.result = "Successful login";
                console.log(response);
                
                //what do I need to do upon learning that someone has logged in?
                //need to load in the userlist
                $rootScope.$broadcast('SloggedIn');
                //-------------------------------------------
                var Activity = $resource('/activity-object');
                var x = new Date();
                var obj = { 
                    type:"User Login",
                    first_name:$rootScope.currentUser.first_name,
                    last_name:$rootScope.currentUser.last_name,
                    date_time:x.toString(),
                    photo_id:"nophoto"
                };
                console.log("about to send: ", obj)
                Activity.save( {activityObj: obj}, function(result) {
                    console.log(result);
                }, function errorHandling(err) {
                    console.log("Error creating activity-object.");
                });
                //------------------------------------------- 
                $location.path('/users/'+response._id);
                
            }, function errorHandling(err) {
                $scope.result = "No login. Try again.";
            });    
        }

        $scope.marker = 2;

        function registerFunction() {
            //regMarker = false;
            //$scope.regMessage = "asdasd";
            console.log("registering, not nec Successful");
            //ensure all fields are non null
            //$scope.marker = 0;
            //console.log($scope.marker);
            if ($scope.regUsername !== undefined && $scope.regPassword1 !== undefined && $scope.regPassword2 !== undefined && $scope.regFirstName !== undefined && $scope.regLastName !== undefined && $scope.regLocation !== undefined && $scope.regDescription !== undefined && $scope.regOccupation !== undefined) {

                console.log("all good to proceed");
                console.log($scope.regUsername);
               // $scope.marker = 1;
                //console.log($scope.marker);
                if ($scope.regPassword1 === $scope.regPassword2) {
                    //$scope.marker = 2;
                    //console.log($scope.marker);
                    console.log("all good to proceed 2");
                    var Register = $resource('/user');  
                    //regMarker = true;
                    $scope.regMessage = "Success";
                    Register.save( { loginName : $scope.regUsername, password: $scope.regPassword1, firstname: $scope.regFirstName, lastname: $scope.regLastName, location: $scope.regLocation, description: $scope.regDescription, occupation: $scope.regOccupation }, function(user) {
                        //should have sent those parameters to the server now
                        //-------------------------------------------
                        var Activity = $resource('/activity-object');
                        var x = new Date();
                        var obj = { 
                            type:"New user register",
                            first_name:$scope.regFirstName,
                            last_name:$scope.regLastName,
                            date_time:x.toString(),
                            photo_id:"nophoto"
                        };
                        console.log("about to send: ", obj)
                        Activity.save( {activityObj: obj}, function(result) {
                            console.log(result);
                        }, function errorHandling(err) {
                            console.log("Error creating activity-object.");
                        });
                        //-------------------------------------------
                    }, function errorHandling(err) {
                            //regMarker = false;
                            $scope.regMessage = "No Register. Try again.";
                            console.log("error registering");
                    }); 
                } else {
                    $scope.regMessage = "Error registering, try again. Your passwords were not the same. ";
                }
            } else {
                $scope.regMessage = "Error registering, try again. There is a blank field.";
            } 
        }


        function logoutFunction() {
            console.log("logging out");
            $rootScope.$broadcast('loggedOut');
            $rootScope.loggedIn = false;
            //send post request to destroy session login cookie
            var Logout = $resource('/admin/logout'); 
            Logout.save( {}, function(result) {
                console.log(result);
                //-------------------------------------------
                var Activity = $resource('/activity-object');
                var x = new Date();
                var obj = { 
                    type:"User Logout",
                    first_name:$rootScope.currentUser.first_name,
                    last_name:$rootScope.currentUser.last_name,
                    date_time:x.toString(),
                    photo_id:"nophoto"
                };
                console.log("about to send: ", obj)
                Activity.save( {activityObj: obj}, function(result) {
                    console.log(result);
                }, function errorHandling(err) {
                    console.log("Error creating activity-object.");
                });
                //-------------------------------------------   
            }, function errorHandling(err) {
                console.log("Error logging out. ");
            });

            //moves page back to login page
            //$location.path('/login-register'); //this line of code does nothing
            location.reload();
        }

    document.getElementById("loginButton").onclick = function() {loginFunction();};
    document.getElementById("logoutButton").onclick = function() {logoutFunction();};
    document.getElementById("registerButton").onclick = function() {registerFunction();};    
 }]);

