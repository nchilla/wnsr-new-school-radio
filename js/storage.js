psec.select('.show-title').append('span').attr('class','icons');
var icons=psec.select('.show-title').select('.icons')
icons.append('a').attr('class','icon-rss');
icons.append('a').attr('class','icon-spotify');
icons.append('a').attr('class','icon-apple');
icons.append('a').attr('class','icon-stitcher');


var epprev=psec.select('.ep-preview:last-child')
if(i==0){epprev.append('div').attr('class','showlab').html(ep.series)}
epprev.append('div').attr('class','date').html(pubDate);
