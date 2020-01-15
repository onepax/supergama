# Super Gama
### Front JS:
#### Карта
```html
var map = new Map ({
  'wrapper': '#map',
  'pan': true,
  'zoom': true,
  'zoomIndex': 1.1,
  'grid': [1000, 1000],
});

/* Анимация центрирования */
map.moveTo({
  x: 100,
  y: 100,
  duration: 1000,
  bezier: [0,0,0,0],
});

/* Анимация зума относительно центра */
map.zoomTo({
  scale: 2,
  duration: 1000,
  bezier: [0,0,0,0],
});
```


#### Бот
```html
var bot = new Bot ({
  'level': 3, // 1 - 5 уровень сложности
});
```

#### Логика игры

```html
var game = new Game({
  url: '127.0.0.1',
  map: new Map(),

  // url: ''
  data: {
    bases: [
      {
        i: 'a1',
        t: 1,
        o: 2,
        s: 3,
        r: 50,
        x: 950,
        y: 950,
      },
    ],
  },
  'bots': [
    new Bot(),
    new Bot(),
  ],
});

game.start();
```
