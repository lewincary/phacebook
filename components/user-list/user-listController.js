'use strict';

var cUser = "initial";

cs142App.controller('UserListController', ['$scope', '$resource', '$rootScope',
    function ($scope, $resource, $rootScope) {
        console.log($rootScope.loggedIn);
        console.log("about to make the call to server");   
        $scope.$on('SloggedIn', function() {
                //reload user list 
                var UserList = $resource('/user/list'); 
                UserList.query({}, {}, function(userlist) {
                	console.log(userlist);
                	var response = userlist;
                	$scope.users = response;
                }, function errorHandling(err) {
                	console.log(err);
                });
        });
        $scope.$on('loggedOut', function() {
                $scope.users = "";
        });
    }]);