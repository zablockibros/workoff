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

  dataFactory.logout = function(id) {
      return $http.post(apiUrl + '/logout');
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
      text: '',
      submitting: false
    },
    posts: [],
    page: 1,
    sort: '',
    fetchingPosts: false,
    activity: [], // array of Activity
    upvoted: [], // array of post keys that this user upvoted
    downvoted: [] // array of post keys that this user downvoted
  };

  function addActivity(activity) {
    app.state.activity.push(activity);
  };

  function replaceActivity(activity) {
    var current = _.find(app.state.activity, function(obj) {
      obj.id == activity.id;
    });
    if (current !== undefined) {
      current = activity;
    }
  };

  function removeActivity(activity) {
    app.state.activity = _.filter(app.state.activity, function(obj) {
      return obj.id !== activity.id;
    });
  }

  function pluckVotes(activities) {
      var filtered = _.filter(activities, function(activity) {
        return activity.type == 'vote';
      });
      var upvotes = _.map(
        _.filter(filtered, function(activity) {
          return activity.value == 1;
        }),
        function(activity) {
          return activity.id;
        }
      );
      var downvotes = _.map(
        _.filter(filtered, function(activity) {
          return activity.value == -1;
        }),
        function(activity) {
          return activity.id;
        }
      );
      app.state.upvoted = upvotes;
      app.state.downvoted = downvotes;
  };
  function addUpvoted(id) {
    if (!(id in app.state.upvoted)) {
      app.state.upvoted.push(id);
    }
  }
  function addDownvoted(id) {
    if (!(id in app.state.downvoted)) {
      app.state.downvoted.push(id);
    }
  }
  function removeUpvoted(id) {
    app.state.upvoted = _.filter(app.state.upvoted, function(voteId) {
      return voteId != id;
    })
  }
  function removeDownvoted(id) {
    app.state.downvoted = _.filter(app.state.downvoted, function(voteId) {
      return voteId != id;
    })
  }

  app.countPostLength = function() {
    return app.state.post.text.length;
  };

  app.logout = function(event) {
    if (event) {
      event.preventDefault();
    }

    dataFactory.logout().then(function(data) {
      window.location = '/';
    });
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
