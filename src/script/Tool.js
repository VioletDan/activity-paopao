
export default class Tool {
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