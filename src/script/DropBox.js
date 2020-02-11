import GameUI from "./GameUI";
/**
 * 掉落盒子脚本，实现盒子碰撞及回收流程
 */
export default class DropBox extends Laya.Script {
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
        console.log(other.label, self,contact)
        var owner = this.owner;
        if (other.label == 'buttle') {
            //子弹碰撞            
            if (self.label == 'redBall') {
                console.log(owner.x, owner.y)
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
                console.log(this.owner.parent)
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
        console.log('onTriggerExit')
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