let discoverList = ['LACbVhgtx9I', 'sd6_PHCdCZI', 'fekYomiYcwI', 'b5CjN9ctoBg', 'ZiUBEr3ZZx4', 'muBgT_QQ2F4', 'ajY2Ee70vNw', 'YpMxa_rfypM', 'vE2ETqUGj6Q', 'LDU_Txk06tM', '7RMC60QEVRc', 'GWmU7tW_0RQ'];
let page = {};

var mainContainer = $('#bjax-target');

page.whatsNew = () => {

    mainContainer.html(null);
    mainContainer.append(`<a href="#" class="pull-right text-muted m-t-lg" data-toggle="class:fa-spin" ><i class="icon-refresh i-lg  inline" id="refresh"></i></a>`);
    mainContainer.append(`<h2 class="font-thin m-b">Discover
        <span class="musicbar animate inline m-l-sm" style="width:20px;height:20px">
            <span class="bar1 a1 bg-primary lter"></span>
            <span class="bar2 a2 bg-info lt"></span>
            <span class="bar3 a3 bg-success"></span>
            <span class="bar4 a4 bg-warning dk"></span>
            <span class="bar5 a5 bg-danger dker"></span>
        </span>
    </h2>`)
    var discoverSongs = document.createElement('div');
    discoverSongs.classList = 'row row-sm';
    discoverSongs.id = 'discoverSongs';
    mainContainer.append(discoverSongs);

    for (i = 0; i < discoverList.length; i++) { 
        axios.get('http://localhost:3000/api/video/info/' + discoverList[i]).then((response) => {

            var duration = moment.duration(parseInt(response.data.length_seconds), 'seconds').format('mm:ss');
            if (parseInt(response.data.length_seconds) > 3600) {
                duration = moment.duration(parseInt(response.data.length_seconds), 'seconds').format('h:mm:ss');
            }

            $('#discoverSongs').append(`<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2">
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
                                <a href="#" onclick="playSong('${response.data.video_id}')"><i class="icon-control-play i-2x"></i></a>
                            </div>
                            <div class="bottom padder m-b-sm">
                            <a href="#" class="pull-right">
                                <i class="fa fa-heart-o"></i>
                            </a>
                            <a href="#" onclick="queueSong('${response.data.video_id}')">
                                <i class="fa fa-plus-circle"></i>
                            </a>
                            </div>
                        </div>
                        <a href="#"><img src="https://i.ytimg.com/vi/${response.data.video_id}/mqdefault.jpg" alt="" class="r r-2x img-full" ></a>
                    </div>
                    <div class="padder-v">
                        <a href="#" class="text-ellipsis">${response.data.title}</a>
                        <a href="#" class="text-ellipsis text-xs text-muted">${response.data.author.name}</a>
                    </div>
                </div>
            </div>`)
        })
    }

}

$('#whatsNew').click(() => {
    page.whatsNew();
});

window.onload = () => {
    page.whatsNew();
}