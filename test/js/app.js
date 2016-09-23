'use strict';

var app = angular.module("sampleApp", ["ngRoute", "googlechart"]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "/html/main.html",
        controller : "campaignListController"
    })
    .when("/camp/:cid", {
        templateUrl : "/html/campaign.html",
        controller : "campaignController"
    })
    .otherwise({
        templateUrl : "/html/main.html",
        controller : "campaignListController"
    });

    $locationProvider.html5Mode(true);
});

app.controller("campaignListController", function ($scope, $http) {
    $http.get("/campaigns")
    .then(function successCallback(response){
    	$scope.campaigns = response.data.campaigns;
    }, 
    function errorCallback(error){
    	console.log("error: ", error);
    });

    $scope.openCampaign = function(cid){
    	window.location.href = "/camp/" + cid;
    }
});

app.controller("campaignController", function ($scope, $routeParams, $http, $timeout) {
	$scope.headingTitle = ["Red", "Green", "Blue", "Yellow", "Purple", "Orange"][$routeParams.cid];
	$scope.count = 0;
	$scope.campaignData = {
		"totalClicks" : 0,
		"totalImpressions" : 0,
		"totalUsers" : 0
	};

	$scope.arraySMA = [];
	$scope.dataPullCount = 10;
    // Function to get the data
  	$scope.getData = function(){
    	$http.get("/campaigns/" + $routeParams.cid + "?number=" + $scope.count)
    	.then(function successCallback(response){

    		$scope.campaignData.totalClicks += response.data.clicks;
    		$scope.campaignData.totalImpressions += response.data.impressions;
    		$scope.campaignData.totalUsers += response.data.users;

    		$scope.campaignData.totalCTR = (($scope.campaignData.totalClicks / $scope.campaignData.totalImpressions) * 100).toFixed(2);

    		$scope.campaignData.recentClicks = response.data.clicks;
    		$scope.campaignData.recentImpressions = response.data.impressions;
    		$scope.campaignData.recentUsers = response.data.users;

    		$scope.campaignData.recentCTR = (($scope.campaignData.recentClicks / $scope.campaignData.recentImpressions) * 100).toFixed(2);

    		$scope.computeSMAData();

    		$scope.pageLoading = false;

    		$scope.count++;
    	},
    	function errorCallback(error){
    		console.log("error: ", error);
    	});
  	};

  	$scope.computeSMAData = function(){
  		$scope.campaignData.smaClicksValue = 0;
  		$scope.campaignData.smaImpressionsValue = 0;
  		$scope.campaignData.smaUsersValue = 0;
  		var meanCount = ($scope.count < $scope.dataPullCount) ? ($scope.count + 1) : $scope.dataPullCount;

  		$scope.dataPullObject = {
  			"clicks" : $scope.campaignData.recentClicks,
  			"impressions" : $scope.campaignData.recentImpressions,
  			"users" : $scope.campaignData.recentUsers,
  			"count" : $scope.count + 1
  		};

  		if($scope.dataPullObject.count > meanCount)
  			$scope.arraySMA.shift();

  		$scope.arraySMA.push($scope.dataPullObject);

  		angular.forEach($scope.arraySMA, function(value, key) {
		  	$scope.campaignData.smaClicksValue += value.clicks;
		  	$scope.campaignData.smaImpressionsValue += value.impressions;
		  	$scope.campaignData.smaUsersValue += value.users;
		});

		$scope.campaignData.smaClicksValue = ($scope.campaignData.smaClicksValue / meanCount).toFixed(2);
		$scope.campaignData.smaImpressionsValue = ($scope.campaignData.smaImpressionsValue / meanCount).toFixed(2);
		$scope.campaignData.smaUsersValue = ($scope.campaignData.smaUsersValue / meanCount).toFixed(2);

		$scope.drawChart();
  	};

  	$scope.updateData = function(){
  		$scope.pageLoading = true;
  	};

  	$scope.intervalFunction = function(){
  		if($routeParams.cid > -1 && $routeParams.cid != undefined)
  		{
		    $timeout(function() {
		    	if($routeParams.cid > -1 && $routeParams.cid != undefined)
		      		$scope.getData();

		      	$scope.intervalFunction();
		    }, 5000)
		}
	};

	$scope.drawChart = function(){
		$scope.myChartObject = {};

	    $scope.myChartObject.type = "ColumnChart";

	    $scope.myChartObject.data = {"cols": [
	        {id: "t", label: "Event", type: "string"},
	        {id: "s", label: "SMA", type: "number"}
	    ], "rows": [
	        {c: [
	            {v: "Clicks"},
	            {v: $scope.campaignData.smaClicksValue},
	        ]},
	        {c: [
	            {v: "Impressions"},
	            {v: $scope.campaignData.smaImpressionsValue},
	        ]},
	        {c: [
	            {v: "Users"},
	            {v: $scope.campaignData.smaUsersValue}
	        ]}
	    ]};

	    $scope.myChartObject.options = {
	        'title': 'Simple Moving Average'
	    };
	};

	$scope.getData();
	$scope.intervalFunction();
});
