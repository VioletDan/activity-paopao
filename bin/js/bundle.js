(function () {
    'use strict';

    /**
     * 掉落盒子脚本，实现盒子碰撞及回收流程
     */
    class DropBox extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
            this._rig = this.owner.getComponent(Laya.RigidBody);
            //盒子等级
            this.level = 1;
        }

        onUpdate() {
            //让持续盒子旋转
            // this.owner.rotation++;
        }

        onTriggerEnter(other, self, contact) {
            console.log(other.label, self,contact);
            var owner = this.owner;
            if (other.label == 'buttle') {
                //子弹碰撞            
                if (self.label == 'redBall') {
                    console.log(owner.x, owner.y);
                    //碰到的是红色的球，直接消失爆炸
                    if (owner.parent) {
                        let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                        effect.pos(owner.x, owner.y);
                        owner.parent.addChild(effect);
                        effect.play(0, true);
                        owner.removeSelf();
                    }
                }

                if (self.label == 'grayBall') {
                    //碰到的是灰色的球 ，变成红色
                    this.owner.texture = 'gameBox/ball2.png';
                    this.owner.getComponent(Laya.CircleCollider).label = 'redBall';
                    console.log(this.owner.parent);
                }
            }


            // if (other.label === "buttle") {
            //     //碰撞到子弹后，增加积分，播放声音特效
            //     if (this.level > 1) {
            //         this.level--;
            //         owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
            //     } else {
            //         if (owner.parent) {
            //             let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
            //             effect.pos(owner.x, owner.y);
            //             owner.parent.addChild(effect);
            //             effect.play(0, true);
            //             owner.removeSelf();
            //         }
            //     }
            //     GameUI.instance.addScore(1);
            // } else if (other.label === "ground") {
            //     //只要有一个盒子碰到地板，则停止游戏
            //     owner.removeSelf();
            //     GameUI.instance.stopGame();
            // }
        }
        //结束碰撞时更改球球状态
        onTriggerExit(other, self, contact) {
            console.log('onTriggerExit');
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
                var _angle = GameUI.instance._control.getCalcAngle();
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
                }, 500, Laya.Ease.linearInOut, Laya.Handler.create(this, () => {
                    this.owner.removeSelf();
                }));

            }
        }

        onUpdate() {
            //如果子弹超出屏幕，则移除子弹
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
    }

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
    class GameControl extends Laya.Script {
        /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
        /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
        /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:6000}*/

        constructor() { super(); }
        onEnable() {
            this.speed = 35;//子弹速度
            ballWIDTH = 115, //小球宽度
                distanceNum1 = (Laya.stage.width - ballWIDTH * 6) / 2, //一行6个球的间距
                distanceNum2 = (Laya.stage.width - ballWIDTH * 5) / 2, //一行5个球的间距
                distanceY = ballWIDTH * 2; //需要往上平移的距离
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
            };
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
                var isSix = i % 2 == 0 ? 6 : 5;
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
                    this.createBox(j, i * ballWIDTH - distanceY, i % 2 == 0 ? distanceNum1 : distanceNum2, isChangeColor);
                }
            }
        }
        /**
         * 
         * @param {*} j 第几个球
         * @param {*} y y轴坐标
         * @param {*} distanceNum 初始里左边屏幕的间隔
         * @param {*} isChangeColor 是否变成粉色泡泡
         */
        createBox(j, y, distanceNum, isChangeColor) {
            // 每行最多3个彩色泡泡
            //使用对象池创建盒子
            let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
            box.pos(distanceNum + j * box.width, y);
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
            isMove = false;
            //停止事件冒泡，提高性能，当然也可以不要
            e.stopPropagation();
            //获取起始点坐标
            this.pointB.X = e.stageX;
            this.pointB.Y = e.stageY;
            typeMouse = true;

        }

        onStageMouseMove(e) {
            if (typeMouse) {
                isMove = true;
                // 获取结束点坐标
                this.pointC.X = e.stageX;
                this.pointC.Y = e.stageY;

                var _allA = this.getAngle();
                this.owner.arrBox.rotation = _allA;
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
            this.initPage();
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
            this.touchArea.height = Laya.stage.height - this.Cordonline.height;
            this.touchArea.y = this.Cordonline.y;

            //墙壁
            this.wallBottom.y = this.getChildByName('bottom').y;
        }

        /**
         * 初始化箭头位置
         */
        initArrBoxLine() {
            let arrBox = this.arrBox;
            arrBox.y = ballItem.y - 15;
            this.arrBoxLine = new Laya.Sprite();
            this.arrBoxLine.zOrder = 10;
            Laya.stage.addChild(this.arrBoxLine);
            // this.applayFilter()
        }


        /**增加分数 */
        addScore(value) {
            console.log(value);

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
    GameConfig.startScene = "gameBox.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    var Loader = Laya.Loader;
    var PreResources = [
    	{ url: 'gameBox/bg.jpg', type: Loader.IMAGE },
    	{ url: 'gameBox/bottle.png', type: Loader.IMAGE },
    	{ url: 'gameBox/bottom.png', type: Loader.IMAGE },
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
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));		
    	}

    	onConfigLoaded() {		
    		//加载IDE指定的场景
    		// GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    		Laya.loader.load(PreResources,Laya.Handler.create(this, this.loadInit));
    	}

    	loadInit(){
    		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    	}
    }
    //激活启动类
    new Main();

}());
