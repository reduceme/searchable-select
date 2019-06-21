;(function ($) {
    //自定义的伪类选择器
    $.expr[":"].searchableSelectContains = $.expr.createPseudo(function (arg) {
        /* obj - is a current DOM element
           index - the current loop index in stack
           meta - meta data about your selector !!! 用来存参数值，详见带参数的自定义伪类选择器。
           stack - stack of all elements to loop

           Return true to include current element
           Return false to explude current element

           https://github.com/jquery/sizzle/wiki#extension-api
        */
        return function (elem) {
            var reg = new RegExp(arg, 'gim');
            var isMatch = $(elem).text().toUpperCase().indexOf(arg.toUpperCase());
            if (isMatch >= 0) {
                arg === ''
                    ? $(elem).html($(elem).text())
                    : $(elem).html($(elem).text().replace(reg, '<span style="color:red;">$&</span>'));
            }
            return isMatch >= 0;
        };
    });
    $.selectpicker = function (element, options) {
        this.element = element;
        //默认参数
        var defaults = {
            //是否启用远程搜索
            filterable: false,
            //搜索的url
            url: '',
            //发送的参数
            data: {
                //input的信息
                searchContent: '',
                //当前分页
                page: 1,
                //每页的数量
                limit: 100
            },
            //请求方法
            methods: 'post',
            totalPage: 0
        };
        this.options = $.extend({}, defaults, options);

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
        var action = this.debounce(_this.debounceFilter, _this, 1000);

        // var action = this.throttle(doInput, 1000);
        // $('#txt').on('keyup', action);

        /*this.input.on('keyup', function (event) {
            //判断是否启用后台搜索
            if (_this.options.filterable) {
                _this.remoteSearch();
            }
            _this.filter();
        });*/
        this.input.on('keyup', action)
    };
    var $sp = $.selectpicker;
    $sp.fn = $sp.prototype;
    $sp.fn.extend = $sp.extend = $.extend;
    $sp.fn.extend({
        // 初始化
        init: function () {
            var _this = this;
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

            //上一页
            this.hasPrivious = $('<div class="searchable-has-privious searchable-select-hide">上一页</div>');
            //下一页
            this.hasNext = $('<div class="searchable-has-next searchable-select-hide">下一页</div>');

            //构造select
            this.dropdown.append(this.input);
            this.dropdown.append(this.scrollPart);

            this.scrollPart.append(this.hasPrivious);
            this.scrollPart.append(this.items);
            this.scrollPart.append(this.hasNext);

            this.searchableElement.append(this.caret);
            this.searchableElement.append(this.holder);
            this.searchableElement.append(this.dropdown);

            //启用远程搜索，给上一页、下一页绑定翻页事件
            if (this.options.filterable) {
                this.hasPrivious.removeClass('searchable-select-hide');
                this.hasNext.removeClass('searchable-select-hide');
                this.hasPrivious.on('click', function () {
                    _this.pageTurn(false);
                });

                this.hasNext.on('click', function () {
                    _this.pageTurn(true);
                });
            }

            this.buildItems();
            //把新构建的select插入
            this.element.after(this.searchableElement);
        },
        //构造选项
        buildItems: function () {
            var _this = this;
            this.items.empty();
            this.element.find('option').each(function () {
                var item = $('<div class="searchable-select-item" data-value="' + $(this).attr('value') + '">' + $(this).text() + '</div>');

                /*item.on('click', function (event) {
                    event.stopPropagation();
                    _this.selectItem($(this));
                    _this.hide();
                });*/
                if (this.selected) {
                    _this.selectItem(item)
                }
                _this.items.append(item);
            });
            this.items.on('click', '.searchable-select-item', function (event) {
                event.stopPropagation();
                _this.selectItem($(this));
                _this.hide();
            })
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
        //前端搜索匹配项目
        filter: function () {
            var text = this.input.val();
            this.items.find('.searchable-select-item').addClass('searchable-select-hide');
            this.items.find('.searchable-select-item:searchableSelectContains(' + text + ')').removeClass('searchable-select-hide');
        },
        //后台搜索匹配项目
        remoteSearch: function () {
            $.ajax({
                methods: this.options.methods,
                url: this.options.url,
                data: {
                    searchContent: this.input.val(),
                    page: this.options.data.page,
                    limit: this.options.data.limit
                },
                success: function (data) {
                    if (data.success) {
                        var html = '';
                        for (var i = 0, len = data.data.length; i < len; i++) {
                            html += '<option value="' +
                                data.data[i].key + '">' +
                                data.data[i].value + '</option>';
                        }
                        this.element.html(html);
                        this.buildItems();
                        this.options.totalPage = data.totalPage;
                    }
                },
                error: function (err) {
                    console.log(err.statusText)
                }
            })
        },
        //翻页
        pageTurn: function (isNext) {
            if (isNext && this.options.data.page < this.options.totalPage) {
                this.options.data.page++;
                this.remoteSearch()
            }
            if (!isNext
                && this.options.data.page < this.options.totalPage
                && this.options.data.page > 0) {
                this.options.data.page--;
                this.remoteSearch();
            }
        },
        //去抖动
        debounce: function (action, _this, time) {
            var timer = null;
            return function() {
                var args = arguments;

                clearTimeout(timer);
                timer = setTimeout(function() {
                    action.apply(_this, args);
                }, time);
            };
        },
        debounceFilter: function () {
            console.log('test');
            if (this.options.filterable) {
                this.remoteSearch();
            }
            this.filter();
        }
    });
    $.fn.selectpicker = function (options) {
        this.each(function () {
            var sp = new $sp($(this), options);
        });
        return this
    };
})(jQuery);
