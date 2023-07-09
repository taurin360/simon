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
    constructor() {
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
        this.sentence.classList.add('inactive');
        this.countDisp.classList.remove('inactive');
        this.countDisp.textContent = '0回';
        this.rec.classList.remove('inactive');
        this.rec.textContent = `最高記録は${this.getRec()}回です。`;
        this.congratulation.pause();
        this.demo();
        setTimeout( () => {
          this.question();
          this.countDisplay();
        }, 4000);
      });
    }

    setup() {
      const sound = ["audio/green.mp3", "audio/red.mp3", "audio/yellow.mp3", "audio/blue.mp3"];
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
      // ルール説明
      this.sentence = document.getElementById('sentence');
      // カウント表示
      this.countDisp = document.getElementById('count-disp');
      this.countDisp.textContent = '0回';
      this.countDisp.classList.add('inactive');
      // 最高記録表示
      this.rec = document.getElementById('rec');
      this.rec.textContent = `最高記録は${this.getRec()}回です。`;
      this.rec.classList.add('inactive');
    }

    demo() {
      const demoPtn = [0, 1, 3, 2, 0, 1, 3, 2, 0, 0, 1, 1, 2, 3, 0];
      this.colorBtns[demoPtn[this.demoCnt]].flashDemo();
      this.colorBtns[demoPtn[this.demoCnt]].flashSound();
      this.demoCnt++;
      if (this.demoCnt < demoPtn.length) {
        setTimeout( () => {
          this.demo();
        }, 200);
      }
    }

    getId(colorNum) {
      const id = ['green', 'red', 'yellow', 'blue'];
      return id[colorNum];
    }

    getRec() {
      const KeyName = 'simoncnt';
      if (localStorage.getItem(KeyName) === null) {
        return 0;
      } else {
        return Number(localStorage.getItem(KeyName));
      }
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
      // 0:green 1:red 2:yellow 3:blue ボタンが光った回数を取り出し
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
      // 一定回数以上同じボタンが続くのは許容しない
      let cnt = Math.floor(this.questions.length / 4 + 1);
      let result = false;
      let nowBtn;
      while(result === false) {
        nowBtn = Math.floor(Math.random() * 4);
        if (colorNum[0] >= cnt && nowBtn === 0) {
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

    // カラーボタンを押したときに呼ばれ、押し間違いをチェックする
    check(colorNum) {
      // 押すボタンを間違えたとき終了
      if (this.questions[this.clickCnt - 1] !== colorNum) {
        // 最後のボタン押下は無効
        this.clickCnt -= 1;
        this.center.textContent = 'GAME OVER!'
        this.center.classList.add('end');
        this.gameOverSound.play();
        setTimeout( () => {
          this.restart();
        }, 3000);
      // 全てのボタンを押した
      } else if (this.clickCnt === this.questions.length) {
        // 出題中はカラーボタンは押せない
        this.colorBtns.forEach(colorBtn => {
          colorBtn.disabled();
        });
        // 次の課題へ
        setTimeout( () => {
          this.question();
        }, 1500);
      }
      // 最高到達回数を超えたら更新
      if (this.arrivalCnt < this.clickCnt) {
        this.arrivalCnt = this.clickCnt;
        this.countDisplay();
      }
    }

    countDisplay() {
      this.countDisp.textContent = `${this.arrivalCnt}回`;
    }

    restart() {
      // 今回の到達回数がこれまでの最高回数を上回ればローカルストレージに保存する
      const num = this.getRec();
      if ( num < this.arrivalCnt) {
        // 最高回数を更新した
        localStorage.setItem('simoncnt', this.arrivalCnt);
        this.rec.textContent = '最高記録を更新しました！';
        this.congratulation.play();
      } else {
        // 最高回数に届かなかった
        this.rec.textContent = `最高記録は${num}回です。`;
      }

      this.center.textContent = 'SIMON'
      this.center.classList.remove('end');
      this.cnt = 0;
      this.clickCnt = 0;
      this.demoCnt = 0;
      this.questions.length = 0;
      this.arrivalCnt = 0;
      this.center.classList.remove('disabled')
    }
  }

  new Main();

}


