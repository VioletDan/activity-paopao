import GameUI from "./GameUI";
let HexagonArr = []; //存放碰撞球的周边6个球的位置
let AllChildrenArr = [];//全部子集
let ballWIDTH = 115; //小球宽度
let ballPosition = Math.sqrt(Math.pow(ballWIDTH, 2) - Math.pow(ballWIDTH / 2, 2))

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
                    this.boomAll(owner, AllChildrenArr, true);
                    //没有任何子集时,消除自己
                    this.boomAni(owner, true);
                    // //爆炸一个加一分
                    // GameUI.instance.addScore(1);
                }
            }

            if (self.label == 'grayBall') {
                //碰到的是灰色的球 ，变成红色
                this.owner.texture = 'images/gameBox/ball2.png';
                this.owner.getComponent(Laya.CircleCollider).label = 'redBall';
                //播放动画
                this.owner.shine.alpha = 1;
                this.owner.shine.play();
                //重新或者全部的子集
                // this.getAllChildren(this.owner);
            }
        } else if (other.label === "wallBottom") {
            //只盒子碰到地板，则也是消失
            if (owner.parent) {
                //消除自己
                this.boomAni(owner, true);
            }
        }
    }
    //结束碰撞时更改球球状态
    onTriggerExit(other, self, contact) {
        // console.log('onTriggerExit')
    }

    /**
     * 消除碰撞的球球和他的所有相连的红色球球
     */
    boomAll(owner, AllChildrenArr, first) {
        var arrSix = this.onCheckCollision(owner);
        //=====================边界判断  判断小球是否存在

        for (var j = AllChildrenArr.length - 1; j >= 0; j--) {
            var ele = AllChildrenArr[j]
            var Aindex = j

            if (!ele) {
                continue;
            }

            for (var i = 0; i < arrSix.length; i++) {
                var value = arrSix[i];

                if (ele.x == value.x && ele.y == value.y && ele.getComponent(Laya.CircleCollider).label == 'redBall') {
                    // value.id = ele.var;
                    value.isBall = true;
                    value.index = Aindex;
                    value.isRed = true;
                    this.boomAni(ele);

                    //爆炸完就删除这个子节点
                    AllChildrenArr.splice(Aindex, 1);

                    //递归
                    this.boomAll(ele, AllChildrenArr);
                    // break;
                }
            }
        }

        if (first) {
            this.removePaopaoDrop()
        }
    }

    /**
     * 
     * @param {*} AllChildrenlist 消除后行子集
     * 只判断这个球球的左上和右上有没有连接的球球，没有的话就掉落
     */
    checkPaopaoDrop(AllChildrenlist) {
        for (var j = 0; j < AllChildrenlist.length; j++) {
            var ele = AllChildrenlist[j]
            var Aindex = j
            var rig = ele.getComponent(Laya.RigidBody);

            var arrSix = this.onCheckCollision(ele);
            //只取左上和右上           
            var arrSixTop = [arrSix[2], arrSix[4]];
            var isDrop = arrSixTop.some((value, index) => {
                var index = AllChildrenArr.findIndex(AllChildren => AllChildren.x == value.x && AllChildren.y == value.y);
                return index > -1;
            })
            if (!isDrop) {
                const index = AllChildrenArr.findIndex(AllChildren => ele.var == AllChildren.var)
                index > -1 && AllChildrenArr.splice(index, 1);
                AllChildrenlist.splice(j, 1);
                rig.type = 'dynamic';
                rig.gravityScale = 1;
                rig.setVelocity({ x: 0, y: 10 });
            }
        }
    }

    /**
     * 移除掉落的泡泡
     */
    removePaopaoDrop() {
        //判断掉落
        const rowArr = []
        AllChildrenArr.forEach(AllChildren => {
            const row = parseInt(Number(AllChildren.var) / 10)

            if (row > 0) {
                if (rowArr[row]) {
                    rowArr[row].push(AllChildren)
                } else {
                    rowArr[row] = [AllChildren]
                }
            }
        });
        rowArr.forEach(row => this.checkPaopaoDrop(row))
    }
    /**
     * 
     * @param {*} obj 碰撞检测(六边形检测方法)
     * @param {*} node 当前遍历的子节点
     * @param {*} isNext 是否第二次循环
     *   4⭕⭕2
     *  0⭕⭕⭕1
     *   5⭕⭕3
     */
    onCheckCollision(owner) {
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
            index: 0,
            pos: 'left'
        }, {
            //2右
            id: rowNum + '' + (columNum + 1),
            x: owner.x + ballWIDTH,
            y: owner.y,
            isRed: false,
            isBall: false,
            index: 0,
            pos: 'right'
        }, {
            //3右上
            id: (rowNum - 1) + '' + (columNum + 1),
            x: owner.x + ballWIDTH / 2,
            y: owner.y - ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0,
            pos: 'rightTop'
        }, {
            //4右下
            id: (rowNum + 1) + '' + (columNum + 1),
            x: owner.x + ballWIDTH / 2,
            y: owner.y + ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0,
            pos: 'rightBottom'
        }, {
            //5左上
            id: (rowNum - 1) + '' + (columNum),
            x: owner.x - ballWIDTH / 2,
            y: owner.y - ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0,
            pos: 'leftTop'
        }, {
            //6左下
            id: (rowNum + 1) + '' + (columNum),
            x: owner.x - ballWIDTH / 2,
            y: owner.y + ballWIDTH,
            isRed: false,
            isBall: false,
            index: 0,
            pos: 'leftBottom'
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
    boomAni(obj, first) {
        var owner = obj;
        let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
        effect.pos(obj.x, obj.y);
        GameUI.instance._control._gameBox.addChild(effect);
        effect.play(0, true);
        if (first) {
            const index = AllChildrenArr.findIndex(AllChildren => obj.var == AllChildren.var);
            index > -1 && AllChildrenArr.splice(index, 1);
            owner.removeSelf();
            //判断掉落
            this.removePaopaoDrop()
        }
        else GameUI.instance._control._gameBox.removeChild(obj);

    }

    /**使用对象池创建爆炸动画 */
    createEffect() {
        let ani = new Laya.Animation();
        ani.loadAnimation("ani/TestAni.ani");
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