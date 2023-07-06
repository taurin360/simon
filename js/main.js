'use strict';

{
  // -------------------------------------
  // 各カラーボタンの制御
  // -------------------------------------
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

    flashDemo() {
      this.elemnt.classList.add('flash');
      setTimeout( () => {
        this.flashOff();
      }, 50);
    }

    flashOff() {
      this.elemnt.classList.remove('flash');
    }

    flashSound() {
      this.sound.pause();
      this.sound.currentTime = 0;
      this.sound.play();
    }

    click() {
      // 回答フェーズ以外はボタン押下無効
      if (this.elemnt.classList.contains('disabled')) {
        return;
      }
      this.main.clickCntUp();
      this.main.check(this.colorNum);
      // フラッシュはCSSの疑似クラスで制御している
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

  // -------------------------------------
  // GEME全体の制御
  // -------------------------------------
  class Main {
    constructor(maxNum, start) {
      this.maxNum = maxNum;
      this.start = start;
      this.cnt = 0;
      this.demoCnt = 0;
      this.clickCnt = 0;
      this.arrivalCnt = 0;
      this.colorBtns = [];
      this.questions = [];

      this.setup();
      // センターボタン待ち受け
      this.center.addEventListener('click', () => {
        // ゲーム終了までボタン押下不可
        if (this.center.classList.contains('disabled')) {
          return;
        }
        this.center.classList.add('disabled');
        this.start.setSentenceInactive();
        this.start.setResultInactive();
        this.start.setRecInactive();
        this.demo();
        setTimeout( () => {
          this.question();
        }, 3000);
      });
    }

    setup() {
      const sound = ["audio/green.mp3", "audio/red.mp3", "audio/yellow.mp3", "audio/blue.mp3"];
      this.winSound = new Audio("audio/win.mp3");
      this.gameOverSound = new Audio("audio/gameover.mp3");
      this.congratulation = new Audio("audio/congratulation.mp3");

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

    demo() {
      let cnt;
      switch(this.demoCnt) {
        case 2:
        case 6:
        case 10:
          cnt = 3;
          break;
        case 3:
        case 7:
        case 11:
          cnt = 2;
          break;
        default:
          cnt = this.demoCnt % 4;
      }
      this.colorBtns[cnt].flashDemo();
      this.colorBtns[cnt].flashSound();
      this.demoCnt++;
      if (this.demoCnt <= 12) {
        setTimeout( () => {
          this.demo();
        }, 100);
      }
    }

    getId(colorNum) {
      const id = ['green', 'red', 'yellow', 'blue'];
      return id[colorNum];
    }

    question() {
      this.cnt = 0;
      this.clickCnt = 0;
      this.randomGenerate();
      setTimeout( () => {
        this.flash();
      }, 800);
    }

    randomGenerate() {
      // 0:green 1:red 2:yellow 3:blue
      let colorNum = [0, 0, 0, 0];
      this.questions.forEach(question => {
        if (question === 0) {
          colorNum[0]++;
        } else if (question === 1) {
          colorNum[1]++;
        } else if (question === 2) {
          colorNum[2]++;
        } else if (question === 3) {
          colorNum[3]++;
        }
      });

      // 一度も光ってないボタンは強制的に光らせる
      if (this.questions.length === 5) {
        let cnt = undefined;
        if (colorNum[0] === 0) {
          cnt = 0;
        } else if (colorNum[1] === 0) {
          cnt = 1;
        } else if (colorNum[2] === 0) {
          cnt = 2;
        } else if (colorNum[3] === 0) {
          cnt = 3;
        }
        if (colorNum !== undefined) {
          this.questions.push(cnt);
          return;
        }
      }

      // 一定回数以上同じボタンが続くのは許容しない
      let cnt;
      if (this.questions.length >= 4) {
        cnt = this.questions.length / 4 + 1;
        let result = false;
        let nowBtn;
        while(result === false) {
          nowBtn = Math.floor(Math.random() * 4);
          if (colorNum[0] >= 2 && nowBtn === 0) {
            continue;
          } else if (colorNum[1] >= cnt && nowBtn === 1) {
            continue;
          } else if (colorNum[2] >= cnt && nowBtn === 2) {
            continue;
          } else if (colorNum[3] >= cnt && nowBtn === 3) {
            continue;
          } else {
            result = true;
          }
        }
        this.questions.push(nowBtn);
        return;
      }

      // 次のボタンはランダムに選ぶ
      const nowBtn = Math.floor(Math.random() * 4);
      this.questions.push(nowBtn);
    }

    flash() {
      const btnNum = this.questions[this.cnt];
      this.colorBtns[btnNum].flash();
      this.colorBtns[btnNum].flashSound();
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

    // カラーボタンを押したときに呼ばれ、押し間違いと目標回数をチェックする
    check(colorNum) {
      // 押すボタンを間違えたとき終了
      if (this.questions[this.clickCnt - 1] !== colorNum) {
        this.center.textContent = 'GAME OVER!'
        this.center.classList.add('end');
        this.gameOverSound.play();
        // 到達回数を設定
        this.arrivalCnt = this.clickCnt -1;
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
          // 到達回数を設定
          this.arrivalCnt = this.clickCnt;
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
      // 今回の到達回数がこれまでの最高回数を上回ればローカルストレージに保存する
      const KeyName = 'simoncnt';
      let num;
      let recordStr = '';

      this.start.setResultActive();
      this.start.setRecActive();
      if (localStorage.getItem(KeyName) === null) {
        num = 0;
      } else {
        num = Number(localStorage.getItem(KeyName));
      }

      this.start.setResultTextCnt(`到達回数は${this.arrivalCnt}回です。`);
      if ( num < this.arrivalCnt) {
        // 最高回数を更新した
        localStorage.setItem(KeyName, this.arrivalCnt);
        this.start.setRecTextCnt('最高記録を更新しました！');
        this.congratulation.play();
      } else {
        // 最高回数に届かなかった
        this.start.setRecTextCnt(`最高記録は${num}回です。`);
      }

      this.center.textContent = 'SIMON'
      this.center.classList.remove('end');
      this.center.classList.remove('complete');
      this.cnt = 0;
      this.clickCnt = 0;
      this.demoCnt = 0;
      this.questions.length = 0;
      this.center.classList.remove('disabled')
    }
  }

  // -------------------------------------
  // 最初の目標回数設定画面
  // -------------------------------------
  class Start {
    constructor() {
      this.main = document.getElementById('container');
      this.main.classList.add('inactive');

      this.sentence = document.getElementById('sentence');
      this.setSentenceInactive();

      this.result = document.getElementById('result');
      this.setResultInactive();

      this.rec = document.getElementById('rec');
      this.setRecInactive();

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
      new Main(maxNum, this);
    }

    setSentenceInactive() {
      this.sentence.classList.add('inactive');
    }

    setResultActive() {
      this.result.classList.remove('inactive');
    }

    setRecActive() {
      this.rec.classList.remove('inactive');
    }

    setResultInactive() {
      this.result.classList.add('inactive');
    }

    setRecInactive() {
      this.rec.classList.add('inactive');
    }

    setResultTextCnt(char) {
      this.result.textContent = char;
    }

    setRecTextCnt(char) {
      this.rec.textContent = char;
    }

  }

  new Start();

}


