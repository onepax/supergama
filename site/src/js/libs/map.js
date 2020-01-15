/*

addItems:
  [
    {
      i: 'a', // ID
      t: 1, // Type (1 - Base, 2 - Direction, 3 - Shipment)
      o: 0, // Owner (1 - Тobody's, 2 - My, 3 - Enemy, 4 - Enemy ...)
      s: 3, // Skin
      d: 100, // Diameter
      x: 100, // X
      y: 100, // Y
    },
  ]


*/

function Map(settings) {
  var s = ext(settings, {
    'wrapper': '#map',
    'pan': true,
    'zoom': true,
    'zoomIndex': 1.1,
    'grid': [1000, 1000],
  });
  var Map = this;
  var App = PIXI.Application;
  var Loader = PIXI.Loader.shared;
  var Textures = PIXI.utils.TextureCache;
  var Ticker = PIXI.Ticker.shared;
  var Sprite = PIXI.Sprite;
  var Container = PIXI.Container;
  var Graphics = PIXI.Graphics;

  var wrapper = document.querySelector(s.wrapper);
  var app = new App({
    resizeTo: wrapper,
    resolution: devicePixelRatio,
    antialias: true,
    forceFXAA: true,
  });
  var stage = app.stage;
  var canvas = app.view;
  var elements = {};

  init();

  Map.addItems = function(items) {
    var graphic;
    var item;
    var itemsLength = items.length;
    var path;
    var a;
    var b;

    for(a = 0; a < itemsLength; a++) {
      item = items[a];
      graphic = new Graphics();
      graphic.interactive = true;
      graphic.attr(item);

      if (item.t === 1 && item.o === 2) {
        graphic.attr({
          m: 1,
        });
      }

      switch (item.t) {
        case 1: // base
          graphic.beginFill(getBasesColor(item.o));
          graphic.drawCircle(0, 0, item.r);
          graphic.position.set(item.x, item.y);
          graphic.endFill();

          break;

        case 2: // direction
          graphic.lineStyle(20, 0x0014ff);
          var itemPathLength = item.p.length;
          for(b = 0; b < itemPathLength; b++) {
            path = item.p[b];
            if (b === 0) {
              graphic.moveTo(path[0], path[1]);
            } else {
              graphic.lineTo(path[0], path[1]);
            }
          }
          graphic.endFill();

          break;

        case 3: // shipment
          graphic.beginFill(0x24b300);
          graphic.drawRect(item.x, item.y, item.w, item.h);
          graphic.endFill();

          break;
      }

      graphic.on('mouseover', function () {
        console.log('');
        console.log(this.width);
        console.log((this.position.x + this.width / 2) + ' ' + (this.position.y + this.height / 2));
      });

      elements[item.id] = graphic;

      stage.addChild(graphic);
    }
  };

  Map.zoomOwnership = function() {
    var middleX = 0;
    var middleY = 0;
    var middleCount = 0;
    var elementsLength = elements.length;
    var el;
    var a;

    for(a = 0; a < elementsLength; a++) {
      el = elements[a];
      if(el.t === 1 && el.o === 2) {
        middleX += el.attrs.x;
        middleY += el.attrs.y;
        middleCount++;
      }
    };

    middleX = middleX / middleCount;
    middleY = middleY / middleCount;

  };

  Map.moveTo = function(c) {
    return new Animate({
      from: {
        x: stage.position.x,
        y: stage.position.y,
      },
      to: {
        x: window.innerWidth / 2 - c.x,
        y: window.innerHeight / 2 - c.y,
      },
      onTick: function(data) {
        stage.position.x = data.x;
        stage.position.y = data.y;
      },
      bezier: [.8,0,.2,1],
      duration: 2000,
    }, c.duration, function() {
      console.log('done');
    });
  };

  function getBasesColor(owner) {
    switch(owner) {
      case 1:
        return 0x999999;
      case 2:
        return 0x008000;
      case 3:
        return 0xff0000;
      case 4:
        return 0x0000ff;
      case 5:
        return 0x800080;
    }
  }

  function Animate(params, duration, callback) {
    var c = ext(params, {
      from: {},
      to: {},
      onTick: function() {},
      duration: 360,
      bezier: [0, 0, 0, 0],
      callback: function() {},
    });
    c.duration = repl(duration, c.duration);
    c.callback = repl(callback, c.callback);

    var Animate = this;
    var data = {};
    var startTime = new Date().getTime();
    var pastTime = 0;
    var pause = false;
    var stop = false;
    var key;
    var currentTime = startTime;
    var processTime = startTime;
    var processTimeIndex = 0;
    var bezier = new Bezier(c.bezier[0], c.bezier[1], c.bezier[2], c.bezier[3]);

    tick();

    function tick() {

      if (pause || stop) return;

      requestAnimationFrame(tick);

      currentTime = new Date().getTime();
      processTime = currentTime - startTime + pastTime;
      processTimeIndex = processTime / c.duration;

      if (processTime >= c.duration || c.duration <= 0) {
        processTime = c.duration;
        processTimeIndex = 1;
      }

      for(key in c.from) {
        data[key] = c.from[key] + (c.to[key] - c.from[key]) * bezier.easing(processTimeIndex);
      }
      c.onTick(data);

      if (processTime >= c.duration) {
        stop = true;
        c.callback();
      }
    }

    Animate.stop = function() {
      stop = true;
    };

    Animate.pause = function() {
      pause = true;
      var currentTime = new Date().getTime();
      pastTime += currentTime - startTime;
      startTime = currentTime;
    };

    Animate.continue = function() {
      pause = false;
      startTime = new Date().getTime();
      tick();
    };

    return Animate;
  }

  function init() {
    if (s.pan) {
      addPanEvent(canvas);
    }

    if (s.zoom) {
      addZoomEvent(canvas);
    }

    addGrid();

    wrapper.appendChild(canvas);
  }

  function addGrid() {
    var graphic = new Graphics();
    graphic.interactive = true;
    graphic.beginFill(0xbd75c5);
    graphic.drawRect(0, 0, s.grid[0], s.grid[1]);
    graphic.endFill();
    stage.addChild(graphic);

    graphic.on('mouseover', function (ev) {
      console.log(ev);
      console.log('Coord: '+this.position.x+' '+this.position.y);
    });
  }

  function addPanEvent(canvas) {
    var canPan = true;
    var startX;
    var startY;
    var target;
    var mc = new Hammer(canvas);

    mc.get('pan').set({
      threshold: 0
    });

    mc.on("panstart pan panend", function(ev) {
      target = app.renderer.plugins.interaction.hitTest(ev.center);

      if (ev.type === 'panstart') {
        if (target && target.attr('m')) {
          canPan = false;
        }
        startX = stage.x;
        startY = stage.y;
      }

      if (canPan) {
        stage.position.set(startX+ev.deltaX, startY+ev.deltaY);
      }

      if (ev.type === 'panend') {
        canPan = true;
      }
    });
  }

  function addZoomEvent(canvas) {
    var steps = 0;
    onWheel(canvas, function(ev) {
      var oldScale = stage.scale.x;
      if (ev.delta > 0) {
        steps++;
      } else {
        steps--;
      }
      var scale = Math.pow(s.zoomIndex, steps);
      var offsetX = -((ev.offsetX - stage.x) * scale / oldScale) + ev.offsetX;
      var offsetY = -((ev.offsetY - stage.y) * scale / oldScale) + ev.offsetY;
      stage.scale.set(scale, scale);
      stage.position.set(offsetX, offsetY);
    });
  }

}