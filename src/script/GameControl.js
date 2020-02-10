
import DropBox from "./DropBox";
import Bullet from "./Bullet";
let typeMouse = false, isMove = false;
let allA = 0;   // 存放鼠标旋转总共的度数
let mSkinList = ["gameBox/pp1.png", "gameBox/pp2.png"], mCurrSkinIndex = -1;//当前皮肤索引
let mSkinListScreen = ["gameBox/pp2.png", "gameBox/pp1.png"]; // 更换屏幕中间的球的皮肤
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
    /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
    /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:1000}*/

    constructor() { super(); }
    onEnable() {
        this.speed = 35;//子弹速度
        //间隔多少毫秒创建一个下跌的容器
        this.createBoxInterval = 1000;
        //开始时间
        this._time = Date.now();
        //是否已经开始游戏
        this._started = false;
        //子弹和盒子所在的容器对象
        this._gameBox = this.owner.getChildByName("gameBox");
        // this.createBox();

        // A,B,C分别代表中心点，起始点，结束点坐标
        this.pointA = {
            X: this.owner.referenceBall.x + this.owner.referenceBall.width / 2,
            Y: this.owner.referenceBall.y + this.owner.referenceBall.height / 2
        }
        this.pointB = {};
        this.pointC = {};
    }

    onUpdate() {
        //每间隔一段时间创建一个盒子
        // let now = Date.now();
        // if (now - this._time > this.createBoxInterval) {
        //     this._time = now;
        //     this.createBox();
        // }
    }

    createBox() {
        //使用对象池创建盒子
        let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        box.pos(Math.random() * (Laya.stage.width - 100), -100);
        this._gameBox.addChild(box);
    }
    onStageMouseDown(e) {
        isMove = false
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
        //获取起始点坐标
        this.pointB.X = e.stageX;
        this.pointB.Y = e.stageY;
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
            flyer.texture = _currentSkin;
            var rig = flyer.getComponent(Laya.RigidBody);
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
        this.createBoxInterval = 1000;
        this._gameBox.removeChildren();
    }

    /**碰撞角度计算 */
    getCalcAngle() {
        return allA
    }
}