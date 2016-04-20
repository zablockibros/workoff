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

  dataFactory.logout = function(id) {
      return $http.post(apiUrl + '/logout');
  };

  dataFactory.login = function(data) {
      return $http.post(apiUrl + '/login', data);
  };

  dataFactory.signup = function(data) {
      return $http.post(apiUrl + '/signup', data);
  };

  return dataFactory;

}])
.controller('AppController', function(dataFactory, $timeout) {

  var app = this;

  app.state = {
    showing: 'hot',
    post: {
      data: {
        title: '',
        content: '',
        link: ''
      },
      submitting: false,
      error: '',
      errors: []
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

  /**
   *  Checkers/getters
   */
  app.countPostLength = function() {
    return app.state.post.data.content.length;
  };

  app.getPosts = function() {
    return app.state.posts;
  }

  /**
   *  Action functions
   */
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
        app.state.posts = data.data.posts;
        app.state.page = data.data.page;
        app.state.sort = data.data.sort;
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
    if (event) {
      event.preventDefault();
    }
    if (app.state.post.submitting) {
      return false;
    }

    app.state.post.submitting = true;

    dataFactory.postPost(app.state.post.data).then(function(data) {
      console.log(data);
      $timeout(function() {
        // clear posting data
        app.state.post.data.title = app.state.post.data.content = app.state.post.data.link = '';
      });
    }, function(err) {
      console.log(err);
      $timeout(function() {
        app.state.post.submitting = false;
        if (err.data.error) {
          app.state.post.error = err.data.error;
        } else {
          app.state.post.error = '';
        }
        if (err.data.errors) {
          app.state.post.errors = err.data.errors;
        } else {
          app.state.post.errors = [];
        }
        console.log(app.state.post);
      });
    });
  };

  app.upvote = function(post) {

  };

  app.downvote = function(post) {

  };

  function init() {
    app.fetchPosts(app.state.showing);
  }

  init();

})
.controller('HomeController', function(dataFactory, $timeout) {
  console.log("start");
  var home = this;

  home.state = {
    slideOn: 'login',
    login: {
      data: {
        email: '',
        password: ''
      },
      submitting: false,
      error: '',
      errors: []
    },
    signup: {
      data: {
        email: '',
        password: '',
        confirmPassword: ''
      },
      submitting: false,
      error: '',
      errors: []
    }
  };

  home.isSubmitting = function(form) {
    if (form === 'login') {
      return home.state.login.submitting;
    } else {
      return home.state.signup.submitting;
    }
  }

  home.getSlide = function() {
    return home.state.slideOn;
  };

  home.slideToLogin = function(event) {
    if (event) {
      event.preventDefault();
    }
    home.state.slideOn = 'login';
  };

  home.slideToSignup = function(event) {
    if (event) {
      event.preventDefault();
    }
    home.state.slideOn = 'signup';
  };

  home.login = function(event) {
    if (event) {
      event.preventDefault();
    }
    if (home.state.login.submitting) {
      return false;
    }

    home.state.login.submitting = true;

    dataFactory.login(home.state.login.data).then(function(data) {
      console.log(data);
      $timeout(function() {
        window.location = '/app';
      });
    }, function(err) {
      $timeout(function() {
        home.state.login.submitting = false;
        if (err.data.error) {
          home.state.login.error = err.data.error;
        } else {
          home.state.login.error = '';
        }
        if (err.data.errors) {
          home.state.login.errors = err.data.errors;
        } else {
          home.state.login.errors = [];
        }
        console.log(home.state.login);
      });
    });
  };
  home.getLoginError = function() {
    return home.state.login.error;
  };
  home.getLoginErrors = function() {
    return home.state.login.errors;
  };
  home.getLoginParamError = function(field) {
    var err = _.find(home.state.login.errors, function(error) {
      return error.param == field;
    });
    if (err !== undefined) {
      return err.msg;
    }
    return null;
  };

  home.signup = function(event) {
    if (event) {
      event.preventDefault();
    }
    if (home.state.signup.submitting) {
      return false;
    }

    home.state.signup.submitting = true;

    dataFactory.signup(home.state.signup.data).then(function(data) {
      console.log(data);
      $timeout(function() {
        window.location = '/app';
      });
    }, function(err) {
      $timeout(function() {
        home.state.signup.submitting = false;
        if (err.data.error) {
          home.state.signup.error = err.data.error;
        } else {
          home.state.signup.error = '';
        }
        if (err.data.errors) {
          home.state.signup.errors = err.data.errors;
        } else {
          home.state.signup.errors = [];
        }
        console.log(home.state.signup);
      });
    });
  };
  home.getSignupError = function() {
    return home.state.signup.error;
  };
  home.getSignupErrors = function() {
    return home.state.signup.errors;
  };
  home.getSignupParamError = function(field) {
    var err = _.find(home.state.signup.errors, function(error) {
      return error.param == field;
    });
    if (err !== undefined) {
      return err.msg;
    }
    return null;
  };

});
