let HexagonArr = []; //存放碰撞球的周边6个球的位置
    // let AllChildrenArr = [];//全部子集
    let ballWIDTH = 115; //小球宽度

    /**
     * 掉落盒子脚本，实现盒子碰撞及回收流程
     * 子弹必须宽高一样，方便计算
     */
    class DropBox extends Laya.Script {
        constructor() {
            super();
            //设置单例的引用方式，方便其他类引用
            DropBox.instance = this;
            //子弹和盒子所在的容器对象
            this._gameBox = GameUI.instance.getChildByName("gameBox");
            //全部子集
            this.AllChildrenArr = [];
        }
        onEnable() {
            /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
            this._rig = this.owner.getComponent(Laya.RigidBody);
            //盒子等级
            this.level = 1;
            //全部子集
            this.getAllChildren();
        }

        onUpdate() {
            //让持续盒子旋转
            // this.owner.rotation++;
        }

        onTriggerEnter(other, self, contact) {
            // console.log(other.label, self.label)
            //全部子集
            this.getAllChildren();
            var owner = this.owner;
            if (other.label == 'buttle') {
                //子弹碰撞            
                if (self.label == 'redBall') {
                    // 碰到的是红色的球，直接消失爆炸
                    if (owner.parent) {
                        this.boomAll(owner, this.AllChildrenArr, true);
                        //没有任何子集时,消除自己
                        this.boomAni(owner, 'redBall');
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
                }
            } else if (other.label === "wallBottom") {
                //只盒子碰到地板，则也是消失
                if (owner.parent) {
                    //消除自己
                    this.boomAni(owner, 'wallBottom');
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
                var ele = AllChildrenArr[j];
                var Aindex = j;

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
                if (GameControl.instance._isDrop) {
                    this.removePaopaoDrop();
                }
            }
        }

        /**
         * 移除掉落的泡泡
         */
        removePaopaoDrop() {
            //判断掉落
            const rowArr = [];

            this.getAllChildren();

            this.AllChildrenArr.forEach(AllChildren => {
                const row = parseInt(Number(AllChildren.var) / 10);

                if (row > 0) {
                    if (rowArr[row]) {
                        rowArr[row].push(AllChildren);
                    } else {
                        rowArr[row] = [AllChildren];
                    }
                }
            });
            rowArr.forEach(row => this.checkPaopaoDrop(row));
        }

        /**
        * 
        * @param {*} AllChildrenlist 消除后行子集
        * 只判断这个球球的左上和右上有没有连接的球球，没有的话就掉落
        */
        checkPaopaoDrop(AllChildrenlist) {
            for (var j = 0; j < AllChildrenlist.length; j++) {
                var ele = AllChildrenlist[j];
                var rig = ele.getComponent(Laya.RigidBody);

                var arrSix = this.onCheckCollision(ele);
                //只取左上和右上           
                var arrSixTop = [arrSix[2], arrSix[4]];
                var isDrop = arrSixTop.some((value, index) => {
                    var index = this.AllChildrenArr.findIndex(AllChildren => AllChildren.x == value.x && AllChildren.y == value.y);
                    return index > -1;
                });
                if (!isDrop) {
                    const index = this.AllChildrenArr.findIndex(AllChildren => ele.var == AllChildren.var);
                    index > -1 && this.AllChildrenArr.splice(index, 1);
                    AllChildrenlist.splice(j, 1);
                    rig.type = 'dynamic';
                    rig.gravityScale = 1;
                    rig.setVelocity({ x: 0, y: 10 });
                }
            }
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
            }];
            return HexagonArr;
        }
        /**
         * 获取页面子集
         */
        getAllChildren() {
            var child = this._gameBox;
            this.AllChildrenArr = [];
            var _numChildren = child.numChildren;
            for (var i = 0; i < _numChildren; i++) {
                var childPaopao = child.getChildAt(i);
                if (childPaopao.name == 'levelTxt') {
                    this.AllChildrenArr.push(childPaopao);
                }
            }
        }

        /**
         * 
         * @param {*} obj 爆炸位置
         * @param {*} first 引发爆炸的刚体  是红球还是地板 redBall   wallBottom
         */
        boomAni(obj, first) {
            var owner = obj;
            let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
            effect.pos(obj.x, obj.y);
            GameUI.instance._control._gameBox.addChild(effect);
            effect.play(0, true);
            if (first) {
                const index = this.AllChildrenArr.findIndex(AllChildren => obj.var == AllChildren.var);
                index > -1 && this.AllChildrenArr.splice(index, 1);
                owner.removeSelf();
                //判断掉落
                if (GameControl.instance._isDrop) {
                    this.removePaopaoDrop();
                }
            }
            else GameUI.instance._control._gameBox.removeChild(obj);
            activityPaopaoGame.BarPercentNum = parseInt((1 - (this.AllChildrenArr.length / ballNumber)) * 100);
            if (activityPaopaoGame.BarPercentNum > 0) activityPaopaoGame.renderPanel(activityPaopaoGame.BarPercentNum);
            // if (window.document.getElementsByClassName('BarPercent')[0]) {
            //     window.document.getElementsByClassName('BarPercent')[0].innerHTML = parseInt((1 - (this.AllChildrenArr.length / maxBallNum)) * 100)
            // }
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

    /**
     * 子弹脚本，实现子弹飞行逻辑及对象池回收机制
     */
    let rig;
    class Bullet extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
            //设置初始速度
            rig = this.owner.getComponent(Laya.RigidBody);
        }

        onTriggerEnter(other, self, contact) {
            if (other.label == 'Cordonline') {
                //如果被碰到，则移除子弹
                this.owner.removeSelf();
            } else {
                // var _angle = GameUI.instance._control.getCalcAngle();
                var _angle = GameUI.instance.arrBox.rotation;
                var _speed = GameUI.instance._control.speed;
                if (_angle < 0) {
                    if (360 - (Math.abs(_angle) % 360) > 180 && 360 - (Math.abs(_angle) % 360) < 360) {
                        //初始左边
                        this.wallLeftCollision(other, _speed, _angle);
                    } else {
                        //初始右边
                        this.wallRightCollision(other, _speed, _angle);
                    }
                } else {
                    if (_angle % 360 > 0 && _angle % 360 < 180) {
                        //初始右边
                        this.wallRightCollision(other, _speed, _angle);
                    } else {
                        //初始左边
                        this.wallLeftCollision(other, _speed, _angle);
                    }

                }
            }

            //碰到的是球球
            if (other.label == 'grayBall' || other.label == 'buttle' || other.label == 'redBall') {
                rig.type = 'static';
                Laya.Tween.to(this.owner, {
                    alpha: 0,
                }, 100, Laya.Ease.linearInOut, Laya.Handler.create(this, () => {
                    this.owner.removeSelf();
                }));

            }
        }

        onUpdate() {
            //如果子弹超出屏幕，则移除子弹
            if (this.owner.y > GameUI.instance.ball.y) {
                this.owner.removeSelf();
            }
            if (this.owner.y < GameUI.instance.Cordonline.y - this.owner.height || this.owner.y > Laya.stage.height) {
                this.owner.removeSelf();
            }
            if (this.owner.x > Laya.stage.width || this.owner.x < -Laya.stage.width) {
                this.owner.removeSelf();
            }

        }

        onDisable() {
            //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
            Laya.Pool.recover("bullet", this.owner);
        }

        /**初始值从左边碰撞和右边碰撞不一样 */
        wallLeftCollision(other, _speed, _angle) {
            var rigX, rigY;
            if (other.label == "wallLeft") {
                rigX = - Math.cos((90 - _angle) * Math.PI / 180) * _speed;
                rigY = - Math.sin((90 - _angle) * Math.PI / 180) * _speed;
                rig.setVelocity({ x: rigX, y: rigY });
            }

            if (other.label == "wallRight") {
                rigX = Math.cos((90 - _angle) * Math.PI / 180) * _speed;
                rigY = - Math.sin((90 - _angle) * Math.PI / 180) * _speed;
                rig.setVelocity({ x: rigX, y: rigY });
            }
        }
        /**初始值右边碰撞 */
        wallRightCollision(other, _speed, _angle) {
            var rigX, rigY;
            if (other.label == "wallLeft") {
                rigX = Math.cos((90 - _angle) * Math.PI / 180) * _speed;
                rigY = - Math.sin((90 - _angle) * Math.PI / 180) * _speed;
                rig.setVelocity({ x: rigX, y: rigY });
            }

            if (other.label == "wallRight") {
                rigX = - Math.cos((90 - _angle) * Math.PI / 180) * _speed;
                rigY = - Math.sin((90 - _angle) * Math.PI / 180) * _speed;
                rig.setVelocity({ x: rigX, y: rigY });
            }
        }
    }

    class Tool {
        /**
         * 从数组中随机取几个元素
         * @param {*} arr 数组
         * @param {*} count 取几个数
         */
        static getRandomArrayElements(arr, count) {
            var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
            while (i-- > min) {
                index = Math.floor((i + 1) * Math.random());
                temp = shuffled[index];
                shuffled[index] = shuffled[i];
                shuffled[i] = temp;
            }
            return shuffled.slice(min);
        }

        //节流函数 时间戳版
    	/**
    	 * 
    	 * @param listenerObj 侦听函数所属对象(作用域)
    	 * @param callback 回调
    	 * @param wait 时间间隔
    	 */
    	static throttle(listenerObj, callback, wait) {
    		let previous = 0;
    		return function () {
    			let now = Date.now();
    			let context = listenerObj;
    			let args = arguments;
    			if (now - previous > wait) {
    				callback.apply(context, args);
    				previous = now;
    			}
    		}
    	}
    }

    let typeMouse = false, isMove = false;
    let allA = 0;   // 存放鼠标旋转总共的度数
    let mSkinList = ["images/gameBox/pp1.png", "images/gameBox/pp2.png"], mCurrSkinIndex = -1;//当前皮肤索引
    let mSkinListScreen = ["images/gameBox/pp2.png", "images/gameBox/pp1.png"]; // 更换屏幕中间的球的皮肤
    let columInitNum = 6; //初始创建泡泡的行数
    let columAddNum = 0; // 后面追加的泡泡行数
    let ballWIDTH$1 = 115, //小球宽度
        distanceNum1, //一行6个球的间距
        distanceNum2, //一行5个球的间距
        distanceY = ballWIDTH$1 * 2; //需要往上平移的距离

    let isMouseDownFirst = false;

    /**
     * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
     * 更多类型定义，请参考官方文档
     */
    class GameControl extends Laya.Script {
        /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
        /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
        /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:2000}*/

        constructor() {
            super();
            //设置单例的引用方式，方便其他类引用
            GameControl.instance = this;

            //控制是否整体改变要掉落的泡泡位置 false:不可掉落 true:可掉落
            this._isDrop = true;
        }
        onEnable() {
            this.speed = 50;//子弹速度
            ballWIDTH$1 = 115, //小球宽度
                distanceNum1 = (Laya.stage.width - ballWIDTH$1 * 6) / 2, //一行6个球的间距
                distanceNum2 = (Laya.stage.width - ballWIDTH$1 * 5) / 2, //一行5个球的间距
                distanceY = ballWIDTH$1 * 2; //需要往上平移的距离
            //行数
            this.columInitNum = columInitNum;
            //间隔多少毫秒创建一行泡泡
            this.createBoxInterval = 2000;
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
            };
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
                            y: child.y + ballWIDTH$1
                        }, 300, Laya.Ease.linearInOut, Laya.Handler.create(this, () => {
                            num++;

                            if (num === AllChildrenArr.length) {
                                // console.log('移动完毕');
                                DropBox.instance.AllChildrenArr = [].concat(AllChildrenArr);

                                this._isDrop = true;
                            }
                        }, [i]));
                    });
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
                            isChangeColor = true;
                            break
                        } else {
                            isChangeColor = false;
                        }
                    }
                    //使用对象池创建盒子
                    var x = distanceNum + j * ballWIDTH$1 + ballWIDTH$1 / 2,
                        y = i * ballWIDTH$1 - distanceY + + ballWIDTH$1 / 2;
                    this.createBox(x, y, isChangeColor, i + '' + j, i);
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
            isMove = false;
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

            //---------------------------------------------
        }

        OnStageMouseMove(e) {
            isMouseDownFirst = false;
            if (typeMouse) {
                isMove = true;
                // 获取结束点坐标
                this.pointC.X = e.stageX;
                this.pointC.Y = e.stageY;
                var _allA = this.getAngle(this.pointA, this.pointB, this.pointC);
                this.owner.arrBox.rotation = this.owner.arrBox.moveDownRattion + _allA;
                if (Math.abs(this.owner.arrBox.rotation) % 360 >= 90 && Math.abs(this.owner.arrBox.rotation) % 360 <= 270) {
                    //底部就隐藏箭头
                    this.isOpacity(this.owner.arrBox, 0);
                } else {
                    this.isOpacity(this.owner.arrBox, 1);
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
            this.isOpacity(this.owner.arrBox, 0);
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
            this.createBoxInterval = 2000;
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

    let ballItem;
    class GameUI extends Laya.Scene {
        constructor() {
            super();
            //设置单例的引用方式，方便其他类引用
            GameUI.instance = this;
            //关闭多点触控，否则就无敌了
            Laya.MouseManager.multiTouchEnabled = false;
            //加载场景文件
            this.loadScene("gameBox.scene");
            this.alpha = 0; //过渡页面
            this._UItransition(null, this, this.showShine);
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
            let bottomHeight = this.getChildByName('bottom').height;
            this.getChildByName('bottom').y = Laya.stage.height - bottomHeight;
            // 发射物位置
            ballItem = this.getChildByName('ball');
            ballItem.y = Laya.stage.height - bottomHeight - ballItem.height - 15;

            //箭头位置
            this.initArrBoxLine();

            //参照圆心位置
            this.referenceBall.x = (Laya.stage.width - this.referenceBall.width) / 2;
            this.referenceBall.y = ballItem.y;

            //手指触碰热区位置 逻辑
            this.Cordonline.y = -Laya.stage.height;
            this.Cordonline.visible = false;
            this.touchArea.height = Laya.stage.height - this.Cordonline.height;
            this.touchArea.y = this.Cordonline.y;

            //墙壁
            this.wallBottom.y = ballItem.y;
        }

        /**
         * 初始化箭头位置
         */
        initArrBoxLine() {
            let arrBox = this.arrBox;
            arrBox.y = ballItem.y + 15;
            arrBox.x = (Laya.stage.width - arrBox.width) / 2;
            arrBox.texture = '';
            this.creatPoint(ballItem.y);
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
            creat();
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
            }, 500);
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

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/GameUI.js",GameUI);
    		reg("script/GameControl.js",GameControl);
    		reg("script/Bullet.js",Bullet);
    		reg("script/DropBox.js",DropBox);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1624;
    GameConfig.scaleMode ="fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "loadBox.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    var Loader = Laya.Loader;
    var PreResources = [
    	{ url: 'images/gameBox/bg.jpg', type: Loader.IMAGE },
    	{ url: 'images/gameBox/bottle.png', type: Loader.IMAGE },
    	{ url: 'images/gameBox/bottom.png', type: Loader.IMAGE },
    	{ url: 'res/atlas/gameBox.atlas', type: Loader.ATLAS },
    	{ url: 'res/atlas/gameBox.png', type: Loader.IMAGE }
    ];
    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎		
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		Laya.stage.bgColor = "none";
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError = true;

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		// Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    		this.onVersionLoaded();
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));		
    	}

    	onConfigLoaded() {		
    		//加载IDE指定的场景
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    		// Laya.loader.load(PreResources,Laya.Handler.create(this, this.loadInit));
    	}

    	loadInit(){
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();