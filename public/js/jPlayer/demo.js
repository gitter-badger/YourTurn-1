
var myPlaylist = new jPlayerPlaylist({
  jPlayer: "#jplayer_N",
  cssSelectorAncestor: "#jp_container_N"
}, [
  // Empty Playlist
], {
  playlistOptions: {
    enableRemoveControls: true,
    autoPlay: true
  },
  swfPath: "js/jPlayer",
  supplied: "m4a, mp3",
  smoothPlayBar: true,
  keyEnabled: true,
  audioFullScreen: false,
  toggleDuration: true
});

$('[role=search]').submit((e) => {
  e.preventDefault();
  var searchInput = $('#searchInput').val();
  if (searchInput == '' || searchInput == undefined || searchInput == null) return;
  console.log(searchInput);

  axios.post('http://localhost:3000/search/' + searchInput).then((response) => {
    var container = $('#bjax-target');

    var h2_element = document.createElement('h2');
    h2_element.innerHTML = `Search Results for <b>${searchInput}</b>`;
    h2_element.classList = 'font-thin m-b';
    
    var searchResults = document.createElement('div');
    searchResults.classList = 'row row-sm';
    searchResults.id = 'searchResults';
    
    container.html(null);
    container.append(h2_element)
    container.append(searchResults);

    for (var i = 0; i < response.data.length; i++) {

      if (response.data[i].seconds == 0) continue; // We do not want live-streams in here! //

      var duration = moment.duration(response.data[i].seconds, 'seconds').format('mm:ss');
      if (response.data[i].seconds > 3600) {
          duration = moment.duration(response.data[i].seconds, 'seconds').format('h:mm:ss');
      }

      $('#searchResults').append(`
        <div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">
          <div class="item">
            <div class="pos-rlt">
              <div class="bottom">
                <span class="badge bg-info m-l-sm m-b-sm">${duration}</span>
              </div>
              <div class="item-overlay opacity r r-2x bg-black">
                <div class="text-info padder m-t-sm text-sm">
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star-o text-muted"></i>
                </div>
                <div class="center text-center m-t-n">
                  <a href="#" onclick="playSong('${response.data[i].videoId}')"><i class="icon-control-play i-2x"></i></a>
                </div>
                <div class="bottom padder m-b-sm">
                  <a href="#" class="pull-right"><i class="fa fa-heart-o"></i></a>
                  <a href="#" onclick="queueSong('${response.data[i].videoId}')"><i class="fa fa-plus-circle"></i></a>
                </div>
              </div>
              <a href="#"><img src="https://i.ytimg.com/vi/${response.data[i].videoId}/mqdefault.jpg" alt="" class="r r-2x img-full" ></a>
            </div>

            <div class="padder-v">
              <a href="/track-detail.html" data-bjax data-target="#bjax-target" data-el="#bjax-el" data-replace="true" class="text-ellipsis">${response.data[i].title}</a>
              <a href="/track-detail.html" data-bjax data-target="#bjax-target" data-el="#bjax-el" data-replace="true" class="text-ellipsis text-xs text-muted">${response.data[i].author.name}</a>
            </div>
          </div>
        </div>
      `)
    }

  })

})

function playSong(id) {
  axios.get('http://localhost:3000/api/video/info/' + id).then((response) => {
    myPlaylist.add({
      title: response.data.title,
      artist: response.data.author.name,
      m4a: 'http://localhost:3000/api/download/' + response.data.video_id
    }, true)
  })
}

function queueSong(id) {
  axios.get('http://localhost:3000/api/video/info/' + id).then((response) => {
    myPlaylist.add({
      title: response.data.title,
      artist: response.data.author.name,
      m4a: 'http://localhost:3000/api/download/' + response.data.video_id
    })
  })
}

$(document).ready(function(){
  
  $(document).on($.jPlayer.event.pause, myPlaylist.cssSelector.jPlayer, function(event) {
    $('.musicbar').removeClass('animate');
    $('.jp-play-me').removeClass('active');
    $('.jp-play-me').parent('li').removeClass('active');
    updatePresence({
      state: event.jPlayer.status.media.artist, 
      details: event.jPlayer.status.media.title,  
      status: 'paused'
    })
  });

  $(document).on($.jPlayer.event.seeked, myPlaylist.cssSelector.jPlayer, function (event) {
    updatePresence({
      state: event.jPlayer.status.media.artist, 
      details: event.jPlayer.status.media.title, 
      time: Math.round(event.jPlayer.status.remaining) * 1000,
      status: 'playing'
    })
  })

  $(document).on($.jPlayer.event.ended, myPlaylist.cssSelector.jPlayer, function (event) {
    updatePresence({
      state: 'Idling / Browsing',
      status: 'none'
    })
  })

  $(document).on($.jPlayer.event.playing, myPlaylist.cssSelector.jPlayer, function (event) {
    updatePresence({
      state: event.jPlayer.status.media.artist, 
      details: event.jPlayer.status.media.title,  
      time: Math.round(event.jPlayer.status.remaining) * 1000,
      status: 'playing'
    })
  })

  $(document).on($.jPlayer.event.play, myPlaylist.cssSelector.jPlayer, function(event) {
    $('.musicbar').addClass('animate');
  });

  $(document).on('click', '.jp-play-me', function(e){
    e && e.preventDefault();
    var $this = $(e.target);
    if (!$this.is('a')) $this = $this.closest('a');

    $('.jp-play-me').not($this).removeClass('active');
    $('.jp-play-me').parent('li').not($this.parent('li')).removeClass('active');

    $this.toggleClass('active');
    $this.parent('li').toggleClass('active');
    if( !$this.hasClass('active') ){
      myPlaylist.pause();
    }else{
      var i = Math.floor(Math.random() * (1 + 7 - 1));
      myPlaylist.play(i);
    }
    
  });



  // video

  $("#jplayer_1").jPlayer({
    ready: function () {
      $(this).jPlayer("setMedia", {
        title: "Big Buck Bunny",
        m4v: "http://flatfull.com/themes/assets/video/big_buck_bunny_trailer.m4v",
        ogv: "http://flatfull.com/themes/assets/video/big_buck_bunny_trailer.ogv",
        webmv: "http://flatfull.com/themes/assets/video/big_buck_bunny_trailer.webm",
        poster: "images/m41.jpg"
      });
    },
    swfPath: "js",
    supplied: "webmv, ogv, m4v",
    size: {
      width: "100%",
      height: "auto",
      cssClass: "jp-video-360p"
    },
    globalVolume: true,
    smoothPlayBar: true,
    keyEnabled: true
  });

});