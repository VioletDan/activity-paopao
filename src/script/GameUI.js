// import GameControl from "./GameControl"
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
let _this = null
let preRadian = 0
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
        let ballItem = this.getChildByName('ball')
        ballItem.y = Laya.stage.height - bottomHeight - ballItem.height - 15
        //箭头位置
        let arrBox = this.arrBox
        arrBox.y = ballItem.y - 15
        //参照圆心位置
        this.referenceBall.x = (Laya.stage.width - this.referenceBall.width) / 2
        this.referenceBall.y = (arrBox.y - arrBox.height) + ((arrBox.height - this.referenceBall.height) / 2)
        this.arrInitCoordinate = [{ stageX: this.referenceBall.x + this.referenceBall.width / 2, stageY: this.referenceBall.y + this.referenceBall.height / 2 }]
        this.pointer.x = this.arrInitCoordinate[0].stageX
        this.pointer.y = this.arrInitCoordinate[0].stageY
        console.log(this.arrInitCoordinate)

        //手指触碰热区位置 逻辑
        this.touchArrHandle()
        this.touchArea.height = this.arrBox.y - this.Cordonline.y
        this.touchArea.y = this.Cordonline.y

    }
    /**增加分数 */
    addScore(value) {

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
     * 手指按住屏幕旋转箭头
     */
    touchArrHandle() {
        this.touchArea.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
    }

    onMouseDown(e) {
        const Event = Laya.Event;
        var x = e.stageX;
        var y = e.stageY;
        var origin = this.arrInitCoordinate // 当前元素的中心点

        // 计算出当前鼠标相对于元素中心点的坐标
        x = x - origin[0].stageX;
        y = origin[0].stageY - y;
        var degree = this.atan2(y, x);
        console.log('before',degree)
        this.arrBox.rotation = degree;
    }

    //计算角度
    atan2(y, x) {
        var degree = 180 / Math.PI * (Math.atan2(y, x));
        degree = -degree;
        return degree
    }

    onMouseUp(e) {
        const Event = Laya.Event;
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }
}