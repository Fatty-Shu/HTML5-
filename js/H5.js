/* 内容管理对象 */
var H5 = function() {
    this.id = ('h5_' + Math.random()).replace('.', '_');  //生成组件ID
    this.el = $('<div class="h5" id="' + this.id + '"></div>').hide(); //新建一个隐藏H5元素
    this.page = [];            //page数组，用来保存page元素
    $("body").append(this.el); //将新建的H5插入到body元素的最后。。

    /**
     * 新增一个页
     * @param {string} name 组件的名称，会加入到ClassName中
     * @param {string} text 页内的默认文本
     * @return {H5} H5对象，可以重复使用H5对象支持的方法
     */

    this.addPage = function(name, text) {
        var page = $('<div class="h5-page section"></div>');

        name != undefined && page.addClass("h5-page-" + name);
        text != undefined && page.text(text);

        this.el.append(page);
        this.page.push(page);

        if( typeof this.whenAddPage === 'function'){
            this.whenAddPage();
        }
        return this;

    }
    
    /**
     * 新建一个组件
     * @param {string} name 组件的名称
     * @param {object} cfg  组件的数据和动画选项
     * @return {object} 当前H5对象
     */
    this.addComponent = function(name, cfg) {

        var cfg = cfg || {},
            component, 
            page = this.page.slice(-1)[0];  //找到最后一个数组，也就是当前的page对象。http://www.w3school.com.cn/jsref/jsref_slice_array.asp

        cfg = $.extend({'type': 'base'}, cfg);  //如果cfg对象没有type属性，就添加一个type属性并赋值为base

        switch (cfg.type) {  //根据组件类型，返回响应的组件对象
            case 'base':
                component = new H5ComponentBase(name, cfg);
                break;
            case 'polyline':
                component = new H5ComponentPolyline(name, cfg);
                break;
            case 'pie':
                component = new H5ComponentPie(name, cfg);
                break;
            case 'bar':
                component = new H5ComponentBar(name, cfg);
                break;     
            case 'bar-v':
                component = new H5ComponentBar_v(name, cfg);
                break; 
            case 'radar':
                component = new H5ComponentRadar(name, cfg);
                break; 
            case 'circlePie':
                component = new H5ComponentCirclePie(name, cfg);
                break;  
            case 'point':
                component = new H5ComponentPoint(name, cfg);
                break; 
               
                                  
            default:
        }

        page.append(component);   //将组件添加到当前的page中

        return this;

    }

    /*H5对象初始化呈现*/

    this.loader = function(firstPage) {
        this.el.show();
        this.el.fullpage({
            onLeave: function(index, nextIndex, direction) {
                $(this).find(".h5-component").each(function(){
                    $(this).triggerHandler("onLeave");
                });
            },
            afterLoad: function(index, nextIndex, direction) {
                $(this).find(".h5-component").each(function(){
                    $(this).triggerHandler("onLoad");
                })
            }
        });
        this.page[0].find(".h5-component").each(function(){
            $(this).triggerHandler("onLoad");
        })

        if(firstPage){
            $.fn.fullpage.moveTo(firstPage);
        }
    }

    return this;

}

/**
 * 基本图文组件对象
 * @param {string} name 组件名称
 * @param {object} cfg  组件样式及动画
 */
var H5ComponentBase = function(name, cfg) {
 
    var cfg = cfg || {};
    this.Timeout = "";
    var id = ('h5_c_' + Math.random()).replace('.', '_'),
        cls = 'h5-component-' + cfg.type + ' h5-component-name-' + name;
    var component = $('<div class="h5-component ' + cls + '" id="' + id + '"></div>');

    cfg.text && component.text(cfg.text);
    cfg.width && component.width(cfg.width / 2);
    cfg.height && component.height(cfg.height / 2);
    cfg.css && component.css(cfg.css);
    cfg.bg && component.css('backgroundImage', 'url(' + cfg.bg + ')');

    if (cfg.center === true) {
        component.css({
            marginLeft: (cfg.width / 4 * -1) + 'px',
            left: '50%'
        });
    }
    
    if( typeof cfg.onclick === 'function'){
        component.bind('click',function(){
            $.fn.fullpage.moveTo(1);
        });
    }

    component.on("onLoad", function() {
     
        setTimeout(function(){
            cfg.animateIn &&component.animate(cfg.animateIn, function() {
                $(this).addClass("h5-component-" + cfg.type + "-load").removeClass("h5-component-" + cfg.type + "-leave");
            });
        },cfg.delay || 0)
 


    });

    component.on("onLeave", function() {
     
        setTimeout(function(){
           component.addClass("h5-component-" + cfg.type + "-leave").removeClass("h5-component-" + cfg.type + "-load");
           cfg.animateOut&&component.animate(cfg.animateOut);
       },cfg.delay || 0)


    });

    return component;
}

/**
 * 散点图组件
 * @param {string} name 组件名称
 * @param {object} cfg  组件样式及动画
 * @return {object} 一个散点图标组件
 */


var H5ComponentPoint = function(name, cfg) {

    var component = new H5ComponentBase(name, cfg);
    var base = cfg.data[0][1]; //以第一个数据的比例为大小的100%

    //输出每个Point

    $.each(cfg.data, function(idx, item) {

        var point = $('<div class="point "></div>'),
            per = ((item[1] / base) * 100) + '%',
            Pname = $("<div class='name'>" + item[0] + "</div>"),
            Pper = $("<div class='per'>" + (item[1] * 100) + "%</div>");
        Pname.append(Pper);
        point.append(Pname);
        point.width(per).height(per);
        item[2] && point.css("background-color", item[2]);
        point.css({
            "z-index": cfg.data.length - idx
        });
        if (item[3] != undefined && item[4] != undefined) {

            point.on("doPointAnimate", function() {
                $(this).css('right', 'unset');
                $(this).animate({
                    left: item[3],
                    top: item[4]
                })
                return false;
            })
        }

        component.append(point);

    })
    component.on("onLoad", function() {
        setTimeout(function(){
             component.addClass("h5-component-" + cfg.type + "-load").removeClass("h5-component-" + cfg.type + "-leave");
              component.find('.point ').trigger("doPointAnimate");
        },cfg.delay || 0)

    });
    component.on("onLeave", function() {
        $(this).find(".point").animate({
            left: '0',
            top: '0'
        }, function() {
            $(this).css('right', '0');
        });
            setTimeout(function(){
           component.addClass("h5-component-" + cfg.type + "-leave").removeClass("h5-component-" + cfg.type + "-load");
           cfg.animateOut&&component.animate(cfg.animateOut);
       },cfg.delay || 0)

 
    });

    return component;
}


/**
 * 水平柱图组件
 * @param {string} name 柱图名称
 * @param {object} cfg  样式及交互
 */
var H5ComponentBar = function(name, cfg) {

    var component = new H5ComponentBase(name, cfg);

    $.each(cfg.data, function(idx, item) {
        var line = $("<div class='line'></div>"),
            name = $("<div class='name'></div>").text(item[0]),
            rate = $("<div class='rate'><div class='bg'></div></div>").width(item[1] * 100 + "%"),
            per = $("<div class='per'></div>").text(item[1] * 100 + "%");
        if (item[2] != undefined) {
            rate.find('.bg').css('background-color', item[2]);
            per.css('color', item[2]);
        }
        rate.append(per);
        line.append(name).append(rate);
        component.append(line);
    })



    return component;
    //line>name rate>bg per
}

/**
 * 垂直柱图组件
 * @param {string} name 柱图名称
 * @param {object} cfg  样式及交互
 */
var H5ComponentBar_v = function(name, cfg) {

        var component = new H5ComponentBase(name, cfg);

        $.each(cfg.data, function(idx, item) {
            var line = $("<div class='line'></div>"),
                name = $("<div class='name'></div>").text(item[0]),
                rate = $("<div class='rate'><div class='bg'></div></div>").height(item[1] * 100 + "%"),
                per = $("<div class='per'></div>").text(item[1] * 100 + "%");
            if (item[2] != undefined) {
                rate.find('.bg').css('background-color', item[2]);
                per.css('color', item[2]);
            }
            rate.prepend(per);
            line.append(name).append(rate);
            component.append(line);
        })



        return component;
        //line>name rate>bg per
    }
    /**
     * 折线图组件
     * @param {string} name 折线图名称
     * @param {object} cfg  折线图样式
     */
var H5ComponentPolyline = function(name, cfg) {

    var component = new H5ComponentBase(name, cfg);

    var w = cfg.width,
        h = cfg.height;

    //加入一个画布（网格背景线）
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;

    component.append(cns);

    //水平网格线 100分--> 5份
    var step = 5;
    window.ctx = ctx; //为了方便在浏览器里面调试
    //背景
    ctx.beginPath();
    ctx.strokeStyle = "#F00";
    ctx.lineWidth = (h / step);
    ctx.strokeStyle = "#d2e2ff";
    for (var i = 0; i < step + 1; i++) {
        var y = (h / step) * i;
        i !== step && (y += ctx.lineWidth / 2);
        if (i % 2 == 0) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }

    }
    ctx.stroke();

    //水平线条线条
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#AAA";

    for (var i = 0; i < step + 1; i++) {
        var y = (h / step) * i;
        i !== step && (y += ctx.lineWidth);
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    //垂直线条
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#AAA";
    step = cfg.data.length + 1;
    PrjNameWidth = w / step;
    for (var i = 0; i < step + 1; i++) {
        var x = w / (step) * i;

        i !== step && (x += 0.5);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);

        if (cfg.data[i]) {

            var PrjName = $("<div class='prj-name'></div>").text(cfg.data[i][0]);
            PrjName.css({
                "width": PrjNameWidth,
                "marginLeft": PrjNameWidth * i / 2,
                "transition-delay": 1.5 + i * 0.4 + 's'
            });
            component.append(PrjName);
        }

    }
    ctx.stroke();


    //添加一个新的画布用来显示数据
    var cns = document.createElement('canvas'),
        ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.width = h;
    component.append(cns);

    var PolypointData = cfg.data;
    var PointW = (w / (PolypointData.length + 1));
    var draw = function(pre) {
        // 清除画布
        ctx.clearRect(0, 0, w, h);
        //开始绘制点
        ctx.beginPath();
        ctx.strokeStyle = "#f20";
        for (var i = 0; i < PolypointData.length; i++) {
            var x = PointW * i + PointW;
            var y = h * (1 - PolypointData[i][1] * pre);
            ctx.moveTo(x, y);
            ctx.arc(x, y, 5, 0, 2 * Math.PI);

        }
        ctx.fillStyle = "#f20";
        ctx.fill();

        //连接点
        ctx.moveTo(PointW, h * (1 - PolypointData[0][1] * pre));
        for (var i = 0; i < PolypointData.length; i++) {
            var x = PointW * i + PointW;
            var y = h * (1 - PolypointData[i][1] * pre);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,136,120,0)";
        ctx.fillStyle = "rgba(255,136,120,0.25)";
        ctx.lineTo(PointW * (i - 1) + PointW, h);
        ctx.lineTo(PointW, h);
        ctx.fill();
        //添加文字
        ctx.font = "18px Arial";
        for (var i = 0; i < PolypointData.length; i++) {
            var x = PointW * i + PointW;
            var y = h * (1 - PolypointData[i][1] * pre);
            PolypointData[i][2] ? ctx.fillStyle = PolypointData[i][2] : ctx.fillStyle = "#595959";
            ctx.fillText((PolypointData[i][1] * 100) + "%", x - 10, y - 18);
        }
        ctx.stroke();
    }
    draw(0)
    component.on("onLoad", function() {
        setTimeout(function(){
            cfg.animateIn &&component.animate(cfg.animateIn, function() {
                $(this).addClass("h5-component-" + cfg.type + "-load").removeClass("h5-component-" + cfg.type + "-leave");
            });
        },cfg.delay || 0);
        var s = 0;
        for (var i = 0; i < 100; i++) {
            setTimeout(function() {
                s += 0.01;
                draw(s);
            }, i * 10 + 500);
        }

    });

    component.on("onLeave", function() {
        var s = 1;
        for (var i = 0; i < 100; i++) {
            setTimeout(function() {
                s -= 0.01;
                draw(s);
            }, i * 10);
        }
    setTimeout(function(){
           component.addClass("h5-component-" + cfg.type + "-leave").removeClass("h5-component-" + cfg.type + "-load");
           cfg.animateOut&&component.animate(cfg.animateOut);
       },cfg.delay || 0)
    });
    return component;
    //line>name rate>bg per
}


/**
 * 雷达图组件
 * @param {string} name 柱图名称
 * @param {object} cfg  样式及交互
 * 定点坐标
 */
var H5ComponentRadar = function(name, cfg) {

    var component = new H5ComponentBase(name, cfg);


    var w = cfg.width,
        h = cfg.height;
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;

    component.append(cns);


    var r = w / 2;
    var radarData = cfg.data;
    var step = radarData.length;


    //计算多边形的顶点坐标
    //X坐标 = a + Math.sin(rad) *r ; 
    //y坐标 = b+ Math.cos(rad) *r; 
    //rad = (2*Math.PI/360)*(360 / step ) *i ;
    //已知：圆心坐标（a,b）、半径 r ;角度 deg
    //绘制交替背景
    var isBlue = false;
    for (var j = 5; j > 0; j--) {
        ctx.beginPath();
        ctx.fillStyle = (isBlue = !isBlue) ? "#99c0ff" : "#f1f9ff";
        ctx.strokeStyle = ctx.fillStyle;
        for (var i = 0; i < step; i++) {
            var rad = (2 * Math.PI / 360) * (360 / step) * i;
            var x = r + Math.sin(rad) * r * (j / 5);
            var y = r + Math.cos(rad) * r * (j / 5);

            ctx.lineTo(x, y);

        }

        ctx.fill();
        ctx.closePath();
        ctx.stroke();
    }
    //绘制伞骨
    ctx.beginPath();
    ctx.strokeStyle = "#e1e1e1";
    for (var i = 0; i < step; i++) {
        var rad = (2 * Math.PI / 360) * (360 / step) * i;
        var x = r + Math.sin(rad) * r;
        var y = r + Math.cos(rad) * r;
        var text = $("<div class='text'></div>").text(radarData[i][0]);
        ctx.moveTo(r, r);
        ctx.lineTo(x, y);
        (x < w / 2) ? text.css('right', (w - x) / 2) : text.css('left', x / 2);
        (y < h / 2) ? text.css('bottom', (h - y) / 2) : text.css('top', y / 2);

        component.append(text);


    }
    ctx.stroke();


    //数据层
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;
    component.append(cns);

    var draw = function(pre) {
        //绘制线条
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ff7676";
        for (var i = 0; i < step; i++) {
            var rad = (2 * Math.PI / 360) * (360 / step) * i;
            var x = r + Math.sin(rad) * r * radarData[i][1] * pre;
            var y = r + Math.cos(rad) * r * radarData[i][1] * pre;
            ctx.lineTo(x, y);

        }
        ctx.closePath();
        ctx.stroke();

        //绘制圆点
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ff7676";
        ctx.fillStyle = "#ff7676";
        component.find(".rate").remove();
        if (pre > 0.98) {
            for (var i = 0; i < step; i++) {
                var rad = (2 * Math.PI / 360) * (360 / step) * i;
                var x = r + Math.sin(rad) * r * radarData[i][1] * pre;
                var y = r + Math.cos(rad) * r * radarData[i][1] * pre;
                ctx.moveTo(x, y);
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
                var rate = $("<div class='rate'></div>").text(radarData[i][1] * 100 + "%");
                (x < w / 2) ? rate.css('right', (w - x) / 2 - 30) : rate.css('left', x / 2 - 30);
                (y < h / 2) ? rate.css('bottom', (h - y) / 2 - 0) : rate.css('top', y / 2 - 10);

                component.append(rate);

            }
        }

        ctx.stroke();
    }
    draw(0)
    component.on("onLoad", function() {
        setTimeout(function(){
            cfg.animateIn &&component.animate(cfg.animateIn, function() {
                $(this).addClass("h5-component-" + cfg.type + "-load").removeClass("h5-component-" + cfg.type + "-leave");
            });
        },cfg.delay || 0)
        var s = 0;
        for (var i = 0; i < 100; i++) {
            setTimeout(function() {
                s += 0.01;
                draw(s);
            }, i * 10 + 500);
        }
    });

    component.on("onLeave", function() {
        var s = 1;
        for (var i = 0; i < 100; i++) {
            setTimeout(function() {
                s -= 0.01;
                draw(s);
            }, i * 10);
        }
    setTimeout(function(){
           component.addClass("h5-component-" + cfg.type + "-leave").removeClass("h5-component-" + cfg.type + "-load");
           cfg.animateOut&&component.animate(cfg.animateOut);
       },cfg.delay || 0)
    });


    return component;
    //line>name rate>bg per
}

/**
 * 饼图
 * @param {string} name 柱图名称
 * @param {object} cfg  样式及交互
 * 定点坐标
 */
var H5ComponentPie = function(name, cfg) {

    var component = new H5ComponentBase(name, cfg);


    var w = cfg.width,
        h = cfg.height;
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    var cnsBg = document.createElement('canvas');
    var ctxBg = cnsBg.getContext('2d');
    cnsBg.width = cns.width = ctx.width = w;
    cnsBg.height = cns.height = ctx.height = h;

    component.append(cnsBg);
    component.append(cns);
    var r = w / 2;
    var pieData = cfg.data;
    var step = pieData.length;

    //计算多边形的顶点坐标
    //X坐标 = a + Math.sin(rad) *r ; 
    //y坐标 = b+ Math.cos(rad) *r; 
    //rad = (2*Math.PI/360)*(360 / step ) *i ;
    //已知：圆心坐标（a,b）、半径 r ;角度 deg
    //绘制交替背景
    ctxBg.beginPath();
    ctxBg.fillStyle = "#ececec";
    ctxBg.lineWidth = 0;
    ctxBg.strokeStyle = "#ececec";
    ctxBg.moveTo(r, r);
    ctxBg.arc(r, r, r - 1, 0, 2 * Math.PI);

    ctxBg.fill();
    ctxBg.closePath();
    ctxBg.stroke();

    var draw = function(per) {
        var radbegin = -0.5 * Math.PI;
        var radend = -0.5 * Math.PI;
        if (per === 0) {

            ctx.clearRect(0, 0, w, h);
            return false;
        }
        per /= 100;
        ctx.clearRect(0, 0, w, h);
        var maxAngle = 2 * Math.PI * per - 0.5 * Math.PI;
        for (var i = 0; i < step; i++) {
            ctx.beginPath();
            ctx.fillStyle = pieData[i][2];
            ctx.lineWidth = 0;
            ctx.strokeStyle = ctx.fillStyle;
            radend += (2 * Math.PI * (pieData[i][1] / 1));
            radend > maxAngle && (radend = maxAngle);
            ctx.moveTo(r, r);
            ctx.arc(r, r, r - 1, radbegin, radend);

            ctx.fill();
            ctx.closePath();
            ctx.stroke();
            if (per === 1) {
                var x = r + Math.sin(radbegin + (radend - radbegin) / 2) * r;
                var y = r + Math.cos(radbegin + (radend - radbegin) / 2) * r;
                var lineDiv = $('<div class="line"></div>');

                lineDiv.css({
                    top: x / 2,
                    "border-color": pieData[i][2],
                    "color": pieData[i][2]
                });
                lineDiv.html("<span>" + pieData[i][0] + "<br>" + (pieData[i][1] * 100) + "% </span> ");
                if (y > (w / 2)) {
                    lineDiv.css({
                        "left": y / 2
                    });
                } else {
                    lineDiv.css({
                        "right": (w - y) / 2
                    });
                }
                if (x < w / 2) {
                    lineDiv.find("span").addClass('top');
                }

                component.append(lineDiv);
            }
            if (radend == maxAngle) break;
            radend < maxAngle && (radbegin = radend);
        }
    }




    draw(0);
    component.on("onLoad", function() {
        setTimeout(function(){
                component.addClass("h5-component-" + cfg.type + "-load").removeClass("h5-component-" + cfg.type + "-leave");
        },cfg.delay || 0)
        var s = 0;
        for (var i = 0; i < 100; i++) {
            setTimeout(function() {
                s += 1;
                draw(s);
            }, i * 10 + 500);
        }
    });

    component.on("onLeave", function() {
        var s = 100;
        for (var i = 0; i < 100; i++) {
            setTimeout(function() {
                s -= 1;
                draw(s);
            }, i * 10);
        }
        $(this).find('.line').remove();
                setTimeout(function(){
           component.addClass("h5-component-" + cfg.type + "-leave").removeClass("h5-component-" + cfg.type + "-load");
           cfg.animateOut&&component.animate(cfg.animateOut);
       },cfg.delay || 0)
    });






    return component;
    //line>name rate>bg per
}

var H5ComponentCirclePie = function(name, cfg) {

    var component = new H5ComponentBase(name, cfg);


    var w = cfg.width,
        h = cfg.height;
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
 
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;


    component.append(cns);
    var r = w / 2;



    var title = $("<div class='title'>").html(cfg.data[0]+'<br>'+(cfg.data[1]*100+'%'));
    title.css({color:cfg.data[2]})
    component.append(title);
    function  draw(pre){
       ctx.clearRect(0,0,w,h);
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.lineWidth = w*0.05;
        ctx.strokeStyle = "#ececec";
        ctx.arc(r, r, r-w*0.05 , 0, 2 * Math.PI);

        ctx.fill();
        ctx.closePath();
        ctx.stroke();
         pre/=100;
        var radbegin = -0.5 * Math.PI;
        var radend = -0.5 * Math.PI + pre*cfg.data[1]*2*Math.PI;

     
        ctx.beginPath();

        ctx.lineWidth = w*0.05;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ec7374";
        ctx.arc(r, r, r-w*0.05 , radbegin, radend);
        ctx.stroke();   

    }


   draw(0);
    component.on("onLoad", function() {
        setTimeout(function(){
            cfg.animateIn &&component.animate(cfg.animateIn, function() {
                $(this).addClass("h5-component-" + cfg.type + "-load").removeClass("h5-component-" + cfg.type + "-leave");
            });
        },cfg.delay || 0)
        var s = 0;
        for (var i = 0; i < 50; i++) {
            setTimeout(function() {
                s += 2;
                draw(s);
            }, i * 10 + 500);
        }
    });

    component.on("onLeave", function() {
        var s = 100;
        for (var i = 0; i < 50; i++) {
            setTimeout(function() {
                s -= 2;
                draw(s);
            }, i * 10);
        }
        $(this).find('.line').remove();
                setTimeout(function(){
           component.addClass("h5-component-" + cfg.type + "-leave").removeClass("h5-component-" + cfg.type + "-load");
           cfg.animateOut&&component.animate(cfg.animateOut);
       },cfg.delay || 0)
    });

    return component;
    //line>name rate>bg per

}