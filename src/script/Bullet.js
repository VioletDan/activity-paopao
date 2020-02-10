/**
 * 子弹脚本，实现子弹飞行逻辑及对象池回收机制
 */
import GameUI from "./GameUI";
let rig;
export default class Bullet extends Laya.Script {
    constructor() {
        super();
    }
    onEnable() {
        //设置初始速度
        rig = this.owner.getComponent(Laya.RigidBody);
    }

    onTriggerEnter(other, self, contact) {
        console.log(other.label)
        var rigX, rigY;
        var _angle = GameUI.instance._control.getCalcAngle();
        var _speed = GameUI.instance._control.speed;
        console.log(_angle)
        if (_angle < 0) {
            if (360 - (Math.abs(_angle) % 360) > 180 && 360 - (Math.abs(_angle) % 360) < 360) {
                //初始左边
                this.wallLeftCollision(other, _speed, _angle)
            } else {
                //初始右边
                this.wallRightCollision(other, _speed, _angle)
            }
        } else {
            if (_angle % 360 > 0 && _angle % 360 < 180) {
                //初始右边
                this.wallRightCollision(other, _speed, _angle)
            } else {
                //初始左边
                this.wallLeftCollision(other, _speed, _angle)
            }

        }

        //如果被碰到，则移除子弹
        // this.owner.removeSelf();
    }

    onUpdate() {
        //如果子弹超出屏幕，则移除子弹
        if (this.owner.y < GameUI.instance.Cordonline.y - this.owner.height || this.owner.y > Laya.stage.height) {
            this.owner.removeSelf();
        }
        if (this.owner.x > Laya.stage.width || this.owner.x < -Laya.stage.width) {
            // this.owner.removeSelf();
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