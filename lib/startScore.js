function scoreFun(object, opts){
    var defaults = {fen_d:16,
                    ScoreGrade:10,
                    parent:"scoreStar_class"};
    options = $.extend({}, defaults,opts);
    var startParent = object.find("."+options.parent);
    var now_cli;
    var fen_cli;
    var fen_d = options.fen_d;
    var len = options.ScoreGrade;
    startParent.width(fen_d * len);
    var preA = (5 / len);
    for(var i = 0;i < len;i++){
        var newSpan = $("<a href='javascript:void(0)'></a>");
        newSpan.css({"left":0, "width":fen_d * (i + 1), "z-index":len - i});
        newSpan.appendTo(startParent);
    }
    startParent.find("a").each(function(index, element){
        $(this).click(function(){
            now_cli = index;
            show(index, $(this));
        });
        $(this).mouseenter(function(){
            show(index, $(this));
        });
        $(this).mouseleave(function(){
            if(now_cli >= 0){
                var scor = preA * (parseInt(now_cli) + 1);//分数------------------------
				scoreInfo=scor;
                startParent.find("a").removeClass("clibg");
                startParent.find("a").eq(now_cli).addClass("clibg");
                var ww = fen_d * (parseInt(now_cli) + 1);
                startParent.find("a").eq(now_cli).css({"width":ww,"left":"0"});
            }else{
                startParent.find("a").removeClass("clibg");
            }
        });
    });
    function show(num, obj){
        var n = parseInt(num) + 1;
        var lefta = num * fen_d;
        var ww = fen_d * n;
        var scor = preA * n;
        object.find("a").removeClass("clibg");
        obj.addClass("clibg");
        obj.css({"width":ww, "left":"0"});
    }
};
