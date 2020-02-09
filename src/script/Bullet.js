/**
 * 子弹脚本，实现子弹飞行逻辑及对象池回收机制
 */
import GameUI from "./GameUI";
let rig;
export default class Bullet extends Laya.Script {
    constructor() {
        super();
        //设置单例的引用方式，方便其他类引用
    }
    onEnable() {
        //设置初始速度
        rig = this.owner.getComponent(Laya.RigidBody);
        // rig.setVelocity({ x: 15, y: -15 });
    }

    onTriggerEnter(other, self, contact) {
        //如果被碰到，则移除子弹
        this.owner.removeSelf();
    }

    onUpdate() {
        //如果子弹超出屏幕，则移除子弹
        if (this.owner.y < GameUI.instance.Cordonline.y - this.owner.height) {
            this.owner.removeSelf();
        }
        if (this.owner.x > Laya.stage.width || this.owner.x < -Laya.stage.width) {
            this.owner.removeSelf();
        }
        console.log(this.owner.x, this.owner.y)
    }

    onDisable() {
        //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
        Laya.Pool.recover("bullet", this.owner);
    }
}