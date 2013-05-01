// JavaScript Document
$(function(){
	
	$.easing.easeOutQuint = function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	};
	
	$.widget("ui.coverflow", {
	options:{
		containerWidth:960,
		containerHeight:300,
		backgroundColor:'',// Hexa value
		opacity:1, // Opacity range from 0 to 1 
		childElem:'.childElem',
		currentElem:4,
		recenter:true,
		autoPlayDuration:3000,
		action:'click',
		spaceBetween:200,
		inactiveScale:.8,
		inactiveAngle:.2,
		button:{play:".play",next:".next",previous:".previous", onActive:"onactive"},
		autoplay:true,
		autoPlayLoadingImage:true,
		autoPlayLoadingdiv:'.innerLoader',
		transitionDelay:1000,
		timer:null,
		loadTimer:null,
		tooltip:true,
		tooltipDiv:".tooltipInner",
		tooltipParent:".tooltip",
		sliderElement:'.sliderCover',
		showSlider:true,
		tooltipH:'left',
		tooltipV:'top'

		
	},	
	_init:function(opt){
		var o = this.options,self = this,_childElem = $(this.element).find(o.childElem);
		this.getPrefix();
		this._setInterface();
		
	},
	_create:function(_opt){
		
	},
	_setInterface:function(){ 
		var o = this.options,self = this,_childElem = $(this.element).find(o.childElem);
		var _conCssProp = {width:o.containerWidth+"px",height:o.containerHeight+"px"}
		_conCssProp['background'] = o.backgroundColor;
		$(this.element).css(_conCssProp);
		o['itemSize'] = _childElem.eq(0).outerWidth();
		o['itemHeight'] = _childElem.eq(0).height();
		o['selectedItemClass'] = "selectedItem"
		
		_childElem.bind(o.action,function(){
			if(!$(this).hasClass(o.selectedItemClass)){
			self.resetLoader();	
			_childElem.each(function(){
				$(this).removeClass(o.selectedItemClass);
			});
			$(this).addClass(o.selectedItemClass);
			$(o.tooltipDiv).html($(this).attr('tooltipContent'));
			self.selectElement(this);
			}else{
				window.open($(this).attr('url'),$(this).attr('mode'))		
			}
		});
		if(!o. showSlider){
			$(o.sliderElement).hide();	
		}
		
		$(o.sliderElement).bind({'slide':function(e,ui){
			_childElem.eq(ui.value).trigger(o.action);
		}});
		
		$(o['button']['play']).bind('click',function(){
			self.resetLoader();
			
			if($(this).hasClass(o['button']['onActive'])){
				$(this).removeClass(o['button']['onActive']);
				clearInterval(o.timer);
				clearInterval(o.loadTimer);
				
			}else{
				$(this).addClass(o['button']['onActive']);
				self.autoPlay();	
			}
		});
		
		$("."+o.selectedItemClass).live({'mousemove':function(e){	
			clearTimeout(o.tooltipTimer);
			if(o.tooltip){
			$('.tooltip').css('display','block');
			var _top = e.clientY , _left = e.clientX + 2;
			
			if(o.tooltipH == 'right')
			{ _left -= ($(o.tooltipParent).width()+2); }
			else if(o.tooltipH == 'center')
			{ _left -= ($(o.tooltipParent).width()/2 + 2);}
			else{ _left += 2;}
			
			if(o.tooltipV == 'bottom'){
				_top -= ($(o.tooltipParent).height()+2);
			}
			$('.tooltip').css({top:_top+"px",left:_left+"px"});
			}
			
		},'mouseleave':function(){
			clearTimeout(o.tooltipTimer);
			o.tooltipTimer = setTimeout(function(){
			$('.tooltip').css('display','none');
			},300);
		}
		});
		
		$(o['button']['next']).bind('click',function(){
			o.currentElem++;
			if(o.currentElem > _childElem.length-1){
			o.currentElem = 0;
			}
			self.moveNext();
			
		});
		
		$(o['button']['previous']).bind('click',function(){
			o.currentElem--;
			if(o.currentElem < 0){
			o.currentElem = _childElem.length-1;
			}
			self.moveNext();
		});
		
		_childElem.eq(o.currentElem).trigger(o.action);
		
		if(o.autoplay && $(o['button']['play']).hasClass(o['button']['onActive'])){
			this.autoPlay();	
		}else if(o.autoplay){
			$(o['button']['play']).trigger('click');
		}
	},
	moveNext:function(){
		var o = this.options,self = this,_childElem = $(this.element).find(o.childElem);
		clearInterval(o.timer);
		clearTimeout(o.timeOut);
		self.resetLoader();
		
		_childElem.eq(o.currentElem).trigger(o.action);
		o.timeOut = setTimeout(function(){
		if(o.autoplay && $(o['button']['play']).hasClass(o['button']['onActive'])){	
			self.autoPlay();
			
		}	
		},o.autoPlayDuration);	
	},
	autoPlay:function(){
		var o = this.options,self = this,_childElem = $(this.element).find(o.childElem);
		clearInterval(o.timer);
		self.resetLoader();
		var _loadTimerCounter = 0;
		if(o.autoPlayLoadingImage){
		o.loadTimer = setInterval(function(){
				_loadTimerCounter += 1;
				$(o.autoPlayLoadingdiv).css('width',_loadTimerCounter+"%");
		},o.autoPlayDuration/100)
		}
		
		o.timer = setInterval(function(){
			if(o.currentElem >= _childElem.length-1)
			o.currentElem = -1;		
			
			_childElem.eq(o.currentElem + 1).trigger(o.action);
			
			self.resetLoader();
			$(o.autoPlayLoadingImage).show();
			var _loadTimerCounter = 0;
			if(o.autoPlayLoadingImage){
			o.loadTimer = setInterval(function(){
				_loadTimerCounter += 1;
				$(o.autoPlayLoadingdiv).css('width',_loadTimerCounter+"%");
			},o.autoPlayDuration/100)
			}
		},o.autoPlayDuration)	
	},
	resetLoader:function(){
	var o = this.options;
	clearInterval(o.loadTimer);
	$(o.autoPlayLoadingdiv).css('width',"0%");
	},
	_refresh:function(state,from,to){
		var self = this, offset = null,o = this.options,_liItems = $(this.element).find(o.childElem);
		_liItems.each(function(i){
			var side = (i == to && from-to < 0 ) ||  i-to > 0 ? 'left' : 'right',
			mod = i == to ? (1-state) : ( i == from ? state : 1 ),
			before = (i > from && i != to),
			css = { zIndex: _liItems.length + (side == "left" ? to-i : i-to) };
			if(o.prefix == '-ms-'){
			css["filter"] = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=1, M12=0, M21=" + (mod * (side == 'right' ? -o.inactiveAngle : o.inactiveAngle)) + ", M22=1";
			if(i == o.currentElem){
				css.width = o.itemSize * (1-((mod)*(1-o.inactiveScale)));
				css.height = css.width * (o.itemHeight / o.itemSize);
				css.top = -((css.height - o.itemHeight) / 3);
				}
				else{
				css.width = o.itemSize * (o.inactiveScale);
				css.height = o.itemHeight * (o.inactiveScale);
				css.top = 0;
			  }
			}else{
			css[o.prefix + 'transform'] = 'matrix(1,'+(mod * (side == 'right' ? -o.inactiveAngle : o.inactiveAngle))+',0,1,0,0) scale('+(1-((mod)*(1-o.inactiveScale)))+')'; 	
			}
			css['left'] = ((i * o.spaceBetween) );
			$(this).css(css);	
		});
		
	},
	selectElement:function(_item){
		var o=this.options,_liItems = $(this.element).find(o.childElem);;
		o.previousElem = o.currentElem;	o.currentElem = $(_item).index();
		$('.sliderCover').slider({value:o.currentElem});	
		clearInterval(o.loadTimer);
		var self = this, to = Math.abs(o.previousElem-o.currentElem) <=1 ? o.previousElem : o.	currentElem+(o.previousElem < o.currentElem ? -1 : 1);
		$.fx.step.coverflow = function(fx) { self._refresh(fx.now, to, o.currentElem); };
		var animation = { coverflow: 1 },_setProp = 0;
		if(o.recenter){
			_setProp = ((o.currentElem) * o.spaceBetween) - (o.containerWidth/2 - o.itemSize/2);
		}
		animation['left'] = -_setProp;
		
		//if(to == o.currentElem && (o.currentElem == 0 || o.currentElem == _liItems.length-1))
		//{
		this.element.find('ul').stop().animate(animation, {
			duration: o.duration,
			easing: 'easeOutQuint'
		});
		
		//}
	},
	
	getPrefix:function(){
		var _useragent = String(window.navigator.userAgent).toLowerCase();
		var _currentBro = _useragent.match(/applewebkit|firefox|msie/);
		var _preArray = {"applewebkit":"-webkit-","firefox":"-moz-","msie":"-ms-"}
		if(_currentBro == null)
		this.options['prefix'] = 'u'
		else if(_currentBro.length > 0){
			this.options['prefix'] = _preArray[_currentBro[0]]
		}
		
	}
	});
	
	var _options = {}
	$('.sliderCover').slider({
		min:0,
		max:$('.coverFlow li').length - 1,
		value:1,
	});
		
	$('.coverFlow').coverflow(_options);
	
});