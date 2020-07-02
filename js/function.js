
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
var cOffset=0;
var mouseOffset=[0.5,0.5];
var tDur=500;
var idleLoop;
var idleTiming={memory:99,waiting:false};
var fallbackNode;


var months=['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];


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

function showTrack(){
    //setting the height for the expanded tracklist----------------
    if(fallbackNode==undefined){
      fallbackNode=document.querySelector('.showbox')
      document.querySelectorAll('.showbox').forEach((item, i) => {
        if(item.scrollHeight>fallbackNode.scrollHeight){
          resizingNode=item;
        }
      });
    }
    var resizingNode=fallbackNode.scrollHeight;
    if(document.querySelectorAll('#focus').length>0){
      var tracksize=d3.select('#focus').select('.tracklist').node().getBoundingClientRect().height;
      if(d3.select('#focus').classed('showbox')){
        var imgsize=d3.select('#focus').select('img').node().getBoundingClientRect().height;
        var headsize=0;
      }else{
        var headsize=d3.select('#focus').select('.newest-header').node().getBoundingClientRect().height;
        var imgsize=0;
      }
      if(window.matchMedia('(max-width:650px)').matches){
        resizingNode=tracksize+imgsize+headsize;
      }else{
        resizingNode=(tracksize>imgsize)?tracksize:imgsize;
      }
    }
    var showtracksize=resizingNode;
    document.documentElement.style.setProperty('--showtracksize', `${showtracksize}px`);
    //setting the heights for non-expanded tracklists---------
    var nonfoc=d3.select('.showbox:not(#focus)')
    console.log(nonfoc.select('img'))
    var infoH=nonfoc.select('.show-info').node().getBoundingClientRect().height;
    var imgH=nonfoc.select('img').node().getBoundingClientRect().height;
    console.log(infoH,imgH)
    if(imgH==0){
      nonfoc.select('img').on('load',function(){
        imgH=nonfoc.select('img').node().getBoundingClientRect().height;
        nonfocProp()
      })
    }else{
      nonfocProp()
    }
    function nonfocProp(){
      if(window.matchMedia('(max-width:650px)').matches){
        document.documentElement.style.setProperty('--nonfoc', `${infoH+imgH + 20}px`);
      }else{
        document.documentElement.style.setProperty('--nonfoc', `${(infoH>imgH)?infoH:imgH + 20}px`);
      }
    }
}
function resetVh(){
  // document.documentElement.style.setProperty('--backheight','0px');
  // var docheight=$(document).height();
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  showTrack();
  // document.documentElement.style.setProperty('--backheight', `calc(${docheight}px - var(--browseheight))`);
}

firedOnce=false;
function startUp(){
  rsslinks.forEach((item, i) => {
    rssFetch(item);
  });
  idleDraw();
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
  console.log(rssobj)
  //thanks to stackOverflow user ryandlf for this sort-by-date method
  //https://stackoverflow.com/questions/10123953/how-to-sort-an-array-by-a-date-property
  allepisodes=allepisodes.sort(function(a, b) {
  a = new Date(a.pubDate);
  b = new Date(b.pubDate);
  return a>b ? -1 : a<b ? 1 : 0;
  });
  buildShows();
  episode(allepisodes[0]);
  resetVh();
  d3.select('.allepisodes').attr('id','focus')
  // document.querySelector('.showbox').addEventListener('resize',showTrack);
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
  d3.selectAll('.ep-preview').classed('sel-preview',false)
  d3.selectAll('.ep-preview').filter(function(d,i){if(d.title==data.title){return true}}).classed('sel-preview',true)
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
    idleTiming.memory=0;
    window.cancelAnimationFrame(idleLoop);
    audiotag.play();
    d3.select('#playtoggle').html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><rect class="cls-1" width="70.19" height="225.09"/><rect class="cls-1" x="124.74" width="70.19" height="225.09"/></g></g></svg>');
    playing=true;
  }else{
    audiotag.pause();
    d3.select('#playtoggle').html('<svg id="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 194.93 225.09"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><polygon class="cls-1" points="0 112.54 0 0 97.47 56.27 194.93 112.54 97.47 168.82 0 225.09 0 112.54"/></g></g></svg>');
    playing=false;
    idleDraw();
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
    idleTiming.memory=0;
    window.cancelAnimationFrame(idleLoop);
    idleDraw();
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
    loopf=window.requestAnimationFrame(updateDisplay);
    analyser.getByteFrequencyData(dataArray);
    draw(dataArray.slice(100,150),-100,100);

  }

    // context.resume();
  context.resume();
  updateDisplay();
  // audiotag.play();
}
var pathcount=0
function draw(arr,min,max){
  pathcount++;
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
  sorted.unshift({
    title:false,
    description:false,
    image:false,
    episodes:allepisodes
  })
  var stream=d3.select('#stream')
  sorted.forEach((item, i) => {
    var options={type:'showbox'}
    if(i==0){
      options.type='allepisodes';
    }
    stream.append('div').attr('class','sector '+options.type).datum(item).style('z-index',10-i)
    var psec=d3.select('.sector:last-child')
    psec.append('p').attr('class','tracklist')
    psec.select('.tracklist').append('span').attr('class','show-info')
    psec.append('div').attr('class','divider').append('div')
    if(item.title){
      psec.select('.show-info').append('span').attr('class','show-title').html(item.title+'<br>')
      psec.select('.show-info').append('span').attr('class','show-desc').html(item.description)
      psec.append('img').attr('src',item.image)
    }else{
      psec.append('p').attr('class','newest-header').html('More of our latest episodes')
    }
    psec.select('.show-info').append('div').attr('class','expander').append('div').attr('class','expbutton')
    psec.select('.expander').append('span').attr('class','show-expand pageflip noselect')
    .append('span').attr('class','backflip').html('← ');
    psec.select('.pageflip').append('span').attr('class','nextflip').html(' →');
    var pagecounter=1;
    var epcounter=0;
    item.episodes.forEach((ep, e) => {
      var pubDate=parseDate(ep.pubDate)
      psec.select('.tracklist').append('span')
      .attr('class','ep-preview noselect epwave'+pagecounter).datum(ep).html(ep.title)
      .append('div').attr('class','date').html(pubDate);
      epcounter++;
      if(epcounter>4){
        pagecounter++;
        epcounter=0;
      }
    });
    psec.datum().pagecount=pagecounter;

  });
  d3.select('.allepisodes').attr('id','focus')
  d3.selectAll('.epwave1').classed('epshowing',true)
  d3.selectAll('.expbutton').on('click',function(event){
    var selNode=d3.event.srcElement.parentNode.parentNode.parentNode.parentNode;
    var notId=(d3.select(selNode).attr('id')!=='focus')?true:false;
    d3.selectAll('#focus').attr('id','')
    if(notId){
      d3.select(selNode).attr('id','focus')
      setTimeout(adjustScroll.bind(selNode),300);
      pageControls(1);
      function adjustScroll(node){
        var pageOff=selNode.getBoundingClientRect().top;
        window.scrollTo({
          top: window.pageYOffset+pageOff-100,
          left: 0,
          behavior: 'smooth'
        });
      }
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
    scrollHandle(null);
    d3.select('#nav').style('background-color',`rgba(255,255,255,0)`);

    // d3.select('.seekbar').property('value',0);
  })
  d3.selectAll('.nextflip').on('click',function(event){
    pageControls('next');
  })
  d3.selectAll('.backflip').on('click',function(event){
    pageControls('back');
  })
  pageControls(1);

  stream.insert('div','.showbox').attr('id','shows').append('div').attr('class','divider').append('div')
  d3.select('#shows').append('h1').html('Our Shows')


  // var shows=d3.select('#shows')
  // sorted.forEach((item, i) => {
  //   shows.append('div').attr('class','show').datum(item);
  //   var theshow=d3.select(document.querySelectorAll('.show')[i]);
  //   if(i==0){theshow.attr('id','focused')};
  //   theshow.append('img').attr('src',item.image).attr('class','focus-img');
  //   theshow.append('p').append('span').attr('class','show-title').html(item.title);
  //   theshow.select('p').append('span').attr('class','show-expand episodes')
  //   theshow.select('p').append('span').attr('class','show-expand pageflip noselect')
  //   .append('span').attr('class','backflip').html('back');
  //   theshow.select('.pageflip').append('span').attr('class','nextflip').html('more');
  //   var sExpand=theshow.select('.episodes')
  //   sExpand.append('span').html(item.description);
  //   var pagecounter=1;
  //   var epcounter=0;
  //   item.episodes.forEach((ep, e) => {
  //     sExpand.append('span')
  //     .attr('class','ep-preview epwave'+pagecounter)
  //     .datum(ep)
  //     .html(ep.title);
  //     epcounter++;
  //     if(epcounter>4){
  //       pagecounter++;
  //       epcounter=0;
  //     }
  //   });
  //   d3.selectAll('.epwave1').classed('epshowing',true)
  //   theshow.datum().pagecount=pagecounter;
  // });
  // d3.selectAll('.show').on('click',function(event){
  //   if(event.title!==d3.select('#focused').datum().title){
  //     d3.select('#focused').attr('id','');
  //     var thetarget=d3.selectAll('.show').filter(function(d,i){if(d.title==event.title){return true}})
  //     thetarget.attr('id','focused');
  //     pageControls(1);
  //   }
  // })
  // d3.selectAll('.ep-preview').on('click',function(event){
  //   if(!audiotag.paused){
  //     toggleAudio()
  //   }
  //   episode(event);
  //   atpresent=0;
  //   audiotag.currentTime=atpresent;
  //   updateTrack();
  //   toggleAudio();
  //   window.scrollTo({
  //     top: 0,
  //     left: 0,
  //     behavior: 'smooth'
  //   });
  //   scrollHandle(null);
  //   d3.select('#nav').style('background-color',`rgba(255,255,255,0)`);
  //
  //   // d3.select('.seekbar').property('value',0);
  // })

}
//end of buildshows

function parseDate(date){
  var data=new Date(date);
  var presYr=new Date()
  presYr=presYr.getUTCFullYear();
  var month=months[data.getMonth()];
  var day=data.getUTCDate();
  var yr=data.getUTCFullYear();
  if(yr==presYr){
    return `${month} ${day}`;
  }else{
    return `${month} ${yr}`;
  }

}



function pageControls(dir){
  var focused=d3.select('#focus')

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
  focused.select('.nextflip').classed('noflip',false);
  focused.select('.backflip').classed('noflip',false);
  if(focused.datum().pagecount<2){
    focused.select('.nextflip').classed('noflip',true);
    focused.select('.backflip').classed('noflip',true);
  }else if(currentPage==focused.datum().pagecount){
    focused.select('.nextflip').classed('noflip',true);
  }else if(currentPage==1){
    focused.select('.backflip').classed('noflip',true);
  }
  sHeight=focused.node().scrollHeight
  boxHeight=$('#focus').height()+20
  if(sHeight>boxHeight){
    // focused.style('height',sHeight+'px')
  }
  showTrack();
}



function scrollHandle(e){
  var scroll=[document.querySelector('.logo.scroll'),document.querySelector('.menu.scroll')];
  var fixed=[document.querySelector('.logo.fixed'),document.querySelector('.menu.fixed')];
  // var logodist=document.querySelector('.logo.scroll').getBoundingClientRect().top;
  scroll.forEach((item, i) => {
    var dist=item.getBoundingClientRect().top;
    if(dist<=20){
      d3.select(scroll[i]).style('opacity',0).style('pointer-events','none');
      d3.select(fixed[i]).style('opacity',1).style('pointer-events','all');
      d3.select('#nav').style('background-color',`rgba(255,255,255,${(i==1)?1:0})`)
      if(i==1){
        var top=document.querySelector('#wave').getBoundingClientRect().top;
        d3.select('#wave').style('position','fixed').style('top',top+'px');
      }
    }else{
      d3.select(scroll[i]).style('opacity',1).style('pointer-events','all');
      d3.select(fixed[i]).style('opacity',0).style('pointer-events','none');
      // var wprop=document.documentElement.style.getProperty('--svgoffset')
      d3.select('#wave').style('position','absolute').style('top','var(--svgoffset)');
    }
  });
}

d3.selectAll('.section-link').on('click',function(event){
  var linkto=d3.select(d3.event.srcElement).html().toLowerCase();
  var dist=document.querySelector('#'+linkto).offsetTop-100;
  window.scrollTo({
    top: getElemDistance(d3.select('#'+linkto).node()) - 100,
    left: 0,
    behavior: 'smooth'
  });
})
d3.selectAll('.logo').on('click',function(event){
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
  scrollHandle(null);
  d3.select('#nav').style('background-color',`rgba(255,255,255,0)`);
})
function idleDraw(){
    idleLoop=window.requestAnimationFrame(idleDraw)
    if(idleTiming.memory<100){
      idleTiming.memory++;
    }else if(idleTiming.memory==100){
      drawingPart(true);
      idleTiming.memory++;
      idleTiming.waiting=true;
      window.setTimeout(function(){idleTiming.waiting=false},tDur)
    }else if(idleTiming.waiting==true){
    }else{
      drawingPart(false);
    }
    function drawingPart(transition){
      var min=-100;
      var max=100;
      var idlePath=[];
      var le=50;
      var xPram=d3.scaleLinear()
        .domain([0,le-1])
        .range([0, 100]);
      var yPram=d3.scaleLinear()
        .domain([min,max])
        .range([25, 75]);
      // var mXVal=Math.floor(mouseOffset[0]*30);
      // var mXRange=(x)=>{return (x>mXVal-5&&x<mXVal+5)?true:false}
      // var parentPos=document.querySelector('#wave').getBoundingClientRect()
      // var dir=(yPram(sinCalc(mXVal,25,0.01,cOffset))/100*parentPos.height+parentPos.top)/window.innerHeight-mouseOffset[1];
      // var closest={ind:0,val:1000}
      for(var i=0;i<le;i++){
        var val=sinCalc(i,30,0.01,cOffset);
        // if(i==0||i==49){
        //   val=0;
        // }
        idlePath.push({step:i,value:val})
        // var xPos=i/50;
        // var yPos=(yPram(val)/100*parentPos.height+parentPos.top)/window.innerHeight;
        // var dist=trigCalc([xPos,yPos]);
        // if(dist<closest.val){
        //   closest.ind=i;
        //   closest.val=dist;
        // }
      }
      // idlePath.forEach((item, i) => {
      //   if(Math.abs(i-closest.ind)<5){
      //     var y=Math.sqrt(Math.pow(1/closest.val,2)-Math.pow(i-closest.ind,2))+closest.val/50;
      //     item.value=y;
      //   }
      // });


      // var point=[i/50,yPos];
      // var difference=yPos-mouseOffset[1];
      // var margin=1/trigCalc(point);
      // if(dir<0){
      //     val=val+margin;
      // }else{
      //   val=val-margin;
      // }
      if(cOffset>25){
        cOffset=0;
      }else{
        cOffset=cOffset+0.02;
      }

      var t = d3.transition()
        .duration(tDur)
        .ease(d3.easeLinear);
      var line=d3.line()
      .x(d => xPram(d.step))
      .y(d => 100-yPram(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));
      if(transition==true){
        d3.select('#wave').select('path')
        .datum(idlePath)
        .transition(t)
        .attr('d',line);
      }else{
        d3.select('#wave').select('path')
        .datum(idlePath)
        .attr('d',line);
      }
    }
}
function mouseHandle(e){
  if(playing==false){
    var xCord=e.clientX/window.innerWidth;
    var yCord=e.clientY/window.innerHeight;
    mouseOffset=[xCord,yCord];
    // console.log(mouseOffset);
  }
}
//thanks to Go Make Things
//https://gomakethings.com/get-distances-to-the-top-of-the-document-with-native-javascript/#:~:text=The%20other%20will%20get%20the,%3D%200%3B%20if%20(elem.
var getElemDistance = function ( elem ) {
    var location = 0;
    if (elem.offsetParent) {
        do {
            location += elem.offsetTop;
            elem = elem.offsetParent;
        } while (elem);
    }
    return location >= 0 ? location : 0;
};

function sinCalc(t,amp,fr,off){
  return amp*Math.sin(2*Math.PI*fr*t+off);
}
function trigCalc(point){
  var a=Math.abs(point[0]-mouseOffset[0]);
  var b=Math.abs(point[1]-mouseOffset[1]);
  return Math.sqrt(Math.pow(a,2)+Math.pow(b,2))
}

$(window).on('beforeunload', function() {
    $(window).scrollTop(0);
});
var resizecount=0;
window.addEventListener('mousemove',mouseHandle)
window.addEventListener('scroll',scrollHandle);
window.addEventListener('resize',function(){
  scrollHandle();
  if(resizecount<0||(window.matchMedia('(hover:hover)').matches||window.matchMedia('(min-width:600px)').matches)){
    resetVh();
    resizecount++;
  }
}
);
window.onload=startUp;
