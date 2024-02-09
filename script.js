let interval; // 将 interval 变量定义在外部，以便在 updateCountdown 函数内部访问

// 粒子类定义
class Particle {
    // 粒子构造函数
    constructor(x, y, radius, color, velocity, decay, gravity) {
        this.x = x; // 粒子的x坐标
        this.y = y; // 粒子的y坐标
        this.radius = radius; // 粒子的半径
        this.color = color; // 粒子的颜色
        this.velocity = velocity; // 粒子的速度对象，包含x和y方向的速度
        this.decay = decay || 0.015; // 粒子的衰减速率，默认值为0.015
        this.alpha = 1; // 粒子的透明度，初始值为1
        this.gravity = gravity || 0.05; // 粒子受到的重力加速度，默认值为0.05
    }

    // 绘制粒子的方法
    draw() {
        ctx.save(); // 保存当前绘图状态
        ctx.globalAlpha = this.alpha; // 设置绘图透明度
        ctx.beginPath(); // 开始绘制
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); // 绘制圆形粒子
        ctx.fillStyle = this.color; // 设置填充颜色
        ctx.fill(); // 填充颜色
        ctx.restore(); // 恢复之前保存的绘图状态
    }

    // 更新粒子状态的方法
    update() {
        this.velocity.y += this.gravity; // 应用重力，使粒子下降
        this.x += this.velocity.x; // 更新粒子的x坐标
        this.y += this.velocity.y; // 更新粒子的y坐标
        this.alpha -= this.decay; // 更新粒子的透明度
        if (this.alpha <= this.decay) {
            this.alpha = 0; // 当透明度小于衰减速率时，将透明度设置为0
        }
        this.draw(); // 绘制更新后的粒子
    }

    // 判断粒子是否仍然存活（透明度大于0）
    isAlive() {
        return this.alpha > 0;
    }
}

// 烟花类定义
class Firework {
    // 烟花构造函数
    constructor(x, y, color, riseSpeed = -1, particleSize = 2) {
        this.x = x; // 烟花的x坐标
        this.y = y; // 烟花的y坐标
        this.color = color; // 烟花的颜色
        this.riseSpeed = riseSpeed; // 烟花上升速度
        this.particleSize = particleSize; // 爆炸后生成的粒子大小
        this.particles = []; // 存储爆炸后生成的粒子数组
        this.exploded = false; // 标记烟花是否已经爆炸
        this.velocity = { x: Math.random() * 2 - 1, y: this.riseSpeed }; // 烟花的速度，x轴速度模拟风
    }

    // 烟花爆炸方法
    explode() {
        const particleCount = 200 + Math.random() * 1000; // 确定爆炸生成的粒子数量
        for (let i = 0; i < particleCount; i++) {
            const speed = Math.random() * 5 + 2; // 粒子速度
            const decay = Math.random() * 0.04 + 0.01; // 粒子衰减速率
            const gravity = Math.random() * 0.05 + 0.03; // 粒子重力加速度
            // 创建新粒子并添加到粒子数组中
            this.particles.push(new Particle(this.x, this.y, this.particleSize, `hsl(${Math.random() * 360}, 100%, 50%)`, {
                x: Math.cos(Math.PI * 2 * i / particleCount) * speed,
                y: Math.sin(Math.PI * 2 * i / particleCount) * speed
            }, decay, gravity));
        }
    }

    // 更新烟花状态的方法
    update() {
        if (!this.exploded) {
            this.y += this.velocity.y; // 更新烟花的y坐标，使其上升
            this.x += this.velocity.x; // 更新烟花的x坐标，模拟风效果
            this.draw(); // 绘制上升中的烟花

             // 通过增加随机性来调整爆炸高度
        const explodeHeight = canvas.height * (0.5 + Math.random() * 0.3); // 示例：最低高度为画布高度的 50%，最高为 80%
            if (this.y < explodeHeight) {
                this.exploded = true;
                this.explode();
            }
        } else {
            // 更新所有粒子的状态，并移除已经“死亡”的粒子
            this.particles = this.particles.filter(p => p.isAlive());
            this.particles.forEach(p => p.update());
        }
    }

    // 绘制上升中的烟花方法
    draw() {
        ctx.save(); // 保存当前绘图状态
        ctx.globalAlpha = 1; // 设置绘图透明度为不透明
        ctx.beginPath(); // 开始绘制
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false); // 绘制表示烟花的小圆点
        ctx.fillStyle = this.color; // 设置填充颜色
        ctx.fill(); // 填充颜色
        ctx.restore(); // 恢复之前保存的绘图状态
    }
}

// 获取canvas元素并设置其宽高
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = []; // 存储所有烟花的数组
let isLaunching = false; // 标记是否正在启动烟花

// 动画循环函数，用于不断更新画布上的内容
function animate() {
    requestAnimationFrame(animate); // 请求下一帧动画
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 设置画布覆盖颜色（用于创建尾迹效果）
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 覆盖整个画布

    // 遍历所有烟花，更新它们的状态，并在必要时将它们从数组中移除
    fireworks.forEach((firework, index) => {
        firework.update();
        if (firework.exploded && firework.particles.length === 0) {
            fireworks.splice(index, 1); // 移除已经爆炸且粒子消失的烟花
        }
    });
}

// 创建新烟花的函数，用于在画布上添加新的烟花
function createFirework() {
    const x = Math.random() * canvas.width; // 在画布宽度范围内随机选择x坐标
    const y = canvas.height; // y坐标设置为画布底部
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`; // 随机选择颜色
    const riseSpeed = -Math.random() * 8 + 1; // 随机生成上升速度
    const particleSize = Math.random() * 3 + 2; // 随机生成粒子大小
    // 创建新的烟花并添加到烟花数组中
    fireworks.push(new Firework(x, y, color, riseSpeed, particleSize));
}

// 触发烟花效果的函数
function triggerFireworks(fireworksCount = 50, intervalDuration = 1000) {
    if (isLaunching) return; // 如果已经在启动烟花，则直接返回
    isLaunching = true; // 标记正在启动烟花

    for (let i = 0; i < fireworksCount; i++) {
        setTimeout(createFirework, i * (intervalDuration / fireworksCount));
    }

    // 在一定时间后重置 isLaunching 标记，以便可以再次触发烟花
    setTimeout(() => {
        isLaunching = false;
    }, intervalDuration);
}

// 为预览按钮添加点击事件监听器，用于测试烟花效果
document.getElementById('previewButton').addEventListener('click', () => triggerFireworks(50, 5000));

const countdownElement = document.getElementById('countdown');
// 设置目标日期为2024年2月9日23:59:59
const targetDate = new Date('2024-02-09T23:59:59').getTime();

// 更新倒计时的函数
function updateCountdown() {
    const now = new Date().getTime(); // 获取当前时间
    const distance = targetDate - now; // 计算目标日期与当前日期的差距（毫秒）

    // 将时间差转换为天、小时、分钟和秒
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // 更新页面上的倒计时显示
    countdownElement.innerHTML = `距离新年还有：${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`;

    // 如果时间差小于0，说明目标日期已经到达
    if (distance < 0) {
        clearInterval(interval); // 停止倒计时
        countdownElement.style.display = 'none'; // 隐藏倒计时元素
        triggerFireworks(100, 10000); // 触发烟花效果，参数分别表示烟花数量和持续时间（毫秒）
    }
}

// 使用 setInterval 每秒调用一次 updateCountdown 函数，以更新倒计时
interval = setInterval(updateCountdown, 1000);

// 触发烟花效果的函数，参数为烟花数量和烟花展示的总时长（毫秒）
function triggerFireworks(fireworksCount = 50, intervalDuration = 1000) {
    if (isLaunching) return; // 如果烟花已经在触发中，则不再触发
    isLaunching = true; // 标记烟花开始触发

    for (let i = 0; i < fireworksCount; i++) {
        // 以间隔平均分布的方式触发每个烟花
        setTimeout(createFirework, i * (intervalDuration / fireworksCount));
    }

    // 一段时间后重置触发标记，允许再次触发烟花
    setTimeout(() => {
        isLaunching = false;
    }, intervalDuration);
}

// 为预览按钮添加点击事件，点击时触发烟花效果
document.getElementById('previewButton').addEventListener('click', () => triggerFireworks(50, 5000));
