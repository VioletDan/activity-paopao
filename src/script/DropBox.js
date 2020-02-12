import GameUI from "./GameUI";
let HexagonArr = []; //存放碰撞球的周边6个球的位置
let AllChildrenArr = [];//全部子集
let ballWIDTH = 115; //小球宽度
/**
 * 掉落盒子脚本，实现盒子碰撞及回收流程
 * 子弹必须宽高一样，方便计算
 */
export default class DropBox extends Laya.Script {
    constructor() {
        super();
    }
    onEnable() {
        /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
        this._rig = this.owner.getComponent(Laya.RigidBody);
        //盒子等级
        this.level = 1;
        //全部子集
        this.getAllChildren(this.owner);
    }

    onUpdate() {
        //让持续盒子旋转
        // this.owner.rotation++;
    }

    onTriggerEnter(other, self, contact) {
        // console.log(other.label, self.label)
        var owner = this.owner;
        if (other.label == 'buttle') {
            //子弹碰撞            
            if (self.label == 'redBall') {
                // 碰到的是红色的球，直接消失爆炸
                if (owner.parent) {
                    let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                    effect.pos(owner.x, owner.y);
                    owner.parent.addChild(effect);
                    effect.play(0, true);
                    this.boomAll(owner, AllChildrenArr);
                    owner.removeSelf();
                }
            }

            if (self.label == 'grayBall') {
                //碰到的是灰色的球 ，变成红色
                this.owner.texture = 'gameBox/ball2.png';
                this.owner.getComponent(Laya.CircleCollider).label = 'redBall';
                //全部子集
                this.getAllChildren(this.owner);
            }
        } else if (other.label === "wallBottom") {
            //只盒子碰到地板，则也是消失
            if (owner.parent) {
                let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                effect.pos(owner.x, owner.y);
                owner.parent.addChild(effect);
                effect.play(0, true);
                owner.removeSelf();
            }
        }
    }
    //结束碰撞时更改球球状态
    onTriggerExit(other, self, contact) {
        console.log('onTriggerExit')
    }

    /**
     * 消除碰撞的球球和他的所有相连的红色球球
     */
    boomAll(owner, AllChildrenArr) {
        var arrSix = this.onCheckCollision(owner, AllChildrenArr);
        //=====================边界判断  判断小球是否存在
        AllChildrenArr.filter((ele, Aindex) => {
            arrSix.forEach((value, index) => {
                if (ele.x == value.x && ele.y == value.y) {
                    value.id = ele.var;
                    value.isBall = true;
                    value.index = Aindex;
                    if (ele.getComponent(Laya.CircleCollider).label == 'redBall') {
                        value.isRed = true;
                        this.boomAni(ele, Aindex)

                        AllChildrenArr.splice(Aindex, 1)

                        this.boomAll(ele, AllChildrenArr)
                    }
                }
            })
        })
    }

    /**
     * 
     * @param {*} obj 碰撞检测(六边形检测方法)
     * @param {*} node 当前遍历的子节点
     * @param {*} isNext 是否第二次循环
     *   5⭕⭕3
     *  1⭕⭕⭕2
     *   6⭕⭕4
     */
    onCheckCollision(owner, AllChildrenArr) {
        var rowNum = Number(owner.var.split('')[0]); //行数
        var columNum = Number(owner.var.split('')[1]); //列数
        var columInitNum = GameUI.instance._control.columInitNum;//最大行数
        //6个球球位置
        HexagonArr = [{
            //1左
            id: rowNum + '' + (columNum - 1),
            x: owner.x - ballWIDTH,
            y: owner.y,
            isRed: false,
            isBall: false,
            index: 0
        }, {
            //2右
            id: rowNum + '' + (columNum + 1),
            x: owner.x + ballWIDTH,
            y: owner.y,
            isRed: false,
            isBall: false,
            index: 0
        }, {
            //3右上
            id: (rowNum - 1) + '' + (columNum),
            x: owner.x + ballWIDTH / 2,
            y: owner.y - ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0
        }, {
            //4右下
            id: (rowNum + 1) + '' + (columNum),
            x: owner.x + ballWIDTH / 2,
            y: owner.y + ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0
        }, {
            //5左上
            id: (rowNum - 1) + '' + (columNum - 1),
            x: owner.x - ballWIDTH / 2,
            y: owner.y - ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0
        }, {
            //6左下
            id: (rowNum + 1) + '' + (columNum - 1),
            x: owner.x - ballWIDTH / 2,
            y: owner.y + ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0
        }]
        return HexagonArr;
    }
    /**
     * 获取页面子集
     */
    getAllChildren(obj) {
        AllChildrenArr = [];
        var _numChildren = obj.parent.numChildren;
        for (var i = 0; i < _numChildren; i++) {
            var childPaopao = this.owner.parent.getChildAt(i);
            if (childPaopao.name == 'levelTxt') {
                AllChildrenArr.push(childPaopao)
            }
        }
    }

    /**
     * 
     * @param {*} obj 爆炸位置
     */
    boomAni(obj, index) {
        var owner = this.owner;
        if (owner.parent) {
            let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
            effect.pos(obj.x, obj.y);
            owner.parent.addChild(effect);
            effect.play(0, true);
            obj.removeSelf()

        }
    }

    /**使用对象池创建爆炸动画 */
    createEffect() {
        let ani = new Laya.Animation();
        ani.loadAnimation("TestAni.ani");
        ani.on(Laya.Event.COMPLETE, null, recover);
        function recover() {
            ani.removeSelf();
            Laya.Pool.recover("effect", ani);
        }
        return ani;
    }

    onDisable() {
        //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
        Laya.Pool.recover("dropBox", this.owner);
    }
}