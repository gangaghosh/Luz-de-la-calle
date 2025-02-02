/*!
* Datepicker v0.3.1
* https://github.com/fengyuanchen/datepicker
*
* Copyright (c) 2014-2016 Fengyuan Chen
* Released under the MIT license
*
* Date: 2016-01-11T04:07:25.661Z
*/(function(factory){if(typeof define==='function'&&define.amd){define('datepicker',['jquery'],factory);}else if(typeof exports==='object'){factory(require('jquery'));}else{factory(jQuery);}})(function($){'use strict';var $window=$(window);var document=window.document;var $document=$(document);var Number=window.Number;var NAMESPACE='datepicker';var EVENT_CLICK='click.'+NAMESPACE;var EVENT_KEYUP='keyup.'+NAMESPACE;var EVENT_FOCUS='focus.'+NAMESPACE;var EVENT_RESIZE='resize.'+NAMESPACE;var EVENT_SHOW='show.'+NAMESPACE;var EVENT_HIDE='hide.'+NAMESPACE;var EVENT_PICK='pick.'+NAMESPACE;var REGEXP_FORMAT=/(y|m|d)+/g;var REGEXP_DIGITS=/\d+/g;var REGEXP_YEAR=/^\d{2,4}$/;var CLASS_INLINE=NAMESPACE+'-inline';var CLASS_DROPDOWN=NAMESPACE+'-dropdown';var CLASS_TOP_LEFT=NAMESPACE+'-top-left';var CLASS_TOP_RIGHT=NAMESPACE+'-top-right';var CLASS_BOTTOM_LEFT=NAMESPACE+'-bottom-left';var CLASS_BOTTOM_RIGHT=NAMESPACE+'-bottom-right';var CLASS_PLACEMENTS=[CLASS_TOP_LEFT,CLASS_TOP_RIGHT,CLASS_BOTTOM_LEFT,CLASS_BOTTOM_RIGHT].join(' ');var CLASS_HIDE=NAMESPACE+'-hide';var min=Math.min;var toString=Object.prototype.toString;function typeOf(obj){return toString.call(obj).slice(8,-1).toLowerCase();}
function isString(str){return typeof str==='string';}
function isNumber(num){return typeof num==='number'&&!isNaN(num);}
function isUndefined(obj){return typeof obj==='undefined';}
function isDate(date){return typeOf(date)==='date';}
function toArray(obj,offset){var args=[];if(Array.from){return Array.from(obj).slice(offset||0);}
if(isNumber(offset)){args.push(offset);}
return args.slice.apply(obj,args);}
function proxy(fn,context){var args=toArray(arguments,2);return function(){return fn.apply(context,args.concat(toArray(arguments)));};}
function isLeapYear(year){return(year%4===0&&year%100!==0)||year%400===0;}
function getDaysInMonth(year,month){return[31,(isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];}
function parseFormat(format){var source=String(format).toLowerCase();var parts=source.match(REGEXP_FORMAT);var length;var i;if(!parts||parts.length===0){throw new Error('Invalid date format.');}
format={source:source,parts:parts};length=parts.length;for(i=0;i<length;i++){switch(parts[i]){case 'dd':case 'd':format.hasDay=true;break;case 'mm':case 'm':format.hasMonth=true;break;case 'yyyy':case 'yy':format.hasYear=true;break;}}
return format;}
function Datepicker(element,options){options=$.isPlainObject(options)?options:{};if(options.language){options=$.extend({},Datepicker.LANGUAGES[options.language],options);}
this.$element=$(element);this.options=$.extend({},Datepicker.DEFAULTS,options);this.isBuilt=false;this.isShown=false;this.isInput=false;this.isInline=false;this.initialValue='';this.initialDate=null;this.startDate=null;this.endDate=null;this.init();}
Datepicker.prototype={constructor:Datepicker,init:function(){var options=this.options;var $this=this.$element;var startDate=options.startDate;var endDate=options.endDate;var date=options.date;this.$trigger=$(options.trigger||$this);this.isInput=$this.is('input')||$this.is('textarea');this.isInline=options.inline&&(options.container||!this.isInput);this.format=parseFormat(options.format);this.initialValue=this.getValue();date=this.parseDate(date||this.initialValue);if(startDate){startDate=this.parseDate(startDate);if(date.getTime()<startDate.getTime()){date=new Date(startDate);}
this.startDate=startDate;}
if(endDate){endDate=this.parseDate(endDate);if(startDate&&endDate.getTime()<startDate.getTime()){endDate=new Date(startDate);}
if(date.getTime()>endDate.getTime()){date=new Date(endDate);}
this.endDate=endDate;}
this.date=date;this.viewDate=new Date(date);this.initialDate=new Date(this.date);this.bind();if(options.autoshow||this.isInline){this.show();}
if(options.autopick){this.pick();}},build:function(){var options=this.options;var $this=this.$element;var $picker;if(this.isBuilt){return;}
this.isBuilt=true;this.$picker=$picker=$(options.template);this.$week=$picker.find('[data-view="week"]');this.$yearsPicker=$picker.find('[data-view="years picker"]');this.$yearsPrev=$picker.find('[data-view="years prev"]');this.$yearsNext=$picker.find('[data-view="years next"]');this.$yearsCurrent=$picker.find('[data-view="years current"]');this.$years=$picker.find('[data-view="years"]');this.$monthsPicker=$picker.find('[data-view="months picker"]');this.$yearPrev=$picker.find('[data-view="year prev"]');this.$yearNext=$picker.find('[data-view="year next"]');this.$yearCurrent=$picker.find('[data-view="year current"]');this.$months=$picker.find('[data-view="months"]');this.$daysPicker=$picker.find('[data-view="days picker"]');this.$monthPrev=$picker.find('[data-view="month prev"]');this.$monthNext=$picker.find('[data-view="month next"]');this.$monthCurrent=$picker.find('[data-view="month current"]');this.$days=$picker.find('[data-view="days"]');if(this.isInline){$(options.container||$this).append($picker.addClass(CLASS_INLINE));}else{$(document.body).append($picker.addClass(CLASS_DROPDOWN));$picker.addClass(CLASS_HIDE);}
this.fillWeek();},unbuild:function(){if(!this.isBuilt){return;}
this.isBuilt=false;this.$picker.remove();},bind:function(){var options=this.options;var $this=this.$element;if($.isFunction(options.show)){$this.on(EVENT_SHOW,options.show);}
if($.isFunction(options.hide)){$this.on(EVENT_HIDE,options.hide);}
if($.isFunction(options.pick)){$this.on(EVENT_PICK,options.pick);}
if(this.isInput){$this.on(EVENT_KEYUP,$.proxy(this.keyup,this));if(!options.trigger){$this.on(EVENT_FOCUS,$.proxy(this.show,this));}}
this.$trigger.on(EVENT_CLICK,$.proxy(this.show,this));},unbind:function(){var options=this.options;var $this=this.$element;if($.isFunction(options.show)){$this.off(EVENT_SHOW,options.show);}
if($.isFunction(options.hide)){$this.off(EVENT_HIDE,options.hide);}
if($.isFunction(options.pick)){$this.off(EVENT_PICK,options.pick);}
if(this.isInput){$this.off(EVENT_KEYUP,this.keyup);if(!options.trigger){$this.off(EVENT_FOCUS,this.show);}}
this.$trigger.off(EVENT_CLICK,this.show);},showView:function(view){var $yearsPicker=this.$yearsPicker;var $monthsPicker=this.$monthsPicker;var $daysPicker=this.$daysPicker;var format=this.format;if(format.hasYear||format.hasMonth||format.hasDay){switch(Number(view)){case 2:case 'years':$monthsPicker.addClass(CLASS_HIDE);$daysPicker.addClass(CLASS_HIDE);if(format.hasYear){this.fillYears();$yearsPicker.removeClass(CLASS_HIDE);}else{this.showView(0);}
break;case 1:case 'months':$yearsPicker.addClass(CLASS_HIDE);$daysPicker.addClass(CLASS_HIDE);if(format.hasMonth){this.fillMonths();$monthsPicker.removeClass(CLASS_HIDE);}else{this.showView(2);}
break;default:$yearsPicker.addClass(CLASS_HIDE);$monthsPicker.addClass(CLASS_HIDE);if(format.hasDay){this.fillDays();$daysPicker.removeClass(CLASS_HIDE);}else{this.showView(1);}}}},hideView:function(){if(this.options.autohide){this.hide();}},place:function(){var options=this.options;var $this=this.$element;var $picker=this.$picker;var containerWidth=$document.outerWidth();var containerHeight=$document.outerHeight();var elementWidth=$this.outerWidth();var elementHeight=$this.outerHeight();var width=$picker.width();var height=$picker.height();var offsets=$this.offset();var left=offsets.left;var top=offsets.top;var offset=parseFloat(options.offset)||10;var placement=CLASS_TOP_LEFT;if(top>height&&top+elementHeight+height>containerHeight){top-=height+offset;placement=CLASS_BOTTOM_LEFT;}else{top+=elementHeight+offset;}
if(left+width>containerWidth){left=left+elementWidth-width;placement=placement.replace('left','right');}
$picker.removeClass(CLASS_PLACEMENTS).addClass(placement).css({top:top,left:left,zIndex:parseInt(options.zIndex,10)});},trigger:function(type,data){var e=$.Event(type,data);this.$element.trigger(e);return e;},createItem:function(data){var options=this.options;var itemTag=options.itemTag;var defaults={text:'',view:'',muted:false,picked:false,disabled:false};$.extend(defaults,data);return('<'+itemTag+' '+
(defaults.disabled?'class="'+options.disabledClass+'"':defaults.picked?'class="'+options.pickedClass+'"':defaults.muted?'class="'+options.mutedClass+'"':'')+
(defaults.view?' data-view="'+defaults.view+'"':'')+
'>'+
defaults.text+
'</'+itemTag+'>');},fillAll:function(){this.fillYears();this.fillMonths();this.fillDays();},fillWeek:function(){var options=this.options;var weekStart=parseInt(options.weekStart,10)%7;var days=options.daysMin;var list='';var i;days=$.merge(days.slice(weekStart),days.slice(0,weekStart));for(i=0;i<=6;i++){list+=this.createItem({text:days[i]});}
this.$week.html(list);},fillYears:function(){var options=this.options;var disabledClass=options.disabledClass||'';var suffix=options.yearSuffix||'';var filter=$.isFunction(options.filter)&&options.filter;var startDate=this.startDate;var endDate=this.endDate;var viewDate=this.viewDate;var viewYear=viewDate.getFullYear();var viewMonth=viewDate.getMonth();var viewDay=viewDate.getDate();var date=this.date;var year=date.getFullYear();var isPrevDisabled=false;var isNextDisabled=false;var isDisabled=false;var isPicked=false;var isMuted=false;var list='';var start=-5;var end=6;var i;for(i=start;i<=end;i++){date=new Date(viewYear+i,viewMonth,viewDay);isMuted=i===start||i===end;isPicked=(viewYear+i)===year;isDisabled=false;if(startDate){isDisabled=date.getFullYear()<startDate.getFullYear();if(i===start){isPrevDisabled=isDisabled;}}
if(!isDisabled&&endDate){isDisabled=date.getFullYear()>endDate.getFullYear();if(i===end){isNextDisabled=isDisabled;}}
if(!isDisabled&&filter){isDisabled=filter.call(this.$element,date)===false;}
list+=this.createItem({text:viewYear+i,view:isDisabled?'year disabled':isPicked?'year picked':'year',muted:isMuted,picked:isPicked,disabled:isDisabled});}
this.$yearsPrev.toggleClass(disabledClass,isPrevDisabled);this.$yearsNext.toggleClass(disabledClass,isNextDisabled);this.$yearsCurrent.toggleClass(disabledClass,true).html((viewYear+start)+suffix+' - '+(viewYear+end)+suffix);this.$years.html(list);},fillMonths:function(){var options=this.options;var disabledClass=options.disabledClass||'';var months=options.monthsShort;var filter=$.isFunction(options.filter)&&options.filter;var startDate=this.startDate;var endDate=this.endDate;var viewDate=this.viewDate;var viewYear=viewDate.getFullYear();var viewDay=viewDate.getDate();var date=this.date;var year=date.getFullYear();var month=date.getMonth();var isPrevDisabled=false;var isNextDisabled=false;var isDisabled=false;var isPicked=false;var list='';var i;for(i=0;i<=11;i++){date=new Date(viewYear,i,viewDay);isPicked=viewYear===year&&i===month;isDisabled=false;if(startDate){isPrevDisabled=date.getFullYear()===startDate.getFullYear();isDisabled=isPrevDisabled&&date.getMonth()<startDate.getMonth();}
if(!isDisabled&&endDate){isNextDisabled=date.getFullYear()===endDate.getFullYear();isDisabled=isNextDisabled&&date.getMonth()>endDate.getMonth();}
if(!isDisabled&&filter){isDisabled=filter.call(this.$element,date)===false;}
list+=this.createItem({index:i,text:months[i],view:isDisabled?'month disabled':isPicked?'month picked':'month',picked:isPicked,disabled:isDisabled});}
this.$yearPrev.toggleClass(disabledClass,isPrevDisabled);this.$yearNext.toggleClass(disabledClass,isNextDisabled);this.$yearCurrent.toggleClass(disabledClass,isPrevDisabled&&isNextDisabled).html(viewYear+options.yearSuffix||'');this.$months.html(list);},fillDays:function(){var options=this.options;var disabledClass=options.disabledClass||'';var suffix=options.yearSuffix||'';var months=options.monthsShort;var weekStart=parseInt(options.weekStart,10)%7;var filter=$.isFunction(options.filter)&&options.filter;var startDate=this.startDate;var endDate=this.endDate;var viewDate=this.viewDate;var viewYear=viewDate.getFullYear();var viewMonth=viewDate.getMonth();var prevViewYear=viewYear;var prevViewMonth=viewMonth;var nextViewYear=viewYear;var nextViewMonth=viewMonth;var date=this.date;var year=date.getFullYear();var month=date.getMonth();var day=date.getDate();var isPrevDisabled=false;var isNextDisabled=false;var isDisabled=false;var isPicked=false;var prevItems=[];var nextItems=[];var items=[];var total=42;var length;var i;var n;if(viewMonth===0){prevViewYear-=1;prevViewMonth=11;}else{prevViewMonth-=1;}
length=getDaysInMonth(prevViewYear,prevViewMonth);date=new Date(viewYear,viewMonth,1);n=date.getDay()-weekStart;if(n<=0){n+=7;}
if(startDate){isPrevDisabled=date.getTime()<=startDate.getTime();}
for(i=length-(n-1);i<=length;i++){date=new Date(prevViewYear,prevViewMonth,i);isDisabled=false;if(startDate){isDisabled=date.getTime()<startDate.getTime();}
if(!isDisabled&&filter){isDisabled=filter.call(this.$element,date)===false;}
prevItems.push(this.createItem({text:i,view:'day prev',muted:true,disabled:isDisabled}));}
if(viewMonth===11){nextViewYear+=1;nextViewMonth=0;}else{nextViewMonth+=1;}
length=getDaysInMonth(viewYear,viewMonth);n=total-(prevItems.length+length);date=new Date(viewYear,viewMonth,length);if(endDate){isNextDisabled=date.getTime()>=endDate.getTime();}
for(i=1;i<=n;i++){date=new Date(nextViewYear,nextViewMonth,i);isDisabled=false;if(endDate){isDisabled=date.getTime()>endDate.getTime();}
if(!isDisabled&&filter){isDisabled=filter.call(this.$element,date)===false;}
nextItems.push(this.createItem({text:i,view:'day next',muted:true,disabled:isDisabled}));}
for(i=1;i<=length;i++){date=new Date(viewYear,viewMonth,i);isPicked=viewYear===year&&viewMonth===month&&i===day;isDisabled=false;if(startDate){isDisabled=date.getTime()<startDate.getTime();}
if(!isDisabled&&endDate){isDisabled=date.getTime()>endDate.getTime();}
if(!isDisabled&&filter){isDisabled=filter.call(this.$element,date)===false;}
items.push(this.createItem({text:i,view:isDisabled?'day disabled':isPicked?'day picked':'day',picked:isPicked,disabled:isDisabled}));}
this.$monthPrev.toggleClass(disabledClass,isPrevDisabled);this.$monthNext.toggleClass(disabledClass,isNextDisabled);this.$monthCurrent.toggleClass(disabledClass,isPrevDisabled&&isNextDisabled).html(options.yearFirst?viewYear+suffix+' '+months[viewMonth]:months[viewMonth]+' '+viewYear+suffix);this.$days.html(prevItems.join('')+items.join(' ')+nextItems.join(''));},click:function(e){var $target=$(e.target);var viewDate=this.viewDate;var viewYear;var viewMonth;var viewDay;var isYear;var year;var view;e.stopPropagation();e.preventDefault();if($target.hasClass('disabled')){return;}
viewYear=viewDate.getFullYear();viewMonth=viewDate.getMonth();viewDay=viewDate.getDate();view=$target.data('view');switch(view){case 'years prev':case 'years next':viewYear=view==='years prev'?viewYear-10:viewYear+10;year=$target.text();isYear=REGEXP_YEAR.test(year);if(isYear){viewYear=parseInt(year,10);this.date=new Date(viewYear,viewMonth,min(viewDay,28));}
this.viewDate=new Date(viewYear,viewMonth,min(viewDay,28));this.fillYears();if(isYear){this.showView(1);this.pick('year');}
break;case 'year prev':case 'year next':viewYear=view==='year prev'?viewYear-1:viewYear+1;this.viewDate=new Date(viewYear,viewMonth,min(viewDay,28));this.fillMonths();break;case 'year current':if(this.format.hasYear){this.showView(2);}
break;case 'year picked':if(this.format.hasMonth){this.showView(1);}else{this.hideView();}
break;case 'year':viewYear=parseInt($target.text(),10);this.date=new Date(viewYear,viewMonth,min(viewDay,28));this.viewDate=new Date(viewYear,viewMonth,min(viewDay,28));if(this.format.hasMonth){this.showView(1);}else{this.hideView();}
this.pick('year');break;case 'month prev':case 'month next':viewMonth=view==='month prev'?viewMonth-1:view==='month next'?viewMonth+1:viewMonth;this.viewDate=new Date(viewYear,viewMonth,min(viewDay,28));this.fillDays();break;case 'month current':if(this.format.hasMonth){this.showView(1);}
break;case 'month picked':if(this.format.hasDay){this.showView(0);}else{this.hideView();}
break;case 'month':viewMonth=$.inArray($target.text(),this.options.monthsShort);this.date=new Date(viewYear,viewMonth,min(viewDay,28));this.viewDate=new Date(viewYear,viewMonth,min(viewDay,28));if(this.format.hasDay){this.showView(0);}else{this.hideView();}
this.pick('month');break;case 'day prev':case 'day next':case 'day':viewMonth=view==='day prev'?viewMonth-1:view==='day next'?viewMonth+1:viewMonth;viewDay=parseInt($target.text(),10);this.date=new Date(viewYear,viewMonth,viewDay);this.viewDate=new Date(viewYear,viewMonth,viewDay);this.fillDays();if(view==='day'){this.hideView();}
this.pick('day');break;case 'day picked':this.hideView();this.pick('day');break;}},clickDoc:function(e){var target=e.target;var trigger=this.$trigger[0];var ignored;while(target!==document){if(target===trigger){ignored=true;break;}
target=target.parentNode;}
if(!ignored){this.hide();}},keyup:function(){this.update();},getValue:function(){var $this=this.$element;var val='';if(this.isInput){val=$this.val();}else if(this.isInline){if(this.options.container){val=$this.text();}}else{val=$this.text();}
return val;},setValue:function(val){var $this=this.$element;val=isString(val)?val:'';if(this.isInput){$this.val(val);}else if(this.isInline){if(this.options.container){$this.text(val);}}else{$this.text(val);}},show:function(){if(!this.isBuilt){this.build();}
if(this.isShown){return;}
if(this.trigger(EVENT_SHOW).isDefaultPrevented()){return;}
this.isShown=true;this.$picker.removeClass(CLASS_HIDE).on(EVENT_CLICK,$.proxy(this.click,this));this.showView(this.options.startView);if(!this.isInline){$window.on(EVENT_RESIZE,(this._place=proxy(this.place,this)));$document.on(EVENT_CLICK,(this._clickDoc=proxy(this.clickDoc,this)));this.place();}},hide:function(){if(!this.isShown){return;}
if(this.trigger(EVENT_HIDE).isDefaultPrevented()){return;}
this.isShown=false;this.$picker.addClass(CLASS_HIDE).off(EVENT_CLICK,this.click);if(!this.isInline){$window.off(EVENT_RESIZE,this._place);$document.off(EVENT_CLICK,this._clickDoc);}},update:function(){this.setDate(this.getValue(),true);},pick:function(_view){var $this=this.$element;var date=this.date;if(this.trigger(EVENT_PICK,{view:_view||'',date:date}).isDefaultPrevented()){return;}
this.setValue(date=this.formatDate(this.date));if(this.isInput){$this.trigger('change');}},reset:function(){this.setDate(this.initialDate,true);this.setValue(this.initialValue);if(this.isShown){this.showView(this.options.startView);}},getMonthName:function(month,short){var options=this.options;var months=options.months;if($.isNumeric(month)){month=Number(month);}else if(isUndefined(short)){short=month;}
if(short===true){months=options.monthsShort;}
return months[isNumber(month)?month:this.date.getMonth()];},getDayName:function(day,short,min){var options=this.options;var days=options.days;if($.isNumeric(day)){day=Number(day);}else{if(isUndefined(min)){min=short;}
if(isUndefined(short)){short=day;}}
days=min===true?options.daysMin:short===true?options.daysShort:days;return days[isNumber(day)?day:this.date.getDay()];},getDate:function(formated){var date=this.date;return formated?this.formatDate(date):new Date(date);},setDate:function(date,_isUpdated){var filter=this.options.filter;if(isDate(date)||isString(date)){date=this.parseDate(date);if($.isFunction(filter)&&filter.call(this.$element,date)===false){return;}
this.date=date;this.viewDate=new Date(date);if(!_isUpdated){this.pick();}
if(this.isBuilt){this.fillAll();}}},setStartDate:function(date){if(isDate(date)||isString(date)){this.startDate=this.parseDate(date);if(this.isBuilt){this.fillAll();}}},setEndDate:function(date){if(isDate(date)||isString(date)){this.endDate=this.parseDate(date);if(this.isBuilt){this.fillAll();}}},parseDate:function(date){var format=this.format;var parts=[];var length;var year;var day;var month;var val;var i;if(isDate(date)){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}else if(isString(date)){parts=date.match(REGEXP_DIGITS)||[];}
date=new Date();year=date.getFullYear();day=date.getDate();month=date.getMonth();length=format.parts.length;if(parts.length===length){for(i=0;i<length;i++){val=parseInt(parts[i],10)||1;switch(format.parts[i]){case 'dd':case 'd':day=val;break;case 'mm':case 'm':month=val-1;break;case 'yy':year=2000+val;break;case 'yyyy':year=val;break;}}}
return new Date(year,month,day);},formatDate:function(date){var format=this.format;var formated='';var length;var year;var part;var val;var i;if(isDate(date)){formated=format.source;year=date.getFullYear();val={d:date.getDate(),m:date.getMonth()+1,yy:year.toString().substring(2),yyyy:year};val.dd=(val.d<10?'0':'')+val.d;val.mm=(val.m<10?'0':'')+val.m;length=format.parts.length;for(i=0;i<length;i++){part=format.parts[i];formated=formated.replace(part,val[part]);}}
return formated;},destroy:function(){this.unbind();this.unbuild();this.$element.removeData(NAMESPACE);}};Datepicker.LANGUAGES={};Datepicker.DEFAULTS={autoshow:false,autohide:false,autopick:false,inline:false,container:null,trigger:null,language:'',format:'mm/dd/yyyy',date:null,startDate:null,endDate:null,startView:0,weekStart:0,yearFirst:false,yearSuffix:'',days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],daysShort:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],daysMin:['Su','Mo','Tu','We','Th','Fr','Sa'],months:['January','February','March','April','May','June','July','August','September','October','November','December'],monthsShort:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],itemTag:'li',mutedClass:'muted',pickedClass:'picked',disabledClass:'disabled',template:('<div class="datepicker-container">'+
'<div class="datepicker-panel" data-view="years picker">'+
'<ul>'+
'<li data-view="years prev">&lsaquo;</li>'+
'<li data-view="years current"></li>'+
'<li data-view="years next">&rsaquo;</li>'+
'</ul>'+
'<ul data-view="years"></ul>'+
'</div>'+
'<div class="datepicker-panel" data-view="months picker">'+
'<ul>'+
'<li data-view="year prev">&lsaquo;</li>'+
'<li data-view="year current"></li>'+
'<li data-view="year next">&rsaquo;</li>'+
'</ul>'+
'<ul data-view="months"></ul>'+
'</div>'+
'<div class="datepicker-panel" data-view="days picker">'+
'<ul>'+
'<li data-view="month prev">&lsaquo;</li>'+
'<li data-view="month current"></li>'+
'<li data-view="month next">&rsaquo;</li>'+
'</ul>'+
'<ul data-view="week"></ul>'+
'<ul data-view="days"></ul>'+
'</div>'+
'</div>'),offset:10,zIndex:1000,filter:null,show:null,hide:null,pick:null};Datepicker.setDefaults=function(options){$.extend(Datepicker.DEFAULTS,$.isPlainObject(options)&&options);};Datepicker.other=$.fn.datepicker;$.fn.datepicker=function(option){var args=toArray(arguments,1);var result;this.each(function(){var $this=$(this);var data=$this.data(NAMESPACE);var options;var fn;if(!data){if(/destroy/.test(option)){return;}
options=$.extend({},$this.data(),$.isPlainObject(option)&&option);$this.data(NAMESPACE,(data=new Datepicker(this,options)));}
if(isString(option)&&$.isFunction(fn=data[option])){result=fn.apply(data,args);}});return isUndefined(result)?this:result;};$.fn.datepicker.Constructor=Datepicker;$.fn.datepicker.languages=Datepicker.LANGUAGES;$.fn.datepicker.setDefaults=Datepicker.setDefaults;$.fn.datepicker.noConflict=function(){$.fn.datepicker=Datepicker.other;return this;};});