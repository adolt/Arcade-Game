// 定义一个画布中实体的类，所有实体均继承自此父类
class Entity {
  constructor(position, sprite) {
    // 实体在画布中所在的位置
    this.position = position;

    // 物体的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = sprite;
  }
  // 此为游戏必须的函数，用来在屏幕上画出物体
  render(width, height) {
    // 由于石块图片和宝石图片过大，所以需要调整图片大小
    if (Util.isNumber(width, height)) {
      ctx.drawImage(
        Resources.get(this.sprite),
        this.position.x,
        this.position.y,
        width,
        height
      );
    } else {
      ctx.drawImage(
        Resources.get(this.sprite),
        this.position.x,
        this.position.y
      );
    }
  }
}

// 定义障碍物类
class Rock extends Entity {
  constructor(x, y) {
    super({ x, y }, 'images/Rock.png');
  }
}

// 定义奖励宝石类
class Gem extends Entity {
  constructor(x, y, color) {
    // 奖励宝石区分颜色，所以这里需要传入一个color参数
    super(
      { x, y },
      'images/Gem ' + color[0].toUpperCase() + color.slice(1) + '.png'
    );
  }
}

// 移动实体类，是实体类的子类，同时又是英雄实体类和敌人实体类的父类
class MoveEntity extends Entity {
  constructor(position, sprite) {
    super(position, sprite);
  }
  // 判断下一次的移动方向是否会超出画布边界
  isAtEdge(direction) {
    let { x, y } = this.position;
    if (direction === 'left' && x <= 0) {
      return true;
    }
    if (direction === 'right' && x + 101 >= 606) {
      return true;
    }
    if (direction === 'up' && y <= 0) {
      return true;
    }
    if (direction === 'down' && y + 83 >= 498) {
      return true;
    }
    return false;
  }
}

// 定义敌人类
class Enemy extends MoveEntity {
  constructor(x, y) {
    super({ x, y }, 'images/enemy-bug-r.png');
    // 敌人自动移动，所以需要控制移动方向。1：向右移动，-1：向左移动
    this.direction = 1;
  }
  // 此为游戏必须的函数，用来更新敌人的位置
  // 参数: dt ，表示时间间隙
  update(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    if (this.isAtEdge(this.direction === 1 ? 'right' : 'left')) {
      this.direction = -this.direction;
      this.sprite =
        this.direction === 1
          ? 'images/enemy-bug-r.png'
          : 'images/enemy-bug-l.png';
    }
    this.position.x = this.position.x + this.direction * 101 * dt;
  }
}

// 定义英雄角色类
class Hero extends MoveEntity {
  constructor(x, y) {
    super({ x, y }, 'images/char-boy.png');
  }
  update() {}
  // 控制英雄左右移动
  handleInput(direction) {
    // 先检查是否会越过画布边界 或 被障碍物阻挡
    if (!this.isAtEdge(direction) && !this.willHitRock(direction)) {
      switch (direction) {
        case 'left':
          this.position.x -= 101;
          break;
        case 'right':
          this.position.x += 101;
          break;
        case 'up':
          this.position.y -= 83;
          break;
        case 'down':
          this.position.y += 83;
      }
      // 检查移动后是否获得奖励
      this.checkIfGotGem();
      // 检查移动后是否成功营救公主
      this.checkIfSavePrincess();
    }
  }
  // 检查向此方向移动是否会被障碍物阻挡
  willHitRock(direction) {
    let willHit = false;
    let { x: hx, y: hy } = this.position;
    let { x: rx, y: ry } = rock.position;
    switch (direction) {
      case 'left':
        willHit = hy === ry && hx === rx + 101;
        break;
      case 'right':
        willHit = hy === ry && rx === hx + 101;
        break;
      case 'up':
        willHit = hx === rx && hy === ry + 83;
        break;
      case 'down':
        willHit = hx === rx && ry === hy + 83;
    }
    return willHit;
  }
  // 检查是否获得奖励，若获得了将 gem 对象弹出 allGems 数组
  checkIfGotGem() {
    let index = allGems.findIndex(
      gem =>
        gem.position.x === this.position.x && gem.position.y === this.position.y
    );
    if (index !== -1) {
      allGems.splice(index, 1);
    }
  }
  // 检查是否成功营救公主，赢得游戏胜利
  checkIfSavePrincess() {
    let { x: hx, y: hy } = this.position;
    let { x: px, y: py } = princess.position;
    if (hx === px && hy === py) {
      this.position.x = 235;
      this.position.y = -10;
      Util.showWinDialog();
    }
  }
}

// 定义公主类
class Princess extends Entity {
  constructor(x, y) {
    super({ x, y }, 'images/char-princess-girl.png');
  }
}

// 工具类
class Util {
  constructor() {}
  // 检查传入的数是否都是 数字
  static isNumber(...arr) {
    return arr.every(num => typeof num === 'number');
  }
  // 弹出游戏胜利的提示对话框
  static showWinDialog() {
    let starCnt = 5 - allGems.length;
    const stars = document.getElementsByClassName('stars')[0];
    for (let i = 0; i < starCnt; i++) {
      stars.children[i].children[0].classList.add('shine');
    }
    stars.style = '';
    swal({
      title: 'Congratulations!',
      text: 'You have save the princess!',
      content: stars,
      icon: 'success',
      buttons: [true, 'Play Again']
    }).then(accept => {
      resetGame();
    });
  }
}

// 把障碍物对象放进一个叫 rock 的变量里
const rock = new Rock(303, 239);

// 把所有宝石的对象都放进一个叫 allGems 的数组里
const allGems = [];
allGems.push(new Gem(101, 239, 'blue'), new Gem(505, 73, 'green'));

// 把所有敌人的对象都放进一个叫 allEnemies 的数组里
const allEnemies = [];
allEnemies.push(new Enemy(101, 73), new Enemy(505, 156), new Enemy(0, 322));

// 把玩家对象放进一个叫 Hero 的变量里
const hero = new Hero(202, 405);

// 把公主对象放进一个叫 princess 的变量里
const princess = new Princess(303, -10);

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', e => {
  const allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  hero.handleInput(allowedKeys[e.keyCode]);
});

// 重置画布中的实体
const resetEntity = function() {
  hero.position.x = 202;
  hero.position.y = 405;
  allGems.length = 0;
  allGems.push(new Gem(101, 239, 'blue'), new Gem(505, 73, 'green'));
};
