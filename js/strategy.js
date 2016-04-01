/**
 * 表单输入验证器js, 采用策略模式
 * @author libaoxu 2016-03-28
 */

function InputValidators() {
    //存放 需要验证的表单带"对应验证的策略"的数组, 数组里面存放相同的匿名函数, 但是策略名, 和 策略方法不同
    this.validators = [];
    //验证策略的json, 存放验证策略名(key) 和 策略方法(value), 在执行的时候根据返回值进行判断
    this.strategies = {};
}

/**
* 导入策略json
* @param  {json} strategies name: 策略名
*                           strategy: 策略函数
*/
InputValidators.prototype.importStrategies = function (strategies) {
    for ( var strategyName in strategies ) {
        this.addValidationStrategy(strategyName, strategies[strategyName]);
    }
    //实现链式调用
    return this;
};

//增加策略值, 这个方法抽离出来, 方便外部扩展
InputValidators.prototype.addValidationStrategy = function (strategyName, strategyFn) {
    this.strategies[strategyName] = strategyFn;
    return this;
};

/**
* 添加验证数组
* @param {string} rule    [验证的策略字符串 --> 策略名: 策略规则]
* @param {dom} element [验证的dom元素]
* @param {string} errMsg  [验证失败的提示信息]
* @param {} value   [dom的具体值]
*/
InputValidators.prototype.addValidator = function () {
    var _this = this;
    var ruleElements = Array.prototype.shift.call(arguments).split(':'); // equalLength:6 --> ['equalLength', '6']
    var params = arguments;

    //存放 需要验证的表单带"对应验证的策略"的数组, 数组里面存放相同的匿名函数, 但是策略名, 和 策略方法不同
    this.validators.push(function () {
        var strategyName = ruleElements.shift(0,1); // 'equalLength'
        // 讲rule的点第一个参数策略名(脱离开变为策略json的key) 和 第二个策略规则分开(放到结尾) , 这样就不用限制于参数了
        // _this.strategies['equalLength']                  [element, errMsg, value, 6]
        return _this.strategies[strategyName].apply(_this, Array.prototype.slice.call(params, 0).concat(ruleElements) );
    });
    return this;
};

//删除验证内容, 主要为了该次验证时候, 不被上次验证阻挡
InputValidators.prototype.emptyValidators = function () {
    this.validators = [];
    return this;
};

//验证失败时, 返回:element: dom元素, errMrg:错误信息, value: 值
InputValidators.prototype.invalidErrResult = function (element, errMsg, value) {
    return {
        'element': element,
        'errMsg': errMsg,
        'value': value
    };
};

//开始验证
InputValidators.prototype.check = function () {
    //这里var 里面两个变量, i++ 是后加
    for ( var i = 0, validator; validator = this.validators[i++]; ) {
        var result = validator();
        if (result) {
            return result;
        }
    }
    return undefined;
};

//验证策略json, 包含策略名, 和 策略函数
var validationStrategies = {
    //如下一切都是再为 "假" 的时候返回 InputValidators 对象的 无效对象
    isNoEmpty: function (element, errMsg, value) {
        if (value === '') {
            return this.invalidErrResult(element, errMsg, value);
        }
    },
    minLength: function(element, errMsg, value, length) {
          if(value.length < length){
              return this.invalidErrResult(element, errMsg, value);
          }
        },
        maxLength: function(element, errMsg, value, length) {
          if(value.length > length){
              return this.invalidErrResult(element, errMsg, value);
          }
        },
    equalLength: function (element, errMsg, value, length) {
        if (value.length != length) {
            return this.invalidErrResult(element, errMsg, value);
        }
    },
    isTelephone: function (element, errMsg, value) {
        var reg = /^1[3578]{1}[0-9]{9}$/;
        if (!reg.test(value)) {
            return this.invalidErrResult( element, errMsg, value );
        }
    },
    isMail: function(element, errMsg, value) {
        var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        if(!reg.test(value)){
                return this.invalidErrResult(element, errMsg, value);
            }
        },
    isNumber: function (element, errMsg, value) {
        if (!/^[0-9]*$/.test(value)) {
            return this.invalidErrResult(element, errMsg, value);
        }
    },
    isChineseName: function (element, errMsg, value) {
        if (!/^[\u2E80-\u9FFF]+$/.test(value)) {
            return this.invalidErrResult(element, errMsg, value);
        }
    },
    isIndentifyCard: function (element, errMsg, value) {
        if (!/^\d{15}|\d{}18$/.test(value)) {
            return this.invalidErrResult(element, errMsg, value);
        }
    },
    isEqual: function (element, errMsg, value1, value2) {
        if (value1 !== value2) {
            return this.invalidErrResult(element, errMsg, value1);
        }
    }
};
