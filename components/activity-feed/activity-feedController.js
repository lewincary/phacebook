'use strict';

cs142App.controller('ActivityFeedController', ['$scope', '$routeParams', '$rootScope', '$resource', '$location',
  function ($scope, $routeParams, $rootScope, $resource, $location) { 
        $rootScope.context = "Activity feed";      
        var UserList = $resource('/activity-object/list'); 
        UserList.query({}, {}, function(activitylist) {
                console.log(activitylist);
                var response = activitylist;
               	$scope.activitylist = response;
               	$scope.filename = response.file_name;
            }, function errorHandling(err) {
               	console.log(err);
        });

	    $scope.refreshFunction = function() {
	        console.log("deleted "+$rootScope.user_id);
            UserList.query({}, {}, function(activitylist) {
                console.log(activitylist);
                var response = activitylist;
               	$scope.activitylist = response;
               	$scope.filename = response.file_name;
            }, function errorHandling(err) {
               	console.log(err);
        });
	    };   
 }]);

