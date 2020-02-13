
import DropBox from "./DropBox";
import Bullet from "./Bullet";
import Tool from "./Tool";
import GameUI from "./GameUI";
let typeMouse = false, isMove = false;
let allA = 0;   // 存放鼠标旋转总共的度数
let mSkinList = ["gameBox/pp1.png", "gameBox/pp2.png"], mCurrSkinIndex = -1;//当前皮肤索引
let mSkinListScreen = ["gameBox/pp2.png", "gameBox/pp1.png"]; // 更换屏幕中间的球的皮肤
let columInitNum = 6; //初始创建泡泡的行数
let columAddNum = 0; // 后面追加的泡泡行数
let ballWIDTH = 115, //小球宽度
    distanceNum1, //一行6个球的间距
    distanceNum2, //一行5个球的间距
    distanceY = ballWIDTH * 2; //需要往上平移的距离

/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
    /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
    /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:6000}*/

    constructor() { super(); }
    onEnable() {
        this.speed = 50;//子弹速度
        ballWIDTH = 115, //小球宽度
            distanceNum1 = (Laya.stage.width - ballWIDTH * 6) / 2, //一行6个球的间距
            distanceNum2 = (Laya.stage.width - ballWIDTH * 5) / 2, //一行5个球的间距
            distanceY = ballWIDTH * 2; //需要往上平移的距离
        //行数
        this.columInitNum = columInitNum;
        //间隔多少毫秒创建一行泡泡
        this.createBoxInterval = 6000;
        //开始时间
        this._time = Date.now();
        //是否已经开始游戏
        this._started = false;
        //子弹和盒子所在的容器对象
        this._gameBox = this.owner.getChildByName("gameBox");
        // 创建泡泡和泡泡的位置摆放
        this.calcBoxPos();

        // A,B,C分别代表中心点，起始点，结束点坐标
        this.pointA = {
            X: this.owner.referenceBall.x + this.owner.referenceBall.width / 2,
            Y: this.owner.referenceBall.y + this.owner.referenceBall.height / 2
        }
        this.pointB = {};
        this.pointC = {};
    }

    onUpdate() {
        //每间隔一段时间泡泡多一行
        let now = Date.now();
        if (now - this._time > this.createBoxInterval) {
            this._time = now;
            columAddNum++;
            var _numChildren = this._gameBox.numChildren;
            if (columAddNum <= 4) {
                for (var i = 0; i < _numChildren; i++) {
                    if (this._gameBox.getChildAt(i).name == 'levelTxt') {
                        Laya.Tween.to(this._gameBox.getChildAt(i), {
                            y: this._gameBox.getChildAt(i).y + ballWIDTH
                        }, 500);
                    }
                }
            }
        }
    }
    //创建泡泡和泡泡的位置摆放
    calcBoxPos() {
        for (var i = 0; i < columInitNum; i++) {
            var isChangeColor = false;
            var randomNumArr = Tool.getRandomArrayElements(['0', '1', '2', '3', '4', '5'], i % 2 == 0 ? 2 : 2);
            // var randomNumArr = ['0', '2', '4']
            var isSix = i % 2 == 0 ? 6 : 5
            // 偶数行有6个球全部居中显示
            for (var j = 0; j < isSix; j++) {
                for (var kk = 0; kk < randomNumArr.length; kk++) {
                    if (randomNumArr[kk] == j) {
                        isChangeColor = true
                        break
                    } else {
                        isChangeColor = false
                    }
                }
                //使用对象池创建盒子
                this.createBox(j, i * ballWIDTH - distanceY, i % 2 == 0 ? distanceNum1 : distanceNum2, isChangeColor, i + '' + j)
            }
        }
    }
    /**
     * 
     * @param {*} j 第几个球
     * @param {*} y y轴坐标
     * @param {*} distanceNum 初始里左边屏幕的间隔
     * @param {*} isChangeColor 是否变成粉色泡泡
     * @param {*} ranksPos  泡泡的行列位置
     */
    createBox(j, y, distanceNum, isChangeColor, ranksPos) {
        // 每行最多3个彩色泡泡
        //使用对象池创建盒子
        let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        box.pos(distanceNum + j * box.width + box.width / 2, y + box.width / 2);
        box.getChildByName('number').text = ranksPos;
        // console.log(ranksPos, '=============', box.x, box.y)
        box.var = ranksPos;
        //设置初始速度
        var rig = box.getComponent(Laya.RigidBody);
        if (isChangeColor) {
            //设置不同颜色的球
            box.texture = 'gameBox/ball2.png';
            box.getComponent(Laya.CircleCollider).label = 'redBall';

        } else {
            box.getComponent(Laya.CircleCollider).label = 'grayBall';
        }

        // rig.setVelocity({ x: 0, y: -10 });
        this._gameBox.addChild(box);
    }

    onStageMouseDown(e) {
        isMove = false
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
        //获取起始点坐标
        this.pointB.X = e.stageX;
        this.pointB.Y = e.stageY;
        // //计算线的高度
        // var pointHeight = Math.abs(this.pointB.Y - this.pointA.Y)
        // GameUI.instance.creatPoint(pointHeight)
        typeMouse = true;

    }

    onStageMouseMove(e) {
        if (typeMouse) {
            isMove = true
            // 获取结束点坐标
            this.pointC.X = e.stageX;
            this.pointC.Y = e.stageY;

            var _allA = this.getAngle()
            this.owner.arrBox.rotation = _allA
            // 运算结束后将起始点重新赋值为结束点，作为下一次的起始点
            this.pointB.X = this.pointC.X;
            this.pointB.Y = this.pointC.Y;
        }
    }
    getAngle() {
        // 分别求出AB,AC的向量坐标表示
        var AB = {};
        var AC = {};
        AB.X = (this.pointB.X - this.pointA.X);
        AB.Y = (this.pointB.Y - this.pointA.Y);
        AC.X = (this.pointC.X - this.pointA.X);
        AC.Y = (this.pointC.Y - this.pointA.Y);
        // AB与AC叉乘求出逆时针还是顺时针旋转               
        var direct = (AB.X * AC.Y) - (AB.Y * AC.X);
        var lengthAB = Math.sqrt(Math.pow(this.pointA.X - this.pointB.X, 2) + Math.pow(this.pointA.Y - this.pointB.Y, 2)),
            lengthAC = Math.sqrt(Math.pow(this.pointA.X - this.pointC.X, 2) + Math.pow(this.pointA.Y - this.pointC.Y, 2)),
            lengthBC = Math.sqrt(Math.pow(this.pointB.X - this.pointC.X, 2) + Math.pow(this.pointB.Y - this.pointC.Y, 2));
        // 余弦定理求出旋转角
        var cosA = (Math.pow(lengthAB, 2) + Math.pow(lengthAC, 2) - Math.pow(lengthBC, 2)) / (2 * lengthAB * lengthAC);
        var angleA = Math.round(Math.acos(cosA) * 180 / Math.PI);
        if (direct < 0) {
            allA -= angleA;   //叉乘结果为负表示逆时针旋转， 逆时针旋转减度数
        } else {
            allA += angleA;   //叉乘结果为正表示顺时针旋转，顺时针旋转加度数
        }
        return allA
    }
    onStageMouseUp(e) {
        typeMouse = false;
        if (isMove) {
            //发射泡泡 
            var _currentSkin = this.changeSkin();
            this.owner.ball.getChildByName('ballChild').texture = mSkinListScreen[mCurrSkinIndex];
            let flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
            flyer.pos(this.owner.getChildByName('ball').x, this.owner.getChildByName('ball').y);
            flyer.alpha = 1;
            flyer.texture = _currentSkin;
            var rig = flyer.getComponent(Laya.RigidBody);
            rig.type = 'dynamic';
            var rigX = Math.cos((90 - allA) * Math.PI / 180) * this.speed;
            var rigY = -Math.sin((90 - allA) * Math.PI / 180) * this.speed;
            rig.setVelocity({ x: rigX, y: rigY });
            this._gameBox.addChild(flyer);
        }
    }
    //换皮肤
    changeSkin(flyer) {
        mCurrSkinIndex++;
        let skinLength = mSkinList.length;
        if (mCurrSkinIndex >= skinLength) {
            mCurrSkinIndex = 0;
        }
        return mSkinList[mCurrSkinIndex];
    }
    onStageClick(e) {
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame() {
        if (!this._started) {
            this._started = true;
            this.enabled = true;
        }
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame() {
        this._started = false;
        this.enabled = false;
        this.createBoxInterval = 6000;
        this._gameBox.removeChildren();
    }

    /**碰撞角度计算 */
    getCalcAngle() {
        return allA
    }
}