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
        for (let i = start; i < stop; i += step) {}
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
        planes: utils.range(6), // 六面体的六个面
    },
    watch: {},
    methods: {},
    mounted () {
        data.timer = setInterval(() => { // 模拟资源加载
            const randomNum = Math.floor(20 * Math.random())
            const nextProgress = (this.progress + randomNum < 100) ? (this.progress + randomNum) : 100
            this.progress = nextProgress
            if (nextProgress >= 100) {
                clearInterval(data.timer)
                data.timer = setTimeout(() => {
                    this.hideLoading = true
                }, 800)
            }
        }, 150)
    },
})
