// Generated by CoffeeScript 1.7.1
(function() {
  var BlogView, PlayerView, Post, PostView, Posts,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Tuneiversal = {
    Models: {},
    Collections: {},
    Views: {},
    isMobile: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)
  };

  Post = (function(_super) {
    __extends(Post, _super);

    function Post() {
      return Post.__super__.constructor.apply(this, arguments);
    }

    return Post;

  })(Backbone.Model);

  Posts = (function(_super) {
    __extends(Posts, _super);

    function Posts() {
      return Posts.__super__.constructor.apply(this, arguments);
    }

    Posts.prototype.model = Post;

    return Posts;

  })(Backbone.Collection);

  PostView = (function(_super) {
    __extends(PostView, _super);

    function PostView() {
      return PostView.__super__.constructor.apply(this, arguments);
    }

    PostView.prototype.el = $(".post.item");

    PostView.prototype.events = function() {
      var eventsHash;
      eventsHash = {};
      if (Tuneiversal.isMobile) {
        return _.extend(eventsHash, {
          "click .mobile-play": "mobile_play"
        });
      } else {
        return _.extend(eventsHash, {
          "click .overlay": "play"
        });
      }
    };

    PostView.prototype.initialize = function() {
      this.model.view = this;
      return console.log("post_view initialize " + (this.model.get("title")));
    };

    PostView.prototype.parse_url = function(url) {
      return url.split('v=')[1].split('&')[0];
    };

    PostView.prototype.play = function() {
      console.log("clicked play " + (this.model.get("title")));
      $('.body-container').addClass('player-live');
      this.song_ready = new $.Deferred();
      $.ajax(this.model.get("url"), {
        type: "GET",
        success: (function(_this) {
          return function(data, textStatus, jqXHR) {
            var body;
            body = "<div id='body-mock'>" + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, "") + "</div>";
            $('.full-post-container').html($(body).find('.full-post').html());
            _this.model.set({
              youtube_url: $(body).find(".youtube-url").text()
            });
            return _this.song_ready.resolve();
          };
        })(this),
        error: (function(_this) {
          return function(jqXHR, textStatus, errorThrown) {
            return console.log("error");
          };
        })(this)
      });
      return this.song_ready.done((function(_this) {
        return function() {
          return Tuneiversal.yPlayer.loadVideoById(_this.parse_url(_this.model.get("youtube_url")));
        };
      })(this));
    };

    PostView.prototype.mobile_play = function() {
      this.song_ready = new $.Deferred();
      $.ajax(this.model.get("url"), {
        type: "GET",
        success: (function(_this) {
          return function(data, textStatus, jqXHR) {
            var body;
            body = "<div id='body-mock'>" + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, "") + "</div>";
            $('.full-post-container').html($(body).find('.full-post').html());
            _this.model.set({
              youtube_url: $(body).find(".youtube-url").text()
            });
            return _this.song_ready.resolve();
          };
        })(this),
        error: (function(_this) {
          return function(jqXHR, textStatus, errorThrown) {
            return console.log("error");
          };
        })(this)
      });
      return this.song_ready.done((function(_this) {
        return function() {
          return Tuneiversal.yPlayer.cueVideoById(_this.parse_url(_this.model.get("youtube_url")));
        };
      })(this));
    };

    return PostView;

  })(Backbone.View);

  BlogView = (function(_super) {
    __extends(BlogView, _super);

    function BlogView() {
      return BlogView.__super__.constructor.apply(this, arguments);
    }

    BlogView.prototype.el = $("body");

    BlogView.prototype.initialize = function() {
      var firstScript, tag;
      this.render();
      tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
      Tuneiversal.Collections.Posts = new Posts;
      return _.each($(".post.item"), function(el) {
        var post_model, post_view;
        post_model = new Post({
          title: $(el).find("h3.post-title").text(),
          url: $(el).find(".item-play").data("url")
        });
        Tuneiversal.Collections.Posts.add(post_model);
        return post_view = new PostView({
          model: post_model,
          el: el
        });
      });
    };

    BlogView.prototype.render = function() {};

    return BlogView;

  })(Backbone.View);

  Tuneiversal.Views.blog_view = new BlogView;

  PlayerView = (function(_super) {
    __extends(PlayerView, _super);

    function PlayerView() {
      this.player_state_change = __bind(this.player_state_change, this);
      return PlayerView.__super__.constructor.apply(this, arguments);
    }

    PlayerView.prototype.el = $(".player-container");

    PlayerView.prototype.events = {
      "click .play-button": "play_pause",
      "click .stop-button": "stop",
      "click .next-button": "next_track",
      "click .youtube-close": "close_modal",
      "click .youtube-show": "show_modal"
    };

    PlayerView.prototype.cue = [];

    PlayerView.prototype.initialize = function() {
      var that;
      that = this;
      this.isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
      return window.playerReady.done((function(_this) {
        return function() {
          if (_this.isMobile) {
            _this.firstSongLoaded = new $.Deferred();
            $.ajax(Tuneiversal.Collections.Posts.first().get('url'), {
              type: 'GET',
              success: function(data, textStatus, jqXHR) {
                var body;
                body = "<div id='body-mock'>" + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, "") + "</div>";
                Tuneiversal.Collections.Posts.first().set({
                  youtube_url: $(body).find(".youtube-url").text()
                });
                return _this.firstSongLoaded.resolve();
              }
            });
            return _this.firstSongLoaded.done(function() {
              return Tuneiversal.yPlayer = new YT.Player("youtube-embed-mobile", {
                height: "200",
                width: "100%",
                videoId: Tuneiversal.Collections.Posts.first().get('youtube_url').split('v=')[1].split('&')[0],
                events: {
                  "onReady": that.player_ready,
                  "onStateChange": that.player_state_change
                }
              });
            });
          } else {
            return Tuneiversal.yPlayer = new YT.Player("youtube-embed", {
              height: "00",
              width: "00",
              videoId: "M7lc1UVf-VE",
              events: {
                "onReady": that.player_ready,
                "onStateChange": that.player_state_change
              }
            });
          }
        };
      })(this));
    };

    PlayerView.prototype.show_modal = function() {
      $('.youtube-container-mobile').show();
      return $('.youtube-show').hide();
    };

    PlayerView.prototype.close_modal = function() {
      $('.youtube-container-mobile').hide();
      return $('.youtube-show').show();
    };

    PlayerView.prototype.player_ready = function() {
      return console.log("player_ready");
    };

    PlayerView.prototype.player_state_change = function() {
      var current_state;
      current_state = Tuneiversal.yPlayer.getPlayerState();
      if (current_state === 1) {
        this.show_player();
        $(".play-button").css("background-image", "url('http://www.tuneiversal.com/hs-fs/hub/160982/file-630196930-png/images/player_controls/pause.png')");
        return this.inter_id = setInterval(this.update_progress, 100);
      } else if (current_state === 5) {
        this.show_player();
        return this.show_modal();
      } else {
        $(".play-button").css("background-image", "url('http://www.tuneiversal.com/hs-fs/hub/160982/file-625113038-png/images/player_controls/play.png')");
        return clearInterval(this.inter_id);
      }
    };

    PlayerView.prototype.play_pause = function() {
      var current_state;
      console.log("play_pause called");
      current_state = Tuneiversal.yPlayer.getPlayerState();
      if (current_state === 1) {
        return Tuneiversal.yPlayer.pauseVideo();
      } else if (current_state === 2) {
        return Tuneiversal.yPlayer.playVideo();
      }
    };

    PlayerView.prototype.stop = function() {
      return Tuneiversal.yPlayer.stopVideo();
    };

    PlayerView.prototype.next_track = function() {};

    PlayerView.prototype.update_progress = function() {
      var percent, percent_str;
      percent = (Tuneiversal.yPlayer.getCurrentTime() / Tuneiversal.yPlayer.getDuration()) * 100;
      percent_str = "" + percent + "%";
      return $(".player-container").find('.progress-bar').css('width', "" + percent_str);
    };

    PlayerView.prototype.show_player = _.once(function() {
      return $(this.el).show();
    });

    return PlayerView;

  })(Backbone.View);

  Tuneiversal.Views.player_view = new PlayerView;

}).call(this);
