/**
 * *********************************************************************************
 *                                                                                  *
 * enable requestAnimationFrame method and corresponding cancel method
 * 参考地址：
 * http://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/
 * 原文多了一些没用的东西，比如回调函数里传了个莫名其妙的时间参数，
 * 比如自定义requestAnimationFrame函数时多加了一个element参数
 *                                                                                  *
 ***********************************************************************************/
(function () {
    let lastTime = 0
    const vendors = ['webkit', 'moz']
    for (let i = 0, length = vendors.length; i < length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame']
        // webkit中cancel方法的名称跟其他的不一样
        window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame']
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (cb) {
            const curTime = +new Date()
            const timeToCall = Math.max(0, 16.7 - (curTime - lastTime))
            const id = window.setTimeout(function () {
                cb()
            }, timeToCall)
            lastTime = curTime + timeToCall
            return id
        }
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id)
        }
    }
})()

const data = { // 全局数据
    timer: null,
    directions: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'], // 八个方向
}
const utils = { // 公共方法
    range (...args) { // python中的range函数
        let start, stop, step
        switch (args.length) {
            case 1: start = 0; stop = args[0]; step = 1; break;
            case 2: [start, stop] = args; step = 1; break;
            case 3: [start, stop, step] = args; break;
            default: throw new Error('Are you okay?');
        }
        const arr = []
        for (let i = start; i < stop; i += step) { arr.push(i) }
        return arr
    },
}
new Vue({
    el: '#app',
    data: {
        hideLoading: false,
        progress: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        planes: utils.range(6).map(() => utils.range(4)), // 六面体的六个面，每个面有4个方形
    },
    watch: {},
    methods: {
        startAutoRotate (e) {
            const width = parseInt(getComputedStyle(e.target).width, 10)
            const height = parseInt(getComputedStyle(e.target).height, 10)
            this.cool(e, width, height)
            data.timer = window.requestAnimationFrame(this.startAutoRotate.bind(this, e))
        },
        stopAutoRotate  () {
            data.timer && window.cancelAnimationFrame(data.timer)
        },
        startRandomPlay () {
            const getDirection = () => Math.random() > 0.5 ? 1 : -1
            const doAction = () => {
                this.rotateX += parseInt(Math.random() * 360 * 0.5 * getDirection(), 10)
                this.rotateY += parseInt(Math.random() * 360 * 0.5 * getDirection(), 10)
                this.rotateZ += parseInt(Math.random() * 360 * 0.5 * getDirection(), 10)
            }
            doAction()
            data.timer = setInterval(doAction, 1000)
        },
        stopRandomPlay () {
            data.timer && clearInterval(data.timer)
        },
        cool (e, containerWidth, containerHeight) {
            // 说明：以可视区左上角为坐标原点，向右为x轴正方向，向上为y轴正方向，向屏幕外为z轴正方向
            const elem = e.target || e.srcElement
            // get original mouse pointer offset
            const mousePosition = {
                x: e.pageX || e.clientX + document.body.scrollLeft,
                y: e.pageY || e.clientY + document.body.scrollTop,
            }
            let mX = mousePosition.x
            let mY = 0 - mousePosition.y // 向上为y轴正方向，故立方体内的y值都是负值
            // get container-cover left top offset, width and height
            const rect = elem.getBoundingClientRect()
            const containerX = rect.left
            const containerY = 0 - rect.top
            // get mouse pointer position relative to container left top point
            mX = mX - containerX
            mY = mY - containerY
            // 以过container-cover中心点，连接该正方形四角的x形线条作为依据来判断鼠标点击的方向是上下左右中的哪个
            // 上升线段方程：y=(containerHeight / containerWidth)x - containerHeight
            // 下降线段方程：y=(0-containerHeight / containerWidth)x
            // 获取上升、下降线段的y值
            function getCompareY (x) {
                x = parseInt(x)
                return {
                    yUp: (containerHeight / containerWidth) * x - containerHeight,
                    yDown: -(containerHeight / containerWidth) * x
                }
            }
            let compareUpY = getCompareY(mX).yUp
            let compareDownY = getCompareY(mX).yDown
            // console.log(mX, mY)
            // console.log(0.5 * containerWidth, 0 - 0.5 * containerHeight)
            let distanceFromCentralCircle = parseInt(Math.sqrt(Math.pow(mX - 0.5 * containerWidth, 2) + Math.pow(mY + 0.5 * containerHeight, 2)), 10)
            let degreeStep = 2 // 每次旋转的角度数
            if (distanceFromCentralCircle < 80) {
                // 鼠标在中间半径80的圆形区域内时为rotateY形式的旋转
                // scroll by changing value of transform rotateY
                this.startTransform('scroll', degreeStep)
                return
            }
            if (mY > compareUpY) {
                if (mY > compareDownY) {
                    // rotate up
                    this.startTransform('up', degreeStep)
                    return
                }
                // rotate left
                this.startTransform('left', degreeStep)
                return
            }
            if (mY > compareDownY) {
                // rotate right
                this.startTransform('right', degreeStep)
                return
            }
            // rotate down
            this.startTransform('down', degreeStep)
        },
        startTransform (direction, degree) {
            degree = parseInt(degree, 10)
            switch (direction) {
                case 'up':
                    this.rotateX += degree
                    return
                case 'down':
                    this.rotateX -= degree
                    return
                case 'right':
                    this.rotateY += degree
                    return
                case 'left':
                    this.rotateY -= degree
                    return
                case 'scroll':
                    this.rotateZ += degree
                    return
                default:
                    return
            }
        }
    },
    mounted () {
        const img = new Image()
        img.src = './assets/magic.jpg'
        this.progress = 30
        img.onload = () => {
            this.progress = 100
            setTimeout(() => {
                this.hideLoading = true
            }, 800)
        }
    },
})
