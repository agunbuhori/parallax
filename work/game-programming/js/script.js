$('#end').hide();

var originalHtml = $('#gameContainer').html();

var fileInputEl = $('input[type="file"]'),
    fileReader = new FileReader(),
    game = new Game();

fileReader.onload = function() {
    game.setImage(fileReader.result);
};

fileInputEl.change(function() {
    var type = fileInputEl[0].files[0].type;
    if("image/jpeg" != type) {
        game.img = '';
        $(game.startErrMessageElSelector).html('Picture must be jpeg type');
        $(this.previewElSelector).css('background', 'gray');
        return;
    }

    $(game.startErrMessageElSelector).html('');

    fileReader.readAsDataURL(fileInputEl[0].files[0]);
});

function Game(opt) {
    opt = opt || {};

    this.intervalId = -1;
    this.html = opt.html || '';
    this.duration = opt.duration || 0;
    this.name = opt.name || '';
    this.isPaused = opt.isPaused || false;

    this.endTableBodySelector = opt.endTableBodySelector || '#end table tbody';
    this.puzzleContainer = opt.puzzleContainer || '#puzzleContainer';
    this.pauseElSelector = opt.pauseElSelector || '.btn.btn-pause';
    this.restartBtnSelector = opt.restartBtnSelector || '.btn.btn-restart';
    this.playerNameSelector = opt.playerNameSelector || '#playername';
    this.timerElSelector = opt.timerElSelector || '#timer > span';
    this.startModalElSelector = opt.startModalElSelector || '#start';
    this.gameContainerElSelector = opt.gameContainerElSelector || '#gameContainer';
    this.endModalSelectorEl = opt.endModalSelectorEl || '#end';
    this.puzzleElSelector = opt.puzzleElSelector || '#puzzle';
    this.puzzleDestinationElSelector = opt.puzzleDestinationlSelector || '#puzzleDestination';
    this.previewElSelector = opt.previewElSelector || '.preview';
    this.difficultyElSelector = opt.difficultyElSelector || '#difficult';
    this.nameElSelector = opt.nameElSelector || '#name';
    this.startErrMessageElSelector = opt.startErrMessageElSelector || '#startErrMessage';
    this.img = opt.img || ' ';
    this.difficulty = opt.difficulty || 1;

    $(this.previewElSelector).css('background', 'gray');
}
Game.prototype.setImage = function(img) {
    this.img = img;
    $(this.previewElSelector).css('background', 'url("'+ this.img +'") center / cover no-repeat');
};
Game.prototype.start = function() {
    if(this.img == '') {
        $(this.startErrMessageElSelector).html('Image is Required');
        return;
    }

    this.name = $(this.nameElSelector).val();
    this.difficulty = +$(this.difficultyElSelector).val();

    $(game.playerNameSelector).html(this.name);
    $(game.startModalElSelector).fadeOut(500);
    game.generateTile();
    game.setupEvent();
    game.tick();
    game.save();
};
Game.prototype.generateTile = function() {
    var n = 1 + (+this.difficulty),
        n2 = n * n,
        startArr = [];

    for(var i = 0; i < n2; i++) {
        var rotation = Math.floor((Math.random() * 4)) * 90;
        var imageEl = $('<div>')
                .addClass('image-container')
                .css({
                    'background': 'url("'+ this.img +'") center / cover no-repeat',
                    'transform': 'translate(-'+ (i % n / n * 500) +'px, -'+ ( Math.floor(i / n) / n * 500) +'px)'
                }),
            rotationEl = $('<div>')
                .append(imageEl)
                .addClass('rotation')
        tile = $('<div>')
            .addClass('tile')
            .append(rotationEl)
            .attr('data-position', i)
            .attr('data-startrotation', rotation)
            .attr('data-rotation', rotation)
            .css({
                'width': Math.floor(500 / n),
                'height': Math.floor(500 / n)
            }),
            destinationTile = tile.clone().attr('data-hasdone', 'false');

        $(this.puzzleDestinationElSelector).append(destinationTile);

        rotationEl.css('transform', 'rotate('+ rotation +'deg)');

        startArr.push(tile);
    }

    startArr
        .sort(function() { return Math.random() > 0.5; })
        .forEach(function(tile) {
            $(game.puzzleElSelector).append(tile);
        });
};
Game.prototype.setupEvent = function() {

    $(this.puzzleElSelector + ' .tile')
        .click(function() {
            if(game.isPaused) return;
            $(game.puzzleElSelector + ' .active.tile').removeClass('active')
            $(this).addClass('active');
            game.save();
        })
        .draggable({
            start: function() {
                return !game.isPaused && $(this).hasClass('active');
            },
            revert: function() {
                if(game.isPaused) return;
                var el = $(this);
                $(this).removeClass('active');
                setTimeout(function() {
                    el.removeClass('active');
                }, 100);
                var rotationEl = $(this).find('.rotation'),
                    startRot = $(this).attr('data-startrotation');

                $(this).attr('data-rotation', startRot).removeClass('active');
                rotationEl.css('transform', 'rotate('+ startRot +'deg)');
                return true;
            }
        });

    $(this.puzzleDestinationElSelector + ' .tile')
        .droppable({
            drop: function(e, ui) {
                if(game.isPaused) return;
                var incomingEl = $(ui.draggable),
                    incomingPosition = incomingEl.attr('data-position'),
                    incomingRotation = incomingEl.attr('data-rotation');

                if(incomingPosition == $(this).attr('data-position') &&
                    incomingRotation % 360 == 0) {
                    incomingEl.css('opacity', 0);
                    $(this).attr('data-hasdone', 'true');

                    if(game.isFinish()) {
                        clearInterval(game.intervalId);
                        localStorage.clear();
                        $(game.endModalSelectorEl).fadeIn();
                        game.submitScore();
                    } else {
                        game.save();
                    }
                }
            }
        });

    $(this.restartBtnSelector)
        .click(function() {
            if(game.isPaused) return;

            Game.restart();
        });

    $(this.pauseElSelector)
        .click(function() {
            game.isPaused = !game.isPaused;

            if(game.isPaused) {
                $(this).html('RESUME');
                $(game.restartBtnSelector).hide();
                $(game.puzzleContainer).css('opacity', 0);
                clearInterval(game.intervalId);
            } else {
                $(this).html('PAUSED');
                $(game.puzzleContainer).css('opacity', 1);
                $(game.restartBtnSelector).show();
                game.tick();
            }

            game.save();
        });

    window.onkeydown = function(e) {
        if(game.isPaused) return;
        var code = e.keyCode;
        if(code == 37 || code == 39) rotate(code - 38);
        else if(code == 27) {
            $(game.puzzleElSelector + ' .tile.active').removeClass('active');
            game.save();
        }

        function rotate(direction) {
            var tile = $(game.puzzleElSelector + ' .tile.active'),
                rotationEl = tile.find('.rotation'),
                rot = +tile.attr('data-rotation');

            rot += direction * 90;
            tile.attr('data-rotation', rot);
            rotationEl.css('transform', 'rotate('+ rot +'deg)')
            game.save();
        }
    }

};
Game.prototype.isFinish = function() {
    var nDone = $(this.puzzleDestinationElSelector + ' .tile[data-hasdone="true"]').length,
        n = 1 + (+this.difficulty);
    return nDone == n * n;
};
Game.prototype.submitScore = function() {
    $.post('submit_ranking.php', {
        name: game.name,
        time: game.duration,
        difficult_id: game.difficulty
    }).success(function(data) {

        var myRanking = data[data.length - 1],
            rankingMap = {};

        data.sort(function(data1, data2) {
            var time1Arr = data1.time.split(':');
            var time2Arr = data2.time.split(':');

            var time1 = (+time1Arr[0] * 3600) + (+time1Arr[1] * 60) + (+time1Arr[2]);
            var time2 = (+time2Arr[0] * 3600) + (+time2Arr[1] * 60) + (+time2Arr[2]);

            data1['time_'] = time1;
            data2['time_'] = time2;

            if(time1 > time2) return 1;
            else if(time1 == time2)
                return +data2.id - +data1.id;
            return -1;
        }).forEach(function(d, i) {
            if(!rankingMap[d.time])
                rankingMap[d.time] = i + 1;

            d['ranking'] = rankingMap[d.time];
        });

        var flag = false;

        for(var i = 0; i < Math.min(3, data.length); i++) {
            var tr = $('<tr>').html(getTd(data[i]));
            if(data[i].id == myRanking.id) {
                flag = true;
                tr.addClass('you');
            }

            $(game.endTableBodySelector).append(tr);
        }

        if(flag == false) {
            var d = data.find(function(d){ return d.id == myRanking.id });
            $(game.endTableBodySelector).append(
                $('<tr>')
                    .addClass('you')
                    .html(getTd(d))
            );
        }

        function getTd(data) {
            return '<td>'+ data['ranking'] +'</td>' +
                '<td>'+ data['difficult'] +'</td>' +
                '<td>'+ data['name'] +'</td>' +
                '<td>'+ data['time'] +'</td>'
        }

    }).error(function() {

    });
};
Game.prototype.save = function() {
    var gameContainer = $(game.gameContainerElSelector).clone();
    gameContainer.find('.image-container').css('background', '');
    game.html = gameContainer.html();
    localStorage['data'] = JSON.stringify(this);
};
Game.prototype.tick = function() {
    this.intervalId = setInterval(function() {
        game.duration += 1;
        _tick();
        game.save();
    }, 1000);

    _tick();

    function _tick() {
        var hour = ('' + (100 + Math.floor(game.duration / 60))).substr(1),
            minute = ('' + (100 + game.duration % 60)).substr(1);
        $(game.timerElSelector).html(hour + ':' + minute);
    }
};
Game.load = function() {
    var gameData = localStorage['data'];
    if(gameData != undefined) {
        game = new Game(JSON.parse(gameData));

        if(!game.isPaused) game.tick();

        $(game.gameContainerElSelector)
            .html(game.html)
            .find('.image-container')
            .css('background', 'url("' + game.img + '") center / cover no-repeat');
        game.setupEvent();
        $(game.startModalElSelector).hide();
        $(game.endModalSelectorEl).hide();
    } else {
        $(game.startModalElSelector).fadeIn();
        $(game.endModalSelectorEl).fadeOut();
    }

};
Game.restart = function() {
    fileInputEl.val('');
    clearInterval(game.intervalId);
    localStorage.clear();
    game = new Game();
    $(game.gameContainerElSelector).html(originalHtml);
    $(game.startModalElSelector).fadeIn();
};

$('#startForm').submit(function(e) {
    game.start();
    e.preventDefault();
    return false;
});

Game.load();
