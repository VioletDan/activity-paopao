
import DropBox from "./DropBox";
import Bullet from "./Bullet";
import Tool from "./Tool";
import GameUI from "./GameUI";
let typeMouse = false, isMove = false;
let allA = 0;   // 存放鼠标旋转总共的度数
let mSkinList = ["images/gameBox/pp1.png", "images/gameBox/pp2.png"], mCurrSkinIndex = -1;//当前皮肤索引
let mSkinListScreen = ["images/gameBox/pp2.png", "images/gameBox/pp1.png"]; // 更换屏幕中间的球的皮肤
let columInitNum = 6; //初始创建泡泡的行数
let columAddNum = 0; // 后面追加的泡泡行数
let ballWIDTH = 115, //小球宽度
    distanceNum1, //一行6个球的间距
    distanceNum2, //一行5个球的间距
    distanceY = ballWIDTH * 2 + 45; //需要往上平移的距离

let isMouseDownFirst = false;
let tallA;

let onceFnFlag = true;

/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
    /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
    /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:4000}*/

    constructor() {
        super();
        //设置单例的引用方式，方便其他类引用
        GameControl.instance = this;

        //控制是否整体改变要掉落的泡泡位置 false:不可掉落 true:可掉落
        this._isDrop = true;
    }
    onEnable() {
        this.speed = 50;//子弹速度
        ballWIDTH = 115, //小球宽度
            distanceNum1 = (Laya.stage.width - ballWIDTH * 6) / 2, //一行6个球的间距
            distanceNum2 = (Laya.stage.width - ballWIDTH * 5) / 2, //一行5个球的间距
            distanceY = ballWIDTH * 2 + 45; //需要往上平移的距离
        //行数
        this.columInitNum = columInitNum;
        //间隔多少毫秒创建一行泡泡
        this.createBoxInterval = 4000;
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

        //点击事件
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnStageMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnStageMouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, Tool.throttle(this, this.OnStageMouseUp, 500));
    }

    onUpdate() {
        //每间隔一段时间泡泡多一行
        let now = Date.now();
        if (now - this._time > this.createBoxInterval) {
            this._time = now;
            columAddNum++;
            var _numChildren = this._gameBox.numChildren;
            if (columAddNum <= 4) {
                this._isDrop = false;
                let num = 0;
                const AllChildrenArr = [];

                for (var i = 0; i < _numChildren; i++) {
                    if (this._gameBox.getChildAt(i).name == 'levelTxt') {
                        AllChildrenArr.push(this._gameBox.getChildAt(i));
                    }
                }

                AllChildrenArr.forEach(child => {
                    Laya.Tween.to(child, {
                        y: child.y + ballWIDTH
                    }, 300, Laya.Ease.linearInOut, Laya.Handler.create(this, () => {
                        num++;

                        if (num === AllChildrenArr.length) {
                            // console.log('移动完毕');
                            DropBox.instance.AllChildrenArr = [].concat(AllChildrenArr);

                            this._isDrop = true;
                        }
                    }, [i]));
                })
            }
        }
    }
    //创建泡泡和泡泡的位置摆放
    calcBoxPos() {
        //每次创建之前先清除盒子
        GameUI.instance.getChildByName("gameBox").removeChildren();
        // const arr = [
        //     ["3", "4"],
        //     ["2", "1"],
        //     ["0", "2"],
        //     ["4", "3"],
        //     ["5", "0"],
        //     ["5", "1"]
        // ]

        for (var i = 0; i < columInitNum; i++) {
            var isChangeColor = false;
            var randomNumArr = Tool.getRandomArrayElements(['0', '1', '2', '3', '4', '5'], i % 2 == 0 ? 2 : 2);
            // var randomNumArr = arr[i]
            var isSix = i % 2 == 0 ? 6 : 5;
            var distanceNum = i % 2 == 0 ? distanceNum1 : distanceNum2;
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
                var x = distanceNum + j * ballWIDTH + ballWIDTH / 2,
                    y = i * ballWIDTH - distanceY + + ballWIDTH / 2;
                this.createBox(x, y, isChangeColor, i + '' + j, i)
            }
        }
    }
    /**
     * 
     * @param {*} x x轴坐标
     * @param {*} y y轴坐标
     * @param {*} isChangeColor 是否变成粉色泡泡
     * @param {*} ranksPos  泡泡的行列位置
     * @param {*} row  泡泡的行数
     */
    createBox(x, y, isChangeColor, ranksPos, row) {
        // 每行最多3个彩色泡泡
        //使用对象池创建盒子
        let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        var rig = box.getComponent(Laya.RigidBody);

        //=======取出之前重置数据
        box.texture = 'images/gameBox/ball1.png';
        box.getComponent(Laya.CircleCollider).label = 'grayBall';
        if (rig.type = 'dynamic') {
            rig.type = 'static';
            rig.gravityScale = 0;
        }
        box.shine.stop(true);
        //=======取出之前重置数据

        box.pos(x, y);
        // box.getChildByName('number').text = ranksPos;
        // console.log(ranksPos, '=============', box.x, box.y)
        if (isChangeColor) {
            box.shine.alpha = 1;
            box.shine.play();
        }
        box.var = ranksPos;
        //设置初始速度
        if (isChangeColor) {
            //设置不同颜色的球
            box.texture = 'images/gameBox/ball2.png';
            box.getComponent(Laya.CircleCollider).label = 'redBall';

        } else {
            box.getComponent(Laya.CircleCollider).label = 'grayBall';
        }

        // rig.setVelocity({ x: 0, y: -10 });
        this._gameBox.addChild(box);
    }

    OnStageMouseDown(e) {
        // if (!this._started) return;    
        isMove = false
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
        //获取起始点坐标
        this.pointB.X = e.stageX;
        this.pointB.Y = e.stageY;
        typeMouse = true;
        isMouseDownFirst = true;
        //计算线的高度
        if (isMouseDownFirst) {
            var _tallA;
            var a = { X: this.pointA.X, Y: this.pointA.Y };
            var b = { X: this.pointA.X, Y: this.pointB.Y };
            var c = { X: this.pointB.X, Y: this.pointB.Y };
            _tallA = this.getAngle(a, b, c, true);
            this.owner.arrBox.rotation = _tallA;
            this.owner.arrBox.moveDownRattion = _tallA;
        }
        this.isOpacity(this.owner.arrBox, 1);
        //开始瓶子发光效果
        GameUI.instance.borderShine.play();
        //---------------------------------------------
    }

    OnStageMouseMove(e) {
        isMouseDownFirst = false;
        if (typeMouse) {
            isMove = true
            // 获取结束点坐标
            this.pointC.X = e.stageX;
            this.pointC.Y = e.stageY;
            var _allA = this.getAngle(this.pointA, this.pointB, this.pointC)
            this.owner.arrBox.rotation = this.owner.arrBox.moveDownRattion + _allA;
            if (Math.abs(this.owner.arrBox.rotation) % 360 >= 90 && Math.abs(this.owner.arrBox.rotation) % 360 <= 270) {
                //底部就隐藏箭头
                this.isOpacity(this.owner.arrBox, 0)
            } else {
                this.isOpacity(this.owner.arrBox, 1)
            }
            // 运算结束后将起始点重新赋值为结束点，作为下一次的起始点
            // this.pointB.X = this.pointC.X;
            // this.pointB.Y = this.pointC.Y;
        }
    }
    /**
     * 
     * @param {*} a 发射点圆心
     * @param {*} b  第一次触摸点
     * @param {*} c  第二次触摸点
     */
    getAngle(a, b, c) {
        // 分别求出AB,AC的向量坐标表示
        var tallA;
        var AB = {};
        var AC = {};
        AB.X = (b.X - a.X);
        AB.Y = (b.Y - a.Y);
        AC.X = (c.X - a.X);
        AC.Y = (c.Y - a.Y);
        // AB与AC叉乘求出逆时针还是顺时针旋转               
        var direct = (AB.X * AC.Y) - (AB.Y * AC.X);
        var lengthAB = Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2)),
            lengthAC = Math.sqrt(Math.pow(a.X - c.X, 2) + Math.pow(a.Y - c.Y, 2)),
            lengthBC = Math.sqrt(Math.pow(b.X - c.X, 2) + Math.pow(b.Y - c.Y, 2));
        // 余弦定理求出旋转角
        var cosA = (Math.pow(lengthAB, 2) + Math.pow(lengthAC, 2) - Math.pow(lengthBC, 2)) / (2 * lengthAB * lengthAC);
        var angleA = Math.round(Math.acos(cosA) * 180 / Math.PI);

        if (direct < 0) {
            tallA = - angleA;   //叉乘结果为负表示逆时针旋转， 逆时针旋转减度数
        } else {
            tallA = +angleA;   //叉乘结果为正表示顺时针旋转，顺时针旋转加度数
        }

        return tallA;

        // if (isMouseDownFirst) {
        //     //一次触摸
        //     if (direct < 0) {
        //         tallA = - angleA;   //叉乘结果为负表示逆时针旋转， 逆时针旋转减度数
        //     } else {
        //         tallA = +angleA;   //叉乘结果为正表示顺时针旋转，顺时针旋转加度数
        //     }
        //     return tallA
        // } else {
        //     if (direct < 0) {
        //         allA -= angleA;   //叉乘结果为负表示逆时针旋转， 逆时针旋转减度数
        //     } else {
        //         allA += angleA;   //叉乘结果为正表示顺时针旋转，顺时针旋转加度数
        //     }
        //     return allA
        // }
    }
    OnStageMouseUp(e) {
        //游戏未开始
        allA = 0;
        // if (Math.abs(this.owner.arrBox.rotation) % 360 >= 90 && Math.abs(this.owner.arrBox.rotation) % 360 <= 270) {
        //     this.isOpacity(this.owner.arrBox, 0)
        //     return
        // } else {
        //     this.isOpacity(this.owner.arrBox, 1)
        // }
        typeMouse = false;
        if (isMove || isMouseDownFirst) {
            this.launchPaopao();
        }
        //停止瓶子发光效果
        GameUI.instance.borderShine.stop();
    }
    /**
     * 发射泡泡
     */
    launchPaopao() {
        //发射泡泡 
        var _currentSkin = this.changeSkin();
        this.owner.ball.getChildByName('ballChild').texture = mSkinListScreen[mCurrSkinIndex];
        let flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
        flyer.pos(this.owner.getChildByName('ball').x, this.owner.getChildByName('ball').y);
        flyer.alpha = 1;
        flyer.texture = _currentSkin;
        var rig = flyer.getComponent(Laya.RigidBody);
        rig.type = 'dynamic';
        var rigX = Math.cos((90 - this.owner.arrBox.rotation) * Math.PI / 180) * this.speed;
        var rigY = -Math.sin((90 - this.owner.arrBox.rotation) * Math.PI / 180) * this.speed;
        rig.setVelocity({ x: rigX, y: rigY });
        this._gameBox.addChild(flyer);
        // this.isOpacity(this.owner.arrBox, 0)
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
            console.log('开始游戏');
        }
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame() {
        this._started = false;
        this.enabled = false;
        this.createBoxInterval = 4000;
        GameUI.instance.arrBox.alpha = 0;        
        // GameUI.instance.getChildByName("gameBox").removeChildren();
        columAddNum = 5;
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.OnStageMouseDown);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnStageMouseMove);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, Tool.throttle(this, this.OnStageMouseUp, 500));
        console.log('结束游戏');
    }
    /**再玩一次 */
    againGame() {
        columAddNum = 0;
        this._isDrop = true;
        GameControl.instance.calcBoxPos();
        this.startGame();
        GameUI.instance.arrBox.alpha = 0; 
        //点击事件
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.OnStageMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnStageMouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, Tool.throttle(this, this.OnStageMouseUp, 500));
    }

    onDisable() {
        // //泡泡被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
        // Laya.Pool.recover("dropBox", this.owner);
    }
    /**碰撞角度计算 */
    getCalcAngle() {
        return allA;
    }

    //透明度变换
    /**
     * 
     * @param {*} ele 元素
     * @param {*} alpha 透明度
     * @param {*} dur 持续时间
     */
    isOpacity(ele, alpha, dur) {
        var dur = dur || 300;
        Laya.Tween.to(ele, {
            alpha: alpha,
        }, dur);
    }
}