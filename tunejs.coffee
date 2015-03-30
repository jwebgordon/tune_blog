window.Tuneiversal = 
   Models: {}
   Collections: {}
   Views: {}
   isMobile: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)

class Post extends Backbone.Model

class Posts extends Backbone.Collection
   model: Post

class PostView extends Backbone.View

   el: $ ".post.item"   

   events: () ->
      eventsHash = {}
      if Tuneiversal.isMobile
         _.extend eventsHash, "click .mobile-play": "mobile_play"
      else
         _.extend eventsHash, "click .overlay": "play"
      

   initialize: ->
      @model.view = @
      console.log "post_view initialize #{@model.get("title")}"

   parse_url: (url) ->
      url.split('v=')[1].split('&')[0]

   play: ->
      console.log "clicked play #{@model.get("title")}"
      $('.body-container').addClass('player-live')
      @song_ready = new $.Deferred()
      $.ajax @model.get("url"),
         type: "GET"
         success: (data, textStatus, jqXHR) =>
            body = "<div id='body-mock'>" + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, "") + "</div>"
            $('.full-post-container').html($(body).find('.full-post').html())
            @model.set youtube_url: $(body).find(".youtube-url").text()
            @song_ready.resolve()
         error: (jqXHR, textStatus, errorThrown) =>
            console.log("error")
      @song_ready.done () =>
         Tuneiversal.yPlayer.loadVideoById(@parse_url(@model.get("youtube_url")))

   mobile_play: ->
      @song_ready = new $.Deferred()
      $.ajax @model.get("url"),
         type: "GET"
         success: (data, textStatus, jqXHR) =>
            body = "<div id='body-mock'>" + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, "") + "</div>"
            $('.full-post-container').html($(body).find('.full-post').html())
            @model.set youtube_url: $(body).find(".youtube-url").text()
            @song_ready.resolve()
         error: (jqXHR, textStatus, errorThrown) =>
            console.log("error")
      @song_ready.done () =>

         Tuneiversal.yPlayer.cueVideoById(@parse_url(@model.get("youtube_url")))   


class BlogView extends Backbone.View
   el: $ "body"

   initialize: ->
      @render()
      tag = document.createElement "script"
      tag.src = "https://www.youtube.com/iframe_api"
      firstScript = document.getElementsByTagName("script")[0]
      firstScript.parentNode.insertBefore tag, firstScript

      Tuneiversal.Collections.Posts = new Posts
      # posts = $ ".post.item"
      # for post, i in posts
      #  post_model = new Post
      #     title: posts.eq(i).find("h3.post-title").text()
      #     url:  posts.eq(i).find(".play-track").data("url")
      #  Tuneiversal.Collections.Posts.add post_model
      #  post_view = new PostView model: post_model
      _.each $(".post.item"), (el) ->
         post_model = new Post
            title: $(el).find("h3.post-title").text()
            url:  $(el).find(".item-play").data("url")
         Tuneiversal.Collections.Posts.add post_model
         post_view = new PostView model: post_model, el: el

   render: ->
      # posts = $ ".post.item"
      # for post in posts
      #  new PostView
Tuneiversal.Views.blog_view = new BlogView

class PlayerView extends Backbone.View
   el: $ ".player-container"
   events:
      "click .play-button": "play_pause"
      "click .stop-button": "stop"
      "click .next-button": "next_track"
      "click .youtube-close": "close_modal"
      "click .youtube-show": "show_modal"

   cue: []

   initialize: ->
      that = @
      @isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)
      window.playerReady.done () =>
         if @isMobile
            @firstSongLoaded = new $.Deferred()
            $.ajax Tuneiversal.Collections.Posts.first().get('url'),
               type: 'GET'
               success: (data, textStatus, jqXHR) =>
                  body = "<div id='body-mock'>" + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, "") + "</div>"
                  Tuneiversal.Collections.Posts.first().set youtube_url: $(body).find(".youtube-url").text()
                  @firstSongLoaded.resolve()
            @firstSongLoaded.done () =>
               Tuneiversal.yPlayer = new YT.Player "youtube-embed-mobile",
                  height: "200"
                  width: "100%"
                  videoId: Tuneiversal.Collections.Posts.first().get('youtube_url').split('v=')[1].split('&')[0]
                  events:
                     "onReady": that.player_ready
                     "onStateChange": that.player_state_change
         else
            Tuneiversal.yPlayer = new YT.Player "youtube-embed",
               height: "00"
               width: "00"
               videoId: "M7lc1UVf-VE"
               events:
                  "onReady": that.player_ready
                  "onStateChange": that.player_state_change
   show_modal: ->
      $('.youtube-container-mobile').show()
      $('.youtube-show').hide()
   close_modal: ->
      $('.youtube-container-mobile').hide()
      $('.youtube-show').show()

   player_ready: ->
      console.log "player_ready"

   player_state_change: =>
      current_state = Tuneiversal.yPlayer.getPlayerState()
      if current_state == 1
         @show_player()
         $(".play-button").css("background-image", "url('http://www.tuneiversal.com/hs-fs/hub/160982/file-630196930-png/images/player_controls/pause.png')")
         @inter_id = setInterval @update_progress, 100
      else if current_state == 5
         @show_player()
         @show_modal()
      else
         $(".play-button").css("background-image", "url('http://www.tuneiversal.com/hs-fs/hub/160982/file-625113038-png/images/player_controls/play.png')")
         clearInterval @inter_id

   play_pause: ->
      console.log "play_pause called"
      current_state = Tuneiversal.yPlayer.getPlayerState()
      if current_state == 1
         Tuneiversal.yPlayer.pauseVideo()
      else if current_state == 2
         Tuneiversal.yPlayer.playVideo()

   stop: ->
      Tuneiversal.yPlayer.stopVideo()

   next_track: ->

   update_progress: ->
      percent = (Tuneiversal.yPlayer.getCurrentTime()/Tuneiversal.yPlayer.getDuration())*100
      percent_str = "#{percent}%"
      $(".player-container").find('.progress-bar').css 'width', "#{percent_str}"

   show_player: _.once () ->
      $(@el).show()


Tuneiversal.Views.player_view = new PlayerView






   





