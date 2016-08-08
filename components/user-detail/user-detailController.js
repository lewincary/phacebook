'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$rootScope', '$resource', '$location',
  function ($scope, $routeParams, $rootScope, $resource, $location) { 
    $scope.curID = $routeParams.userId;
    var userId = $routeParams.userId;
    //$scope.test = //session state current user
    var UserDetail = $resource('/user/:id');    
    UserDetail.get( { id : userId }, function(user) {
        var response = user;
        $scope.cID = response._id;
        $scope.cfirstname = response.first_name;
        $scope.clastname = response.last_name;
        $scope.clocation = response.location;
        $scope.cdescription = response.description;
        $scope.coccupation = response.occupation;
        $rootScope.context = response.first_name + " " + response.last_name;
        $rootScope.firstname = response.first_name;
        $rootScope.lastname = response.last_name;
    });   
  }]);
