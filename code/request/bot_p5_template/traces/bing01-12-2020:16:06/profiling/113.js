IRP=new function(){function t(){if(n=_d.querySelector?_d.querySelector(".irpserp"):null,n&&typeof IRH!="undefined"){var t=function(){_w.imageRichHover=new IRH;_w.imageRichHover.IsInitialized&&(_w.imageRichHover.logHover=i,_w.imageRichHover.attach(n,["a"]))};typeof SmartRendering!="undefined"?SmartRendering.LoadElementWhenDisplayed(this,n,t,[n]):t.apply(this,[n])}}function i(n,t){if(n){t||(t="h");var i=['{"T":"CI.Hover","AppNS":"',n.ns,'","K":"',n.k,'.1","Name":"ImgAns","HType":"',t,'","TS":',sb_gt(),"}"];r(i.join(""))}}function r(n){var t=new Image,i=["/fd/ls/ls.gif?IG=",_G.IG,"&Type=Event.ClientInst&DATA=",n,"&log=UserEvent"];return t.src=i.join(""),!0}var n=null;t()}