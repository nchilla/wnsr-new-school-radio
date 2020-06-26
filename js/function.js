
//starting definitions---------------------------
var root = getComputedStyle(document.documentElement);
var stickdist=root.getPropertyValue('--stickdist').slice(0,2);
var rsslinks=['https://rss.art19.com/memories-through-sound','https://rss.art19.com/new-school-arts-culture','https://rss.art19.com/new-school-news'];
var rssdoms=[];
var rssobj=[];
var allepisodes=[];
var currentAudio;
var playing=false;
var showDesc=true;
var currentPage=1;

//audiocontext definitions
var url='https://wnsr-cors.herokuapp.com/https://rss.art19.com/episodes/72a3bc7e-118a-4171-8be4-125913860ef7.mp3';
var audiotag=document.querySelector('audio');
var AudioContext = window.AudioContext || window.webkitAudioContext;
let OfflineAudioContext =window.OfflineAudioContext || window.webkitOfflineAudioContext;
var context;
var statcontext;
var analyser;
var source;
var loopf;
var visualEngage=false;
var previous;
var activated=false;
var atpresent=0;



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
  buildShows();
  episode(allepisodes[0]);


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
  showDesc=true;
  toggleText();
  ep.select('img').attr('src',data.image);
  if(data==allepisodes[0]){
    ep.select('.kicker').html('Latest — ');
  }else{
    ep.select('.kicker').html('Play — ');
  }
  atpresent=0;
  connectAudio(data.audio)
  // liveAudio(data.audio);

  ep.select('#playtoggle').on('click',function(){
    toggleAudio();
  });
}

function toggleText(){
  var ep=d3.select('.episode');
  var epdata=ep.datum()
  if(showDesc==true){
    ep.select('.information')
    .html(epdata.summary)
    .append('span')
    .attr('class','togglesummary')
    .html('more info');
    showDesc=false;
  }else{
    ep.select('.information')
    .html(epdata.description)
    .append('span')
    .attr('class','togglesummary')
    .html('collapse info');
    showDesc=true;
  }
  ep.select('.togglesummary').on('click',function(){
    toggleText();
  })
}

function toggleAudio(){
  if(audiotag.paused){
    if(visualEngage==false){
      startVisual();
      visualEngage=true;
    }
    audiotag.play();
    d3.select('#playtoggle').html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><rect class="cls-1" width="70.19" height="225.09"/><rect class="cls-1" x="124.74" width="70.19" height="225.09"/></g></g></svg>');
  }else{
    audiotag.pause();
    d3.select('#playtoggle').html('<svg id="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><polygon class="cls-1" points="0 112.54 0 0 97.47 56.27 194.93 112.54 97.47 168.82 0 225.09 0 112.54"/></g></g></svg>');
  }
}

function connectAudio(url) {
  context=new AudioContext();
  // context.createGain();
  audiotag.crossOrigin="anonymous";
  audiotag.preload="auto";
  audiotag.src=url;
  if(activated==false){
    source=context.createMediaElementSource(audiotag);
    analyser=context.createAnalyser();
    source.connect(analyser);
    analyser.connect(context.destination);
    analyser.smoothingTimeConstant=0.85
    analyser.fftSize = 16384;
  }
  audiotag.currentTime=atpresent;
  audiotag.addEventListener('timeupdate', function(e){updateTrack();});
  audiotag.addEventListener('ended',function(e){
    atpresent=0;
    audiotag.currentTime=atpresent;
    updateTrack();
    audiotag.pause();
    d3.select('#playtoggle').html('<svg id="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><polygon class="cls-1" points="0 112.54 0 0 97.47 56.27 194.93 112.54 97.47 168.82 0 225.09 0 112.54"/></g></g></svg>');
    // toggleAudio();
  })
  activated=true;
  // startVisual();
}
function startVisual(){
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  function updateDisplay() {
    loopf=requestAnimationFrame(updateDisplay);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray.slice(100,150),-100,100);

  }

    // context.resume();
  context.resume();
  updateDisplay();
  // audiotag.play();
}
function draw(arr,min,max){
  var sliced=arr
  var mean=d3.mean(sliced);
  sliced[0]=mean;
  sliced[sliced.length-1]=mean;
  var freq=[];
  var vals=[];
  sliced.forEach((item, i) => {
    freq.push({step:i,value:item-mean});
    vals.push(item-mean);
  });
  var xPram=d3.scaleLinear()
    .domain([0,sliced.length-1])
    .range([0, 100]);
  var yPram=d3.scaleLinear()
    .domain([min,max])
    .range([25, 75]);
  var line=d3.line()
  .x(d => xPram(d.step))
  .y(d => 100-yPram(d.value))
  .curve(d3.curveCatmullRom.alpha(0.5));
  if(previous!==freq){
    d3.select('#wave').select('path')
    .datum(freq)
    .attr('d',line);
    previous=freq;
  }

}

function updateTrack(){
  var newVal=audiotag.currentTime/audiotag.duration*100;
  if(isNaN(newVal)){
    newVal=0;
  }
  d3.select('.seekbar').property('value',newVal);

}
document.querySelector('.seekbar').addEventListener('change',function(e){
  var newVal=d3.select('.seekbar').property('value')/100*audiotag.duration;
  if(activated==true){
    audiotag.currentTime=newVal;
  }
  atpresent=newVal;
})

function buildShows(){
  var sorted=rssobj.sort(function(a,b){
    if(a.title==allepisodes[0].series){
      return -1;
    }else{
      return 0;
    }
  })
  var shows=d3.select('#shows')
  sorted.forEach((item, i) => {
    shows.append('div').attr('class','show').datum(item);
    var theshow=d3.select(document.querySelectorAll('.show')[i]);
    if(i==0){theshow.attr('id','focused')};
    theshow.append('img').attr('src',item.image).attr('class','focus-img');
    theshow.append('p').append('span').attr('class','show-title').html(item.title);
    theshow.select('p').append('span').attr('class','show-expand episodes')
    theshow.select('p').append('span').attr('class','show-expand pageflip noselect')
    .append('span').attr('class','backflip').html('back');
    theshow.select('.pageflip').append('span').attr('class','nextflip').html('more');
    var sExpand=theshow.select('.episodes')
    sExpand.append('span').html(item.description);
    var pagecounter=1;
    var epcounter=0;
    item.episodes.forEach((ep, e) => {
      sExpand.append('span')
      .attr('class','ep-preview epwave'+pagecounter)
      .datum(ep)
      .html(ep.title);
      epcounter++;
      if(epcounter>4){
        pagecounter++;
        epcounter=0;
      }
    });
    d3.selectAll('.epwave1').classed('epshowing',true)
    theshow.datum().pagecount=pagecounter;
  });
  d3.selectAll('.show').on('click',function(event){
    if(event.title!==d3.select('#focused').datum().title){
      d3.select('#focused').attr('id','');
      var thetarget=d3.selectAll('.show').filter(function(d,i){if(d.title==event.title){return true}})
      thetarget.attr('id','focused');
      pageControls(1);
    }
  })
  d3.selectAll('.ep-preview').on('click',function(event){
    if(!audiotag.paused){
      toggleAudio()
    }
    episode(event);
    atpresent=0;
    audiotag.currentTime=atpresent;
    updateTrack();
    toggleAudio();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    // d3.select('.seekbar').property('value',0);
  })
  d3.selectAll('.nextflip').on('click',function(event){
    pageControls('next');
  })
  d3.selectAll('.backflip').on('click',function(event){
    pageControls('back');
  })

}





function pageControls(dir){
  var focused=d3.select('#focused')

  if(dir=='next'){
    currentPage++;
  }else if(dir=='back'){
    currentPage--;
  }else{
    currentPage=dir;
  }
  toPage=currentPage;
  d3.selectAll('.epshowing').classed('epshowing',false);
  d3.selectAll('.epwave'+toPage).classed('epshowing',true);
  focused.select('.nextflip').style('display','inline');
  focused.select('.backflip').style('display','inline');
  if(focused.datum().pagecount<2){
    focused.select('.nextflip').style('display','none');
    focused.select('.backflip').style('display','none');
  }else if(currentPage==focused.datum().pagecount){
    focused.select('.nextflip').style('display','none');
  }else if(currentPage==1){
    focused.select('.backflip').style('display','none');
  }
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
