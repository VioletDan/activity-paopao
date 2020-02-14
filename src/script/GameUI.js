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
    }

    onEnable() {
        this.initPage();
        //戏控制脚本引用，避免每次获取组件带来不必要的性能开销
        this._control = this.getComponent(GameControl);
        //点击提示文字，开始游戏
        // this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
    }

    onTipClick(e) {
        this.tipLbll.visible = false;
        this._score = 0;
        this._control.startGame();
    }
    /** 初始化页面*/
    initPage() {
        //初始化页面
        // this.bg.visible = false;
        this.tipLbll.visible = false;
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

        //手指触碰热区位置 逻辑
        this.Cordonline.y = -Laya.stage.height;
        this.Cordonline.visible = false;
        this.touchArea.height = Laya.stage.height - this.Cordonline.height
        this.touchArea.y = this.Cordonline.y

        //墙壁
        this.wallBottom.y = ballItem.y
    }

    /**
     * 初始化箭头位置
     */
    initArrBoxLine() {
        let arrBox = this.arrBox;
        arrBox.y = ballItem.y + 15;
        arrBox.x = (Laya.stage.width - arrBox.width) / 2;
        arrBox.texture = '';
        this.creatPoint(ballItem.y)
        // this.arrBoxLine = new Laya.Sprite()
        // this.arrBoxLine.zOrder = 10
        // Laya.stage.addChild(this.arrBoxLine);
        // this.applayFilter()
    }
    //创建小点点
    creatPoint(height) {
        //定义一个小点点所在的高度为26
        let arrBox = this.arrBox;
        arrBox.alpha = 0;
        arrBox.height = height;
        let initPoinDis = 40;
        let pointNum = Math.floor(arrBox.height / initPoinDis);
        arrBox.pivotY = arrBox.height;
        var that = this;
        creat()
        function creat() {
            for (var i = 0; i < pointNum; i++) {

                if (i % 2 == 0) {
                    var pointChild = new Laya.Sprite();
                    pointChild.texture = 'images/gameBox/pointer.png';
                    pointChild.width = arrBox.width;
                    pointChild.height = 16;
                    pointChild.pos(0, initPoinDis * i);
                    arrBox.addChild(pointChild);
                } else {
                    let effect = Laya.Pool.getItemByCreateFun("effect", that.createEffect, that);
                    effect.width = arrBox.width;
                    effect.height = 16;
                    effect.pos(arrBox.width / 2, initPoinDis * i + arrBox.width / 2);
                    arrBox.addChild(effect);
                    effect.play(0, true);
                }
            }
        }

    }
    /**使用对象池创建点点动画 */
    createEffect() {
        let ani = new Laya.Animation();
        ani.loadAnimation("ani/TestPoint.ani");
        ani.on(Laya.Event.COMPLETE, null, recover);
        function recover() {
            // ani.removeSelf();
            // Laya.Pool.recover("effect", ani);
        }
        return ani;
    }
    /**增加分数 */
    addScore(value) {
        this._score += Number(value);
        console.log("分数：", this._score);
    }

    /**停止游戏 */
    stopGame() {
        this._control.stopGame();
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


    applayFilter() {
        // 创建一个发光滤镜
        const GlowFilter = Laya.GlowFilter;
        let glowFilter = new GlowFilter("#ffff00", 10, 0, 0);
        // 设置滤镜集合为发光滤镜
        this.arrBoxLine.filters = [glowFilter];
    }
}