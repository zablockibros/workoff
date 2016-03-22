angular.module('cojabberApp', [])
.factory('dataFactory', ['$http', function($http) {
  var dataFactory = {};

  var apiUrl = 'http://127.0.0.1:3000/v1/api';

  dataFactory.getActivity = function(type) {
      return $http.get(apiUrl + '/activity?type' + type);
  };

  dataFactory.getPosts = function(sort) {
      return $http.get(apiUrl + '/posts?sort=' + sort);
  };

  dataFactory.getPost = function(id) {
      return $http.get(apiUrl + '/post/' + id);
  };

  dataFactory.postPost = function(data) {
      return $http.post(apiUrl + '/post', data);
  };

  dataFactory.upvote = function(id) {
      return $http.post(apiUrl + '/post/' + id + '/upvote', {});
  };

  dataFactory.downvote = function(id) {
      return $http.post(apiUrl + '/post/' + id + '/downvote', {});
  };

  dataFactory.deletePost = function(id) {
      return $http.delete(apiUrl + '/post/' + id + '/delete');
  };

  return dataFactory;

}])
.controller('HomeController', function() {

})
.controller('AppController', function(dataFactory, $timeout) {

  var app = this;

  app.state = {
    showing: 'hot',
    post: {
      text: ''
    },
    posts: [],
    page: 1,
    sort: '',
    fetchingPosts: false,
    activity: [] // array of Activity
  };

  function addActivity(activity) {
    app.state.activity.push(activity);
  };

  function replaceActivity(activity) {
    
  };

  app.countPostLength = function() {
    return app.state.post.text.length;
  };

  app.logout = function(event) {
    if (event) {
      event.preventDefault();
    }
    alert('logout');
  };

  app.showPoster = function(event) {
    if (event) {
      event.preventDefault();
    }
    app.state.showing = 'post';
  };

  app.showPosts = function(str, event) {
    if (event) {
      event.preventDefault();
    }
    app.state.showing = str;

    app.fetchPosts(str);
  };

  app.fetchPosts = function(sort) {
    app.state.fetchingPosts = true;

    dataFactory.getPosts(sort).then(function(data) {
      console.log(data);
      $timeout(function(){
        app.state.posts = data.posts;
        app.state.page = data.page;
        app.state.sort = data.sort;
      });
    }, function(err) {
      alert(err.data.error);
    })
    .finally(function() {
      $timeout(function() {
        app.state.fetchingPosts = false;
      });
    });
  };

  app.post = function() {

  };

  app.upvote = function(post) {

  };

  app.downvote = function(post) {

  };

});
