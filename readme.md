# 模拟实现下拉框组件 #
### 调用方法：
1. 引入`jquery.js`，引入`jquery.selectpicker.js`，引入`jquery.selectpicker.css`
2. `$('select').selectpicker()`，默认方式为静态渲染，即直接渲染`select`的`option`，如需要异步加载数据，配置如下参数
	```
	e
	$('select').selectpicker({
	  filterable: true,
	  url: '/test-url',
	  data: {
	     page: 1,
	    limit: 100
	   },
	  methods: 'post'
	});
	```

### 代码结构
1. 采用jquery插件的方式完成需求功能，代码入口`$.selectpicker()`
2. 调用`init()`进行初始化，构造类似select的下拉框
3. 调用`buildItems()`，构造`select`的`option`选项，并为每个`option`绑定点击事件`selectItem()`——点击之后赋值并隐藏下拉框
4. `selectItem()`，为避免用户点击的是本来就是选中项，导致重复添加选中的`class`，所以每次点击之前都把`selected`移除，然后为原始的`select`绑定`value`，为新建的`select`绑定值。
5. 过滤方法：利用`jquery`的自定义过滤方法（自定义伪类选择器）`$.expr[":"]$.expr[":"].searchableSelectContains = $.expr.createPseudo(function (arg) {})`，在`filter()`里，让每一个`option`隐藏，再调用自定义的伪类选择器，同时添加了函数防抖动，程序会在用户停止键入文字的一秒之后再执行查询操作。

### 大量数据
存在大量数据时，该插件会有明显的卡顿，`bootstrap-select`，是`bootstrap`的一个搜索插件，该插件存在大量数据时，可以非常流畅的搜索出所需数据，同时没有做函数防抖动，他的搜索算法需要自己再进行研究

### 单元测试
未写单元测试
