(function() {

  // 'use strict'//不用严格模式了，挠头

  const appid = '61e6f939f80c51a4'
  const key = '1hEDEyzZR3szeIDXWAPjPbUbWryoFWXK'

  var timer = null
  var temp = ''
  var textInfo = '' 		//用于获取划取内容
  var inlinetext = ''		//当前划取内容
  var switchInfo = '' 		//用于获取替换的内容
  var Translations =''		//保存从数据库获取的数据
  var Historied=0;
  var checkedValue=0;
  var selected = 0;
  var scoreInfo = '';		//用于获取分数内容

  //这里定义了create函数用于封装生成的标签，后面会大量使用
  var create = function(obj) {
    var o = document.createElement(obj.lable);
		// var label = "<"+obj.lable+" class='"+obj.calss+"' id='"+obj.id+"' name='"+obj.name+"' ></"+obj.lable+">";
		if(obj.parent){
			obj.parent.appendChild(o);
		}
		if(obj.class){
			var n = obj.class.split(' ');
			for(x in n){
				o.classList.add(n[x]);
			}
		}
    var sum = 0
    for (x in obj) {
      o[x] = obj[x];
      sum++;
    }
    for (let i = 0; i < sum; i++) { //为了绑定多个事件，总感觉很丑
      if (obj['action' + i]) { //绑定事件
        o.addEventListener(obj['action' + i], obj['func' + i]);
      }
    }
    return o
  }

  //翻译内容窗体
  var translator = create({
    lable: 'div',
    id: 'translator_alert',
    name: 'translator_alert',
    parent: document.body,
    action0: 'mouseover',
    func0: function() {
      window.clearTimeout(timer)
    },
    action1: 'mouseout',
    func1: setRemove,
  })
  //'更多'按钮
  var btnMore = create({
    lable: 'div',
    id: 'btnMore',
    name: 'btnMore',
    parent: translator,
    innerHTML: '更多',
  	action0: 'click',
  	func0: function(){
  		translator.style.display = 'none';
  		//向服务器请求数据
  		$('#request_word').val(textInfo);
  		sub_request();
  		//创建选项页面
  		if($('#transOptions')){
  			$('#transOptions').remove();
  			selected=0;
  		}
  		createOptionPage();
  	}
  })
  //单词
  var transWords = create({
    lable: 'div',
    id: 'transWords',
    name: 'transWords',
    parent: translator,
  })
  //英音标
  var yinbiaoEng = create({
    lable: 'div',
    id: 'yinbiaoEng',
    name: 'yinbiaoEng',
    parent: translator,
  })
  //美音标
  var yinbiaoUsa = create({
    lable: 'div',
    id: 'yinbiaoUsa',
    name: 'yinbiaoUsa',
    parent: translator,
  })
  //释义
  var translateText = create({
    lable: 'div',
    id: 'translateText',
    name: 'translateText',
    parent: translator,
  })
  var requestForm = create({
		lable: 'form',
		id: 'requestForm',
		type:'hidden',
		parent: translator,
	})
  var request_word = create({
		lable: 'input',
		id: 'request_word',
		name:'request_word',
		type: 'hidden',
		parent: requestForm,
	})
  //定时器
  function setRemove() {
    timer = setTimeout(function() {
      translator.style.display = 'none'
    }, 3000)
  }



  document.onmousemove = function(){
    if (window.getSelection().toString()&&!selected) {
      if(document.getElementById('transsurroundlabel')){//如果之前已经有替换过单词，删除原标签
        $("#transsurroundlabel").each(function(){
          var xx=$(this).html();
          $(this).replaceWith(xx);
        });
      }
    }
  }
  // 鼠标抬起时翻译
  document.onmouseup = function(e) {
    inlinetext = window.getSelection().toString()

    if (!inlinetext||selected) {
      translator.style.display = 'none'
      return
    }
  	textInfo = inlinetext;
  	//创建替换标签
  	if (window.getSelection().toString()&&!selected) {//如果有选中内容
  		//初始化
  		switchInfo = '';
  		scoreInfo = '';
  		Translations ='';
  		Historied=queryHistory();
  		var r = window.getSelection().getRangeAt(0);
        var transsurroundlabel = create({
    			lable: 'translate',
    			id: 'transsurroundlabel',
    		});
    		r.surroundContents(transsurroundlabel);
    		r.collapse(false);
  	}else{
  			//document.getElementById('transsurroundlabel').innerHTML=temp;
  			//translator.style.display = 'none';
  	}

    //定位
    //这里要注意一下，client事件只有在鼠标事件时才能get到
    var e = window.event
    var scrollx = window.scrollX || document.documentElement.scrollLeft
    var scrolly = window.scrollY || document.documentElement.scrollTop
    var x = parseFloat(e.clientX) + parseFloat(scrollx)
    var y = parseFloat(e.clientY)
    translator.style.left = x + 'px'
    translator.style.top = y + 'px'
    translator.style.display = 'block'
    translateText.innerHTML = 'loading...'

    //clear
    window.clearTimeout(timer)
    setRemove()

    // 查询
    queryText(textInfo).then(function(data) {
      transWords.style.display = 'none'
      yinbiaoEng.style.display = 'none'
      yinbiaoUsa.style.display = 'none'
      if (data.translation) {
        if (data['basic']) {
          transWords.style.display = 'block'
          transWords.innerHTML = textInfo
          if (data['basic']['uk-phonetic']) {
            yinbiaoEng.style.display = 'inline-block'
            yinbiaoUsa.style.display = 'inline-block'
            yinbiaoEng.innerHTML = '英[' + data['basic']['uk-phonetic'] + ']'
            yinbiaoUsa.innerHTML = '美[' + data['basic']['us-phonetic'] + ']'
          }
          translateText.innerHTML = data['basic']['explains'].map(function(item) {
            return item.replace(/(^\s*)/g, '')
          }).join('<br>')
        } else {
          translateText.innerHTML = data['translation'].map(function(item) {
            return item.replace(/(^\s*)/g, '')
          }).join('<br>')
        }

      } else {
        translateText.innerHTML = '翻译失败'
      }

    })
  }

  // 翻译主函数
  function queryText(query) {

    var salt = Math.floor(Math.random() * 10000000).toString() //随机数salt
    var isEnglish = /^[A-Za-z]+$/.test(
      query.replace(/\s*/, '')
      .charAt(0)
    )

    var data = {
      q: query.split('\n').join('%0A'),
      from: isEnglish ? 'en' : 'zh',
      to: isEnglish ? 'zh' : 'en',
      appKey: appid,
      salt: salt,
      sign: md5(appid + query + salt + key)
    }

    var url = 'https://openapi.youdao.com/api/?' +
      Object.keys(data).map(function(key) {
        return key + '=' + data[key] + '&'
      }).join('')
    return fetch(url).then(function(res) {
      return res.json()
    })

  }


  //向数据库添加一条用户自定义译文
  //翻译表单的格式为{user_defined_word="word"&user_defined_translation="translation"},以good，好的为例，即为{user_defined_word=good&user_defined_translation=好的};
  //具体使用参数为textInfo，switchInfo
  //当回车提交时调用
  function sub_newTrans() {
	$.ajax({
      type: "POST",
      url: "http://10.18.155.49:8082/Sites/insert.php",
      dataType: 'text',
	  async: false,
      data: $('#transForm').serialize(),
      error: function(data) {
        alert(data)
      },
      success: function(data) {
        alert("成功")
      }
    })
  }

  //向数据库添加一条用户对译文的评分
  //分数表单的格式为{user_defined_word="word"&user_defined_translation="translation"&user_defined_score="score"},以good，好的,5分为例，即为{user_defined_word=good&user_defined_translation=好的&user_defined_score=5};
  //具体使用参数为textInfo，switchInfo，scoreInfo
  //当点击”替换“时调用
  function sub_newScore() {
	$.ajax({
      type: "POST",
      url: "http://10.18.155.49:8082/Sites/update.php",
      dataType: 'text',
	    async: false,
      data: $('#scoreForm').serialize(),
      error: function(data) {
        alert(data)
      },
      success: function(data) {
        alert("成功")
      }
    })
  }
  //从数据库获取当前单词的译文数据
  //请求表单的格式为{user_defined_word="word"},以good为例，即为{user_defined_word=good};
  //具体使用参数为textInfo
  //当点击'更多'按钮时调用
  function sub_request() {
	  console.log($('#request_word').val());
  	$.ajax({
        type: "POST",
        url: "http://10.18.155.49:8082/Sites/withdraw.php",
        dataType: 'text',
  	    async: false,
        data: $('#requestForm').serialize(),
        error: function(data) {
          // alert(data)
          alert('连接服务器失败！将给您展示插件自带的demo数据');
          Translations=[{"trans":"123","star":"5","num":"1"},
          {"trans":"\u54c8\u6bd4","star":"5","num":"1"},
          {"trans":"\u82f9\u679c","star":"4.7","num":"5"},
          {"trans":"shabi","star":"4","num":"2"},
          {"trans":"\u54c8\u76ae","star":"0","num":"0"}];
        },
        success: function(data) {
          alert("成功");
  		    Translations=JSON.parse(data);
        }
      })
  }


  function createOptionPage(){
  //整个窗口容器定义
    selected=1;
	var transOptions = create({
		lable: 'div',
		id: 'transOptions',
		name: 'transOptions',
		parent: document.body,
	})
	// var scrolly = window.scrollY || document.documentElement.scrollTop;
	// transOptions.style.top=scrolly+200+'px';
  // $(document.body).scroll(function() {
  //   transOptions.style.top=scrolly+200+'px';
  // });
	//菜单栏
	var optionMenu = create({
		lable: 'div',
		class: 'optionMenu_class',
		parent: transOptions,
	})
  var closeBtn = create({
    lable: 'div',
    class: 'closeBtn',
    parent: optionMenu,
    innerHTML: 'X',
    action0:'click',
    func0:closeAll,
  })
	var menuUL = create({
		lable: 'ul',
		parent: optionMenu,
	})
	var menuLi1 = create({
		lable: 'li',
		innerHTML: '更多释义',
		parent: menuUL,
	})
	var menuLi2 = create({
		lable: 'li',
		innerHTML: '关于',
		parent: menuUL,
	})
	//信息栏
	var optionInfo = create({
		lable: 'div',
		class: 'optionInfo_class',
		parent: transOptions,
	})
	//‘更多释义’页面
	var optionsPage1 = create({
		lable: 'div',
		class: 'optionsPage_class',
		id: 'optionsPage1',
		parent: optionInfo,
	})
	//评分表单，用于提交评分 包含单词、释义、评分
	var scoreForm = create({
		lable: 'form',
		id: 'scoreForm',
		type:'hidden',
		parent: optionsPage1,
	})
	var score_sub_word = create({
		lable: 'input',
		id: 'score_sub_word',
		name:'score_sub_word',
		type: 'hidden',
		parent: scoreForm,
	})
	var score_sub_trans = create({
		lable: 'input',
		id: 'score_sub_trans',
		name:'score_sub_trans',
		type: 'hidden',
		parent: scoreForm,
	})
	var score_sub_score = create({
		lable: 'input',
		id: 'score_sub_score',
		name:'score_sub_score',
		type: 'hidden',
		parent: scoreForm,
	})
	//译文表单，用于提交自定义译文 包含单词、释义
	var transForm = create({
		lable: 'form',
		id: 'transForm',
		type:'hidden',
		parent: optionsPage1,
	})
  $('#transForm').submit(function(){
		return false;
	})
	//提交的单词
	var trans_sub_word = create({
		lable: 'input',
		id: 'trans_sub_word',
		name:'trans_sub_word',
		type: 'hidden',
		parent: transForm,
	})
	//提交的释义
	var trans_sub_trans = create({
		lable: 'input',
		id: 'trans_sub_trans',
		name:'trans_sub_trans',
		type: 'hidden',
		parent: transForm,
	})
	//当前页面释义一
	var transLine1 = create({
		lable: 'div',
		class: 'transLine_class',
		parent: transForm,
	})
	//包含释义及评分的块
	var transBlock1 = create({
		lable: 'div',
		class: 'starBlock_class starClearfix_class',
		id: 'transBlock1',
		parent: transLine1,
	})
	//释义
	var transText1 = create({
		lable: 'span',
		id: 'transText1',
		parent: transBlock1,
	})
	//分数
	var transScore1 = create({
		lable: 'div',
		class: 'scoreStar_class',
		id: 'transScore1',
		parent: transBlock1,
	})
	//选择按钮标签
	var selectRadio1 = create({
		lable: 'label',
		class: 'selectRadio_class',
		parent: transLine1,
	})
	//选择按钮(隐藏)
	//原本的radio样式不好看，所以用一个自定义的i标签来替换它，但是i标签没有radio的监听事件，因此把原radio标签和i标签绑定来完成功能
	var selectRadio1_hide = create({
		lable: 'input',
		id:'selectRadio1_hide',
		type: 'radio',
		name: 'selectRadio',
		value: '1',
		checked: 'checked',
		parent: selectRadio1,
	})
	//选择按钮(替换上面被隐藏的选择按钮以修改其样式)
	var selectRadio1_show = create({
		lable: 'i',
		parent: selectRadio1,
	})
	//当前页面释义二
	var transLine2 = create({
		lable: 'div',
		class: 'transLine_class',
		parent: transForm,
	})
	//包含释义及评分的块
	var transBlock2 = create({
		lable: 'div',
		class: 'starBlock_class starClearfix_class',
		id: 'transBlock2',
		parent: transLine2,
	})
	//释义
	var transText2 = create({
		lable: 'span',
		id: 'transText2',
		parent: transBlock2,
	})
	//分数
	var transScore2 = create({
		lable: 'div',
		class: 'scoreStar_class',
		id: 'transScore2',
		parent: transBlock2,
	})
	//选择按钮标签
	var selectRadio2 = create({
		lable: 'label',
		class: 'selectRadio_class',
		parent: transLine2,
	})
	//选择按钮(隐藏)
	var selectRadio2_hide = create({
		lable: 'input',
		type: 'radio',
		name: 'selectRadio',
		value: '2',
		parent: selectRadio2,
	})
	//选择按钮(替换上面被隐藏的选择按钮以修改其样式)
	var selectRadio2_show = create({
		lable: 'i',
		parent: selectRadio2,
	})
	//当前页面释义三
	var transLine3 = create({
		lable: 'div',
		class: 'transLine_class',
		parent: transForm,
	})
	//包含释义及评分的块
	var transBlock3 = create({
		lable: 'div',
		class: 'starBlock_class starClearfix_class',
		id: 'transBlock3',
		parent: transLine3,
	})
	//释义
	var transText3 = create({
		lable: 'span',
		id: 'transText3',
		parent: transBlock3,
	})
	//分数
	var transScore3 = create({
		lable: 'div',
		class: 'scoreStar_class',
		id: 'transScore3',
		parent: transBlock3,
	})
	//选择按钮标签
	var selectRadio3 = create({
		lable: 'label',
		class: 'selectRadio_class',
		parent: transLine3,
	})
	//选择按钮(隐藏)
	var selectRadio3_hide = create({
		lable: 'input',
		type: 'radio',
		name: 'selectRadio',
		value: '3',
		parent: selectRadio3,
	})
	//选择按钮(替换上面被隐藏的选择按钮以修改其样式)
	var selectRadio3_show = create({
		lable: 'i',
		parent: selectRadio3,
	})
	var changePage = create({
		lable: 'div',
		class: 'changePageLine',
		parent: transForm,
	})
	//'上一页'按钮
	var prePage = create({
		lable: 'div',
		id: 'prePage',
		name: 'prePage',
		parent: changePage,
		innerHTML:'上一页',
		action0: 'click',
		func0: goPrePage
	})
	//'下一页'按钮
	var nextPage = create({
		lable: 'div',
		id: 'nextPage',
		name: 'nextPage',
		parent: changePage,
		innerHTML:'下一页',
		action0: 'click',
		func0: goNextPage
	})
	//'提交译文'控件
	var submitText = create({
		lable: 'div',
		id: 'submitText',
		parent: transForm,
	})
	//’提交译文‘按钮
	var submitInfo = create({
		lable: 'span',
		id: 'showSubmitArea',
		innerHTML: '提交译文',
		parent: submitText,
	})
	//输入框
	var submitArea = create({
		lable: 'textarea',
		id: 'submitArea',
		placeholder: '您可以在此输入您想要提供的译文/按回车键提交',
		parent: submitText,
	})
	//transForm表单的提交对象
	var formSubmitter = create({
		lable: 'input',
		type: 'submit',
		id: 'formSubmitter',
		value: '提交',
		parent: transForm,
		action0:"click",
		func0:sub_newTrans,
	})
	//‘关于’页面
	var optionsPage2 = create({
		lable: 'div',
		class: 'optionsPage_class',
		id: 'optionsPage2',
		innerHTML: '基于有道翻译API的chrome翻译插件',
		parent: optionInfo,
	})

	//'替换文本'按钮
	var btnSwitch = create({
		lable: 'button',
		id: 'btnSwitch',
		name: 'btnSwitch',
		parent: optionsPage1,
		innerHTML:'替换',
		action0: 'click',
		func0: replaceAndSubmit,
	})

	//记录当前释义位置
	var transIndex = 0;
	//读入释义
	refreshTranspage(0);

	//导航栏和信息栏绑定
	$('.optionMenu_class li').eq(0).css({
		'border-bottom': 'none'
	});
	$('.optionInfo_class .optionsPage_class').eq(0).show();
	$(".optionMenu_class li").click(function() {
		idx = $(this).index('.optionMenu_class li');
		$('.optionInfo_class .optionsPage_class').eq(idx).show();
		$('.optionInfo_class .optionsPage_class').not($('.optionInfo_class .optionsPage_class').eq(idx)).hide();
		$(this).css({
			'border-bottom': 'none'
		});
		$('.optionMenu_class li').not($(this)).css({
			'border-bottom': '1px solid #ccc'
		});
	});

	//提交译文按钮
	$('#showSubmitArea').click(function() {
		$('#submitArea').toggle();
	});

	//回车提交事件
	document.onkeydown = function(e) {
		if (e.shiftKey && e.keyCode == 13) {
			//shift+回车换行
		} else if (e && e.keyCode == 13) {
			if($('#submitArea').val()!=''){
				//提交译文则将提交的释义设为默认替换文本
				switchInfo = $('#submitArea').val();
				storeTranslation();
				$("#trans_sub_trans").val(switchInfo);
				$("#trans_sub_word").val(textInfo);
				$("#formSubmitter").trigger("click");
        $('#transOptions').remove();
    		selected=0;
				e.preventDefault(); //阻止换行
			}else{
				alert("请输入您要提交的译文");
				e.preventDefault(); //阻止换行
			}
		}
	}

  //刷新当前备选释义
  function refreshTranspage(a){
		transIndex += a;
		for (let i = transIndex; i < transIndex+3; i++) {
  		let j = i%3;
  		if (i==0) {
  			document.getElementById('prePage').removeEventListener('click',goPrePage);
  			document.getElementById('prePage').addEventListener('click',firstPage);
  		}
  		if (Translations[i]) {
  			$("#transText" + (j + 1)).text(Translations[i].trans);
        console.log($("#transText" + (j + 1)).text());
        $("#transScore" + (j + 1)).empty();
  			scoreFun($("#transBlock" + (j + 1)), {
  				fen_d: 22, //每一个a的宽度
  				ScoreGrade: 5 //a的个数 10或者
  			});
  			$('.transLine_class').eq(j).show();

  		}else{
  			document.getElementsByClassName('transLine_class')[j].style.display='none';
  			document.getElementById('nextPage').removeEventListener('click',goNextPage);
  			document.getElementById('nextPage').addEventListener('click',lastPage);
  		}
	};
	//分数和radio绑定
  	$('input[name=selectRadio]').click(function() {
    	Historied=0;
      $("#transScore" + this.value).show();
    	if(checkedValue==this.value){
    	}else{
    		scoreInfo=0;
    		checkedValue=this.value;
    	}
        $(".scoreStar_class").not("#transScore" + this.value).hide();
    	//点击按钮则将对应的释义设为默认替换文本
    	switchInfo=$("#transText" + this.value).text();
    	//向本地存储插入记录
    	storeTranslation();
    });
  }

  function goNextPage(){
  	document.getElementById('prePage').addEventListener('click',goPrePage);
  	document.getElementById('prePage').removeEventListener('click',firstPage);
  	refreshTranspage(3);
	}


  function goPrePage(){
  	document.getElementById('nextPage').addEventListener('click',goNextPage);
  	document.getElementById('nextPage').removeEventListener('click',lastPage);
  	refreshTranspage(-3);
  	}
    function firstPage(){
  	alert('已经是第一页！');
  	}
    function lastPage(){
  	alert('已经是最后一页！');
  	}

  }


  //向本地存储插入记录
  //在点选radio或提交译文时执行
  function storeTranslation(){
  	var url = window.location.href;
      var storage = localStorage.getItem(url);

  	if (storage) {
        storage = JSON.parse(storage);
      } else {//第一次访问当前网页
        storage = { };
      }
      storage[textInfo] = switchInfo;
  	storage[switchInfo] = textInfo;
      localStorage.setItem(url, JSON.stringify(storage));
  }

  //查询本地存储，是否访问的是同一网页，且将要翻译的单词是否翻译过
  //划词时调用
  function queryHistory(){
	  var url = window.location.href;
    var storage = localStorage.getItem(url);

  	if (storage) {//访问过当前网页并且进行过翻译，需要判断是否翻译同一个单词
  		storage = JSON.parse(storage);
  	}else{//未访问过，不需要设置默认替换内容
  		return 0;
  	}
  	if(storage[textInfo]){//有历史记录，需要将此记录设为默认替换内容(switchInfo）
  		switchInfo=storage[textInfo];
  		return 1;
  	}else{//没有翻译过此单词，不需要设置默认替换内容
  		return 0;
  	}
  }
  //替换文本并提交一条评分
  function replaceAndSubmit(){
  	if(Historied){//如果使用的是历史记录，不进行评分
  		document.getElementById('transsurroundlabel').innerHTML=switchInfo;
  		$('#transOptions').remove();
    		selected=0;
  	}else{
  		if(document.getElementById('transsurroundlabel')&&switchInfo&&scoreInfo){
  			document.getElementById('transsurroundlabel').innerHTML=switchInfo;
  			//提交评分
  			$('#score_sub_word').val(textInfo);
  			$('#score_sub_score').val(scoreInfo);
  			$('#score_sub_trans').val(switchInfo);
  			console.log(scoreInfo);
  			sub_newScore();
  			$('#transOptions').remove();//不能用empty
  			selected=0;
  		}else if(!document.getElementById('transsurroundlabel')){
  			alert("请选择要替换的单词");
  		}else if(!switchInfo){
  			alert("请选择要替换的释义");
  		}else if(!scoreInfo){
  			alert("请为本释义进行评分");
  		}
  	}
  }

  function closeAll(){
    $('#transOptions').remove();
    selected=0;
  }

})()
