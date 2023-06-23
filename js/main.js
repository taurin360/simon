'use strict';

{
  // 各カラーボタンの制御
  class Color {
    constructor(main, colorNum, sound) {
      this.sound = new Audio(sound);
      this.main = main;
      this.colorNum = colorNum;
      this.elemnt = document.createElement('button');
      this.elemnt.setAttribute("id", main.getId(this.colorNum));
      this.elemnt.addEventListener('click', () => {
        this.click();
      });
    }

    getElement() {
      return this.elemnt;
    }

    flash() {
      this.elemnt.classList.add('flash');
      setTimeout( () => {
        this.flashOff();
      }, 300);
    }

    flashOff() {
      this.elemnt.classList.remove('flash');
    }

    click() {
      // 回答フェーズ以外はボタン押下無効
      if (this.elemnt.classList.contains('disabled')) {
        return;
      }
      this.main.clickCntUp();
      this.main.check(this.colorNum);

      this.sound.pause();
      this.sound.currentTime = 0;
      this.sound.play();
    }

    disabled() {
      this.elemnt.classList.add('disabled');
    }

    possible() {
      this.elemnt.classList.remove('disabled');
    }

  }

  // GEME全体の制御
  class Main {
    constructor(maxNum) {
      this.maxNum = maxNum;
      this.cnt = 0;
      this.clickCnt = 0;
      this.colorBtns = [];
      this.questions = [];

      this.setup();
      // センターボタン待ち受け
      this.center.addEventListener('click', () => {
        // ゲーム終了までボタン押下不可
        if (this.center.classList.contains('disabled')) {
          return;
        }
        this.center.classList.add('disabled')
        this.question();
        this.centerSound.play();
      });
    }

    setup() {
      const sound = ["audio/green.mp3", "audio/red.mp3", "audio/yellow.mp3", "audio/blue.mp3"];
      this.centerSound = new Audio("audio/center.mp3");
      this.winSound = new Audio("audio/win.mp3");
      this.gameOverSound = new Audio("audio/gameover.mp3");

      // カラーボタンのインスタンス作成
      for ( let i = 0; i < 4; i++) {
        this.colorBtns.push(new Color(this, i, sound[i]));
      }
      const container = document.getElementById('container');
      // container配下に各ボタンタグを配置
      this.colorBtns.forEach(colorBtn => {
        // 初期状態はボタン無効
        colorBtn.disabled();
        container.appendChild(colorBtn.getElement());
      });
      // センターボタン配置
      this.center = document.createElement('button');
      this.center.setAttribute("id", 'center');
      this.center.textContent = 'SIMON';
      container.appendChild(this.center);
    }

    getId(colorNum) {
      const id = ['green', 'red', 'yellow', 'blue'];
      return id[colorNum];
    }

    question() {
      this.cnt = 0;
      this.clickCnt = 0;
      // 0:green 1:red 2:yellow 3:blue
      const nowBtn = Math.floor(Math.random() * 4);
      this.questions.push(nowBtn);
      setTimeout( () => {
        this.flash();
      }, 800);
    }

    flash() {
      const btnNum = this.questions[this.cnt];
      this.colorBtns[btnNum].flash();
      this.cnt++;
      // 出題が全部終わったらボタン押下可能
      if (this.cnt >= this.questions.length) {
        this.colorBtns.forEach(colorBtn => {
          colorBtn.possible();
        });
        return;
      }
      setTimeout( () => {
        this.flash();
      }, 800);
    }

    clickCntUp() {
      this.clickCnt++;
    }

    check(colorNum) {
      // 押すボタンを間違えたとき終了
      if (this.questions[this.clickCnt - 1] !== colorNum) {
        this.center.textContent = 'GAME OVER!'
        this.center.classList.add('end');
        this.gameOverSound.play();
        setTimeout( () => {
          this.restart();
        }, 3000);
      // 全てのボタンを押した
      } else if (this.clickCnt === this.questions.length) {
        // 目標回数達成のとき終了
        if (this.clickCnt === this.maxNum) {
          this.center.textContent = 'YOU WIN!'
          this.center.classList.add('complete');
          this.winSound.play();
          setTimeout( () => {
            this.restart();
          }, 3000);
        // 次の課題へ
        } else {
          this.colorBtns.forEach(colorBtn => {
            colorBtn.disabled();
          });
          setTimeout( () => {
            this.question();
          }, 1500);
        }
      }
    }

    restart() {
      this.center.textContent = 'SIMON'
      this.center.classList.remove('end');
      this.center.classList.remove('complete');
      this.cnt = 0;
      this.clickCnt = 0;
      this.questions.length = 0;
      this.center.classList.remove('disabled')
    }

  }

  // 最初の目標回数設定画面
  class Start {
    constructor() {
      this.main = document.getElementById('container');
      this.main.classList.add('inactive');

      this.sentence = document.getElementById('sentence');
      this.sentence.classList.add('inactive');

      const start = document.getElementById('start-btn');
      start.addEventListener('click', () => {
        this.gameStart();
      });
    }

    gameStart() {
      const inputMaxNum = document.getElementById('max-num');
      let maxNum = Number(inputMaxNum.value);
      if (maxNum <= 0) {
        // デフォルトは5
        maxNum = 5;
      }
      const pre = document.getElementById('pre');
      pre.classList.add('inactive');
      this.main.classList.remove('inactive');
      this.sentence.classList.remove('inactive');
      new Main(maxNum);
    }
  }

  new Start();

}


