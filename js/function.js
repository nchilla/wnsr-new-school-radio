
//starting definitions---------------------------

//values of css variables
//.setProperty('--var',set);
//.getPropertyValue('--var')
var root = getComputedStyle(document.documentElement);
var stickdist=root.getPropertyValue('--stickdist').slice(0,2);
var rsslinks=['https://rss.art19.com/memories-through-sound','https://rss.art19.com/new-school-arts-culture','https://rss.art19.com/new-school-news'];
var rssdoms=[];
var rssobj=[];
var allepisodes=[];
var currentAudio;
var playing=false;

function startUp(){
  rsslinks.forEach((item, i) => {
    rssFetch(item);
  });
}
function rssFetch(link){
  //thanks to css tricks for this rss fetch code
  fetch(link)
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => process(data.querySelector('channel')));
}
function process(data){
  rssdoms.push(data)
  if(rssdoms.length==rsslinks.length){
    domToObj();
  }
}

function domToObj(){
  rssdoms.forEach((item, i) => {
    var d=d3.select(item);
    rssobj.push({
      title:d.select('title').text(),
      description:tagRemove(d.select('description').node().childNodes[1].nodeValue),
      image:d.select('image').attr('href'),
      episodes:[]
    });
    item.querySelectorAll('item').forEach((episode, e) => {
      var ep=d3.select(episode);
      rssobj[i].episodes.push({
        title:ep.select('title').text(),
        series:rssobj[i].title,
        pubDate:ep.select('pubDate').text(),
        description:descVal(ep.select('description').node().childNodes[1]),
        summary:ep.select('summary').text(),
        image:ep.select('image').attr('href'),
        audio:ep.select('enclosure').attr('url')
      })
    });
    allepisodes=allepisodes.concat(rssobj[i].episodes)

  });
  //thanks to stackOverflow user ryandlf for this sort-by-date method
  //https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
  allepisodes=allepisodes.sort(function(a, b) {
  a = new Date(a.pubDate);
  b = new Date(b.pubDate);
  return a>b ? -1 : a<b ? 1 : 0;
  });
  episode(allepisodes[0])
  console.log(allepisodes[0]);
  console.log(rssobj);
  // console.log(rssdoms[0])
}

//RSS parsing tools---------------
function descVal(node){
  if(node!==undefined){
    return tagRemove(node.nodeValue);
  }else{
    return '';
  }
}
function tagRemove(string){
  var output=string;
  var lastLar=/<(?!.*<)/g;
  var firstRar=/>/g;
  var lastInd=output.search(lastLar);
  var firstInd=output.search(firstRar);
  output=output.slice(0,lastInd);
  output=output.slice(firstInd+1,output.length);
  // output=output.slice(0,firstInd);
  return output;
}

//building dom from rss data
function episode(data){
  var ep=d3.select('.episode');
  ep.datum(data);
  ep.select('.title').html(data.title);
  ep.select('.desc').html(data.summary);
  ep.select('img').attr('src',data.image);
  if(data==allepisodes[0]){
    ep.select('.kicker').html('Latest — ');
  }else{
    ep.select('.kicker').html('Play — ');
  }

  // liveAudio(data.audio);

  ep.select('#playtoggle').on('click',function(){
    toggleAudio();
  });
}

function liveAudio(url) {
  var audiotag=document.querySelector('audio');
  audiotag.src=url;
  var context=new (window.AudioContext || window.webkitAudioContext)();
  var source=context.createMediaElementSource(audiotag);
  console.log(context);

  //
  // fetch(url)
  //   .then(response => source=context.createMediaElementSource(response))
  // console.log(context);
  // var analyser=context.createAnalyser();
  // source.connect(analyser);
  // analyser.connect(context.destination);


  // analyser.fftSize = 32;

}





function toggleAudio(){
  if(playing==false){
    // currentAudio.play();
    // playing=true;
    d3.select('#playtoggle').html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><rect class="cls-1" width="70.19" height="225.09"/><rect class="cls-1" x="124.74" width="70.19" height="225.09"/></g></g></svg>');
  }else{
    // currentAudio.pause();
    // playing=false;
    d3.select('#playtoggle').html('<svg id="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><polygon class="cls-1" points="0 112.54 0 0 97.47 56.27 194.93 112.54 97.47 168.82 0 225.09 0 112.54"/></g></g></svg>');
  }
}

// const parseAudio = url => {
// fetch(url)
//   .then(response => response.arrayBuffer())
//   .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
//   .then(audioBuffer => visualize(audioBuffer));
// };






function visualize(audioBuffer){
  console.log(audioBuffer);
  console.log(audioBuffer.getChannelData(0));
}

function scrollHandle(e){
  var scroll=[document.querySelector('.logo.scroll'),document.querySelector('.menu.scroll')];
  var fixed=[document.querySelector('.logo.fixed'),document.querySelector('.menu.fixed')];
  // var logodist=document.querySelector('.logo.scroll').getBoundingClientRect().top;
  scroll.forEach((item, i) => {
    var dist=item.getBoundingClientRect().top;
    if(dist<=20){
      d3.select(scroll[i]).style('opacity',0);
      d3.select(fixed[i]).style('opacity',1);
      d3.select('#nav').style('background-color',`rgba(255,255,255,${(i==1)?1:0})`)
    }else{
      d3.select(scroll[i]).style('opacity',1);
      d3.select(fixed[i]).style('opacity',0);
    }
  });
}











window.addEventListener('scroll',scrollHandle);
window.addEventListener('resize',scrollHandle);
window.onload=startUp;
