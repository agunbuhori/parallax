document.getElementById('modal').onclick=function (){
	document.getElementById('modal').setAttribute('class','');
	return false;
};

$('body').css('overflow', 'hidden');
$('.animation svg').css('width', '100%');

var pos = 0,
	isAnimating = false,
	cruise = new Cruise($('#cruise')),
	cruiseLegend = new CruiseLengend($('.cruise')),
	sections = [],
	bullets = $('.bullets > li'),
	intervalId = -1,
	bgSound = new Audio('audio/background.mp3'),
	cruiseDepartureSound = new Audio('audio/cruise_departure.mp3'),
	classMusicAudio = new Audio('audio/classic_music.mp3'),
	alligatorAudio = new Audio('audio/alligator.mp3'),
	cruiseArrivalAudio = new Audio('audio/cruise_arrival.mp3');

//$('#modal').hide();
$('#modal .col .progress span')
	.css({
		width: '100%',
		'transform-origin': 'left',
		'transform': 'scaleX(0)',
		'transition': 'all 1s ease'
	});
var colTemplate = $($('#modal .col')[0]).clone();

alligatorAudio.loop = true;
alligatorAudio.autoplay = true;
alligatorAudio.volume = 0;
classMusicAudio.loop = true;
classMusicAudio.volume = 0;
classMusicAudio.autoplay = true;
bgSound.loop = true;
bgSound.autoplay = true;
cruiseDepartureSound.autoplay = true;

function Cruise(el) {
	el = $(el).css('z-index', 999).css('perspective', 500);

	var ubp = .75,
		lbp = .25;

	var n = 20,
		n2 = n/ 2,
		n4 = n / 4,
		rotArr = [],
		tzArr = [],
		img = el.find('img');

	for(var i = 0; i < n4; i++) {
		rotArr[i] = i / n4 * -30;
		rotArr[n2 - 1 - i] = rotArr[i];
	}

	for(var i = 0; i < n2; i++) {
		rotArr.push(rotArr[i] * -1);
		tzArr[i] = i / n2 * 20;
		tzArr[n - 1 - i] = tzArr[i];
	}

	this.update = function() {
		var index = pos % n;
		el.css('transform', 'translateX(' + (pos * 30) + 'px)');
		img.css('transform', 'rotateY('+ rotArr[index] +'deg) translateZ('+ tzArr[index] +'px)')

		var rect = el[0].getBoundingClientRect(),
			w = window.innerWidth,
			left = rect.left,
			ub = ubp * w,
			lb = lbp * w;

		if(left > ub) {
			window.scrollTo(window.scrollX + (left - ub), 0);
		} else if(left < lb) {
			window.scrollTo(window.scrollX - (lb - left), 0);
		}
	}
}

function CruiseLengend(el) {
	el = $(el);

	this.update = function() {
		var tx = Math.min(pos, 183) / 183 * 250;
		el.css('transform', 'translateX('+ tx+'px)');
	}
}

function Macaws(el, elevation, start) {
	el = $(el).css('z-index', 9999);

	this.update = function() {
		el.css('transform', 'translateX('+ ((pos - start) * elevation) +'px)')
	}
}
Macaws.setup = function() {

	var macawsStartArr = [],
		macawsEndArr = [],
		macasStartEl = $('#portOfManausStart .animation, #portOfManausStart .ground .top > *').css('opacity', '0.5'),
		macasEndl = $('#portOfManausEnd .animation, #portOfManausStart .ground .top > *').css('opacity', '0');

	$('#portOfManausStart .animation > svg > g > g').each(function(i, el) {
		macawsStartArr.push(new Macaws(el, el.getBoundingClientRect().width / 7, 0));
	});

	$('#portOfManausEnd .animation > svg > g > g').each(function(i, el) {
		macawsEndArr.push(new Macaws(el, el.getBoundingClientRect().width / 7, 183));
	});

	sections[0] = {
		start: 0,
		end: 23,
		update: function() {
			var opacity = Math.max(0.5, pos / 10);
			macasStartEl.css('opacity', opacity);
			macawsStartArr.forEach(function(o) { o.update() });

		}
	};

	sections[5] = {
		start: 183,
		end: 203,
		update: function() {
			var opacity = (pos - 183) / 10;
			macasEndl.css('opacity', opacity);
			macawsEndArr.forEach(function(o) { o.update() });
		}
	}
};

function MeetingWater() {}
MeetingWater.setup = function() {

	var waters = $('#meetingWaters .animation'),
		elements = $('#meetingWaters .animation, #meetingWaters .info-box').css('opacity', 0);

	sections[1] = {
		start: 23,
		end: 63,
		update: function() {
			elements.css('opacity', ((pos - 23) / 10));
			waters.css('transform', 'translateY(-'+ ((pos - 23) * 5) +'px)')
		}
	}
};

function ClassicMusic(el, posStop) {
	el = $(el);

	var n = 20,
		n2 = n / 2,
		arr = [];

	for(var i = 0; i < n2; i++) {
		arr[i] = [i/n2 * posStop[0], i / n2 * posStop[1]];
		arr[n - 1 - i] = arr[i];
	}

	this.update = function() {
		var index = (pos - 63) % arr.length;
		el.css('transform', 'translate('+ arr[index][0] +'px, '+ arr[index][1] +'px)');
	}
}
ClassicMusic.setup = function() {

	var classicMusicArr = [],
		posStopArr = [[-20, 20], [-20, 0], [-20, 10], [-20, 10]],
		elements = $('#classicMusic .animation, #classicMusic img, #classicMusic .top > svg').css('opacity', 0),
		sun = $('#classicMusic .top > svg'),
		sunLight = $('#classicMusic .top > svg > g > path:first-child');

	$('#classicMusic .animation svg > g > polygon').each(function(i, el) {
		classicMusicArr.push(new ClassicMusic(el, posStopArr[i]));
	});

	sections[2] = {
		start: 63,
		end: 103,
		update: function() {
			elements.css('opacity', (pos - 63) / 10);
			classicMusicArr.forEach(function(o) {o.update(0); });

			if(pos < 83) {
				classMusicAudio.volume = Math.min(1, (pos - 63) / 10);
			} else if(pos > 83) {
				classMusicAudio.volume = Math.min(1, (102 - pos) / 10);
			}

			if(pos > 83) {
				sunLight.css('opacity', (93 - pos) / 10);
				sun.css('transform', 'translateY('+ ((pos - 83) * -5) +'px)');
			}
		}
	}
};

function Piranha(el, row) {

	el = $(el).css('opacity', 0).css('transform-origin', 'center');

	var n = 13,
		n2 = n / 2,
		arr = [],
		rot = [];

	for(var i = 0; i < n2; i++) {
		arr[i] = i / n2;
		arr[n - 1 - i] = arr[i];
		rot[i] = 0;
		rot[Math.floor(n2 + i)] = i / n2 * 90;
	}

	console.log(rot);

	this.update = function() {
		var index = pos - 103 - (row * n);
		if(index >= 0 && index < n) {
			console.log('rotateX('+ rot[index] +'deg) translateY('+ (arr[index] * -30) +'px)');
			el.css('opacity', arr[index])
				.css('transform', 'rotateX('+ rot[index] +'deg) translateY('+ (arr[index] * -40) +'px)');
		}
	}

}
Piranha.setup = function() {

	var piranhaArr = [],
		elements = $('#piranhas .info-box').css('opacity', 0);

	$('#piranhas .animation > svg > g').each(function(i, el) {
		piranhaArr.push(new Piranha(el, Math.floor(i / 4)));
	});

	sections[3] = {
		start: 103,
		end: 143,
		update: function() {
			elements.css('opacity', (pos - 103) / 10);
			piranhaArr.forEach(function(o) {o.update(0); });
		}
	}
};

function Alligator(el, row) {
	el = $(el).css('opacity', 0);

	var n = 6,
		n2 = n / 2,
		arr = [];

	for(var i = 0; i < n2; i++) {
		arr[i] = i / n2;
		arr[n - 1 - i] = arr[i];
	}

	this.update = function() {
		var index = pos - 143 - (row * n);
		if(index >= 0 && index < n) {
			el.css('opacity', arr[index]);
		}
	}
}
Alligator.setup = function() {

	var alligatorArr = [],
		elements = $('#alligator .info-box, #alligator img').css('opacity', 0);

	$('#alligator .animation svg > g > g').each(function(i, el) {
		alligatorArr.push(new Alligator(el, i));
	});

	sections[4] = {
		start: 143,
		end: 183,
		update: function() {
			elements.css('opacity', (pos - 143) / 10);
			alligatorArr.forEach(function(o) {o.update(0); });

			if(pos < 163) {
				alligatorAudio.volume = Math.min(1, (pos - 143) / 10);
			} else {
				alligatorAudio.volume = Math.min(1, (182 - pos) / 10);
			}
		}
	}
};

function update() {
	cruise.update();
	cruiseLegend.update();

	alligatorAudio.volume = 0;
	classMusicAudio.volume = 0;

	var i = 0,
		section = sections.find(function(section, i_) {
			i = i_;
			return section.start <= pos && pos < section.end;
		});

	bullets.removeClass('active');
	$(bullets[Math.min(i, 4)]).addClass('active');

	if(pos == 203 && cruiseArrivalAudio.paused) {
		cruiseArrivalAudio.play();
	}

	if(section && section.update)
		section.update();
}

function processData(data) {
	$('#modal .col').remove();
	$('#modal').fadeIn(250);
	data.dates.forEach(function(date, i) {
		var col = colTemplate.clone();

		$(col.find('h4')).html(date.date);
		$(col.find('.percent')).html( '' + (date.booked / 2.5).toFixed(0) + '% Booked' );

		setTimeout(function() {
			$(col.find('.progress span')).css('transform', 'scaleX('+ (date.booked / 250) +')')
		}, 200 + 250 * i);

		$('#modal .box').append(col);
	});
}

[Macaws, MeetingWater, ClassicMusic, Piranha, Alligator].forEach(function(o) {o.setup() });

document.addEventListener('wheel', function(e) {
	if(isAnimating) return;

	pos = Math.max(0, Math.min(203, pos + (e.deltaY > 0 ? 1 : -1)));
	update();
});

bullets.each(function(i, el) {
	$(el).click(function() {
		isAnimating = true;
		var targetPos = [0, 23, 63, 103, 143, 183][i];
		intervalId = setInterval(function() {
			if(pos == targetPos) {
				clearInterval(intervalId);
				intervalId = -1;
				isAnimating = false;
			}

			if(targetPos > pos) pos++;
			else if(targetPos < pos) pos--;

			update();
		}, 10);
	});
});

cruiseArrivalAudio.onended = function() {
	$.get('dates.json').success(processData)
		.error(function() {
			processData(data);
		})
};

$('#closemodal').click(function() {
	$('#modal').fadeOut();
});

scrollTo(0, 0);
setTimeout(function(){ scrollTo(0, 0); }, 0);
setTimeout(function(){ scrollTo(0, 0); }, 100);
setTimeout(function(){ scrollTo(0, 0); }, 200);
setTimeout(function(){ scrollTo(0, 0); }, 300);