'use strict';

cs142App.controller('DeleteUserController', ['$scope', '$routeParams', '$rootScope', '$resource', '$location',
  function ($scope, $routeParams, $rootScope, $resource, $location) { 
              
        
        $scope.warning = "Are you sure you want to proceed? Once you have deleted your account you will have to register again to use this website. ";
        $scope.result = "";
	    
        /*$scope.commentFunction = function(comment, photoId) {
        	var addComment = $resource('/commentsOfPhoto/'+photoId);  
        	console.log(comment, photoId);

        	addComment.save( {givenComment:comment}, function(something) {
	            //don't think I need to do anything with the response
	            //location.reload();
	            $location.path('/users/'+$rootScope.user_id);
	            //$location.path(window.location.href);
        	});     
        };*/

	    $scope.deleteUserFunction = function() {
	        console.log("deleted "+$rootScope.user_id);
	        var DeleteUser = $resource('/delete/'+$rootScope.user_id);  


	        DeleteUser.save( {}, function(something) {
	            //don't need to do anything with reponse? maybe redirect to logout page
	     		console.log(something);
	     		$rootScope.loggedIn = false;
	     		location.reload();
       		 });

	    };   
 }]);

