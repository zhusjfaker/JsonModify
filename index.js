import { Subject } from 'rxjs';
export function JsonProp(check = true) {
    return function (target, propertyKey, descriptor) {
        if (!target.$$JsonPropList) {
            target.$$JsonPropList = [];
        }
        target.$$JsonPropList.push(propertyKey);
        /** 自动订阅事件 */
        let nativefunc = descriptor.set;
        descriptor.set = function (value) {
            nativefunc.apply(this, arguments);
            if (check) {
                this.$call.next(this);
            }
        };
    };
}
export function JsonModel(T, check = true, recursion = true) {
    return function (target, propertyKey, descriptor) {
        if (!target.$$JsonModelList) {
            target.$$JsonModelList = [];
            target.$$JsonModelTypeMap = new Map();
        }
        target.$$JsonModelList.push(propertyKey);
        target.$$JsonModelTypeMap.set(propertyKey, T);
        /** 自动订阅事件 */
        let nativefunc = descriptor.set;
        descriptor.set = function (value) {
            nativefunc.apply(this, arguments);
            if (check) {
                this.$call.next(this);
            }
            if (check && recursion) {
                value.$call.subscribe((data) => {
                    this.$call.next(this);
                });
            }
        };
    };
}
export function JsonPropArray() {
    return function (target, propertyKey, descriptor) {
        if (!target.$$JsonPropArrayList) {
            target.$$JsonPropArrayList = [];
        }
        target.$$JsonPropArrayList.push(propertyKey);
    };
}
export function JsonModelArray(T) {
    return function (target, propertyKey, descriptor) {
        if (!target.$$JsonModelArrayList) {
            target.$$JsonModelArrayList = [];
            target.$$JsonModelArrayTypeMap = new Map();
        }
        target.$$JsonModelArrayList.push(propertyKey);
        target.$$JsonModelArrayTypeMap.set(propertyKey, T);
    };
}
export class JsonSerializable {
    constructor() {
        this.$call = new Subject();
        /** 表层触发回调 */
        this.$call.subscribe((data) => {
            if (data.$watch != null) {
                data.$watch(data);
            }
        });
        /** 添加对应数组扩扩展方法 */
        let prototype = (Array.prototype);
        if (!prototype.SerializableList) {
            prototype.SerializableList = function () {
                let list = [];
                if (this && this.length > 0) {
                    this.every((p) => {
                        list.push(p.SerializableObject());
                        return true;
                    });
                    return list;
                }
                else {
                    return null;
                }
            };
        }
        if (!prototype.SerializableListStringify) {
            prototype.SerializableListStringify = function () {
                return JSON.stringify(this.SerializableList());
            };
        }
    }
    $check() {
        let submit = Reflect.get(this, "$call");
        submit.next(this);
    }
    Serializable() {
        let obj = this.Subline(this);
        return JSON.stringify(obj);
    }
    ;
    SerializableObject() {
        return this.Subline(this);
    }
    ;
    Subline(item) {
        if (!item) {
            return null;
        }
        let result = {};
        var orginal = Object.getPrototypeOf(item);
        if (orginal.$$JsonPropList && orginal.$$JsonPropList.length > 0) {
            orginal.$$JsonPropList.every(x => {
                result[x] = item[x] != null ? item[x] : null;
                return true;
            });
        }
        if (orginal.$$JsonModelList && orginal.$$JsonModelList.length > 0) {
            orginal.$$JsonModelList.every(x => {
                result[x] = item[x] != null ? this.Subline(item[x]) : null;
                return true;
            });
        }
        if (orginal.$$JsonPropArrayList && orginal.$$JsonPropArrayList.length > 0) {
            orginal.$$JsonPropArrayList.every(x => {
                result[x] = item[x] instanceof Array && item[x].length > 0 ? item[x] : null;
                return true;
            });
        }
        if (orginal.$$JsonModelArrayList && orginal.$$JsonModelArrayList.length > 0) {
            orginal.$$JsonModelArrayList.every(x => {
                let model_array = [];
                if (item[x]) {
                    item[x].every(y => {
                        model_array.push(this.Subline(y));
                        return true;
                    });
                }
                result[x] = model_array.length > 0 ? model_array : null;
                return true;
            });
        }
        return result;
    }
}
export class JsonConvert {
    static InstanceOf(T, json) {
        let standard = null;
        try {
            let tempdata = JSON.parse(json);
            if (tempdata instanceof Object) {
                standard = new T();
                this.pullBuffer(tempdata, standard);
            }
            else {
                throw new Error("object type is not Single Object");
            }
        }
        catch (ex) {
            return null;
        }
        return standard;
    }
    /**
     * static ListOf<T>
     */
    static ListOf(T, json) {
        let standard = null;
        try {
            let tempdata = JSON.parse(json);
            if (tempdata instanceof Array) {
                standard = [];
                tempdata.every(x => {
                    let standard_item = new T();
                    let obj = this.pullBuffer(x, standard_item);
                    standard.push(obj);
                    return true;
                });
            }
            else {
                throw new Error("object type is not Array");
            }
        }
        catch (ex) {
            return null;
        }
        return standard;
    }
    static pullBuffer(item, standard) {
        var orginal = Object.getPrototypeOf(standard);
        if (orginal.$$JsonPropList && orginal.$$JsonPropList.length > 0) {
            orginal.$$JsonPropList.every(x => {
                if (item != null && item[x] != null) {
                    standard[x] = item[x];
                }
                else {
                    standard[x] = null;
                }
                return true;
            });
        }
        if (orginal.$$JsonModelList && orginal.$$JsonModelList.length > 0) {
            orginal.$$JsonModelList.every(x => {
                if (item != null && item[x] != null) {
                    let standerProp = orginal.$$JsonModelTypeMap.get(x);
                    standard[x] = this.pullBuffer(item[x], new standerProp());
                }
                /** 若为空否则不予set访问器赋值否则自动挂载触发连锁异常 */
                return true;
            });
        }
        if (orginal.$$JsonPropArrayList && orginal.$$JsonPropArrayList.length > 0) {
            orginal.$$JsonPropArrayList.every(x => {
                if (item != null && item[x] != null && item[x] instanceof Array) {
                    standard[x] = item[x] instanceof Array && item[x].length > 0 ? item[x] : null;
                }
                else {
                    standard[x] = null;
                }
                return true;
            });
        }
        if (orginal.$$JsonModelArrayList && orginal.$$JsonModelArrayList.length > 0) {
            orginal.$$JsonModelArrayList.every(x => {
                let model_array = [];
                if (item != null && item[x] != null && item[x] instanceof Array) {
                    let standerProp_model = orginal.$$JsonModelArrayTypeMap.get(x);
                    item[x].every(y => {
                        let standard_model = new standerProp_model();
                        model_array.push(this.pullBuffer(y, standard_model));
                        return true;
                    });
                    standard[x] = model_array.length > 0 ? model_array : null;
                }
                return true;
            });
        }
        return standard;
    }
}
//# sourceMappingURL=index.js.map