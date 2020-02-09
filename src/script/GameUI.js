import GameControl from "./GameControl"
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
let apePath = "gameBox/arrLine.png";
let _this = null, ballItem;
let preRadian = 0;
let typeMouse = false;
let allA = 0;   // 存放鼠标旋转总共的度数
export default class GameUI extends Laya.Scene {
    constructor() {
        super();
        //设置单例的引用方式，方便其他类引用
        GameUI.instance = this;
        _this = this
        //关闭多点触控，否则就无敌了
        Laya.MouseManager.multiTouchEnabled = false;
        //加载场景文件
        this.loadScene("gameBox.scene");
        this.alpha = 0 //过渡页面
        this._UItransition(null, this, this.showShine)
        this.initPage()
    }

    onEnable() {
        //戏控制脚本引用，避免每次获取组件带来不必要的性能开销
        this._control = this.getComponent(GameControl);
    }

    onTipClick(e) {

    }
    /** 初始化页面*/
    initPage() {
        //初始话页面
        // this.bg.height = Laya.stage.height
        let bottomHeight = this.getChildByName('bottom').height
        this.getChildByName('bottom').y = Laya.stage.height - bottomHeight
        // 发射物位置
        ballItem = this.getChildByName('ball')
        ballItem.y = Laya.stage.height - bottomHeight - ballItem.height - 15

        //箭头位置
        this.initArrBoxLine()

        //参照圆心位置
        this.referenceBall.x = (Laya.stage.width - this.referenceBall.width) / 2
        this.referenceBall.y = ballItem.y
        // this.referenceBall.y = (arrBox.y - arrBox.height) + ((arrBox.height - this.referenceBall.height) / 2)

        // A,B,C分别代表中心点，起始点，结束点坐标
        // this.pointA = {
        //     X: this.referenceBall.x + this.referenceBall.width / 2,
        //     Y: this.referenceBall.y + this.referenceBall.height / 2
        // }
        // this.pointB = {};
        // this.pointC = {};

        //手指触碰热区位置 逻辑
        // this.touchArrHandle()
        this.touchArea.height = Laya.stage.height - this.Cordonline.height
        this.touchArea.y = this.Cordonline.y

    }

    /**
     * 初始化箭头位置
     */
    initArrBoxLine() {
        let arrBox = this.arrBox
        arrBox.y = ballItem.y - 15
        this.arrBoxLine = new Laya.Sprite()
        this.arrBoxLine.zOrder = 10
        Laya.stage.addChild(this.arrBoxLine);
        // this.applayFilter()
    }


    /**增加分数 */
    addScore(value) {
        console.log(value)

    }

    /**停止游戏 */
    stopGame() {

    }
    /**
     * 页面过渡
     */
    _UItransition(UIa, UIb, callback) {
        // Laya.Tween.to(UIa, {
        //     alpha: 0
        // }, 500);

        UIb.visible = true;
        Laya.Tween.to(UIb, {
            alpha: 1
        }, 500);

        setTimeout(() => {
            // UIa.visible = false;
            if (callback) callback();
        }, 500)
    }

    /**显示瓶子亮光 */
    showShine() {
        // _this.bottleBox.getChildByName('shine1').play()
    }
    /**
     * 这里通过鼠标的移动获取起始点和结束点
     */
    touchArrHandle() {
        this.touchArea.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onballUp);
    }

    onMouseDown(e) {
        //获取起始点坐标
        this.pointB.X = e.stageX;
        this.pointB.Y = e.stageY;
        typeMouse = true;
        //如果用户只是点击屏幕，这个时候也要让箭头旋转相应的角度
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    onMouseMove(e) {
        if (typeMouse) {
            // 获取结束点坐标
            this.pointC.X = e.stageX;
            this.pointC.Y = e.stageY;

            var _allA = this.getAngle()
            this.arrBox.rotation = _allA

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
    onMouseUp(e) {
        typeMouse = false;
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }
    /**
     * 发射逻辑
     */
    onallUp() {
        typeMouse = false;
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }
    applayFilter() {
        // 创建一个发光滤镜
        const GlowFilter = Laya.GlowFilter;
        let glowFilter = new GlowFilter("#ffff00", 10, 0, 0);
        // 设置滤镜集合为发光滤镜
        this.arrBoxLine.filters = [glowFilter];
    }
}