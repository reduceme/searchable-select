;(function ($) {
    $.expr[":"].searchableSelectContains = $.expr.createPseudo(function (arg) {
        /* obj - is a current DOM element
           index - the current loop index in stack
           meta - meta data about your selector !!! 用来存参数值，详见带参数的自定义伪类选择器。
           stack - stack of all elements to loop

           Return true to include current element
           Return false to explude current element
        */
        return function (elem) {
            var reg = new RegExp(arg, 'gim');
            var isMatch = $(elem).text().toUpperCase().indexOf(arg.toUpperCase());
            if (isMatch >= 0) {
                $(elem).html($(elem).text().replace(reg, '<span style="color:red;">$&</span>'));
            }
            return isMatch >= 0;
        };
    });
    $.selectpicker = function (element, options) {
        this.element = element;
        this.options = options || {};
        this.init();

        var _this = this;
        this.holder.on('click', function (event) {
            if (_this.status === 'hide') {
                _this.show();
            } else {
                _this.hide();
            }
        });

        $(document).on('click', function (event) {
            if (_this.searchableElement.has($(event.target)).length === 0) {
                _this.hide();
            }
        });

        this.input.on('keyup', function (event) {
            _this.filter();
        })
    };
    var $sp = $.selectpicker;
    $sp.fn = $sp.prototype;
    $sp.fn.extend = $sp.extend = $.extend;
    $sp.fn.extend({
        // 初始化
        init: function () {
            //隐藏原来的select
            this.element.hide();
            //存储当前的状态
            this.status = 'hide';
            //最外层的容器
            this.searchableElement = $('<div class="searchable-select"></div>');
            //下拉的箭头
            this.caret = $('<span class="searchable-select-caret"></span>');
            //内层显示选中项的容器
            this.holder = $('<div class="searchable-select-holder"></div>');
            //下拉框
            this.dropdown = $('<div class="searchable-select-dropdown searchable-select-hide"></div>');
            //搜索的input
            this.input = $('<input type="text" class="searchable-select-input"/>');
            //装所有option的容器
            this.scrollPart = $('<div class="searchable-scroll"></div>');
            //每一条选项
            this.items = $('<div class="searchable-select-items"></div>');

            //构造select
            this.dropdown.append(this.input);
            this.dropdown.append(this.scrollPart);
            this.scrollPart.append(this.items);
            this.searchableElement.append(this.caret);
            this.searchableElement.append(this.holder);
            this.searchableElement.append(this.dropdown);

            this.buildItems();
            //把新构建的select插入
            this.element.after(this.searchableElement)
        },
        //构造选项
        buildItems: function () {
            var _this = this;
            this.element.find('option').each(function () {
                var item = $('<div class="searchable-select-item" data-value="' + $(this).attr('value') + '">' + $(this).text() + '</div>');

                item.on('click', function (event) {
                    event.stopPropagation();
                    _this.selectItem($(this));
                    _this.hide();
                });
                if (this.selected) {
                    _this.selectItem(item)
                }
                _this.items.append(item);
            });
        },
        //设置选中的状态
        selectItem: function (item) {
            //避免重复添加
            if (this.hasCurrentSelectedItem()) {
                this.currentSelectedItem.removeClass('selected');
            }
            //存储当前选中项目
            this.currentSelectedItem = item;
            item.addClass('selected');
            this.element.val(item.data('value'));
            this.holder.text(item.text()).data('value', item.data('value'));
        },
        //判断是否有选中的项目
        hasCurrentSelectedItem: function () {
            return this.currentSelectedItem && this.currentSelectedItem.length > 0;
        },
        //显示下拉框
        show: function () {
            this.dropdown.removeClass('searchable-select-hide');
            this.input.focus();
            //存储当前的状态
            this.status = 'show';
        },
        //隐藏下拉框
        hide: function () {
            if (!(this.status === 'show')) {
                return;
            }
            this.dropdown.addClass('searchable-select-hide');
            this.status = 'hide';
        },
        //搜索匹配项目
        filter: function () {
            var text = this.input.val();
            this.items.find('.searchable-select-item').addClass('searchable-select-hide');
            this.items.find('.searchable-select-item:searchableSelectContains(' + text + ')').removeClass('searchable-select-hide');
        }
    });
    $.fn.selectpicker = function (options) {
        this.each(function () {
            var sp = new $sp($(this), options);
        });
        return this
    };
})(jQuery);
