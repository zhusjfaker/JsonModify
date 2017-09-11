import { EventEmitter } from '@angular/core';

export function JsonProp(check: boolean = true) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.$$JsonPropList) {
            target.$$JsonPropList = [];
        }
        target.$$JsonPropList.push(propertyKey);
        /** 自动订阅事件 */
        let nativefunc = descriptor.set;
        descriptor.set = function (value) {
            if (check) {
                (<JsonSerializable<any>>this).$call.emit(this);
            }
            nativefunc.apply(this, arguments);
        }
    }
}

export function JsonModel(T: any, check: boolean = true, recursion: boolean = true) {
    return function (target, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        if (!target.$$JsonModelList) {
            target.$$JsonModelList = [];
            target.$$JsonModelTypeMap = new Map<string, any>();
        }
        target.$$JsonModelList.push(propertyKey);
        target.$$JsonModelTypeMap.set(propertyKey, T);
        /** 自动订阅事件 */
        let nativefunc = descriptor.set;
        descriptor.set = function (value) {
            if (check) {
                (<JsonSerializable<any>>this).$call.emit(this);
            }
            if (check && recursion) {
                (<JsonSerializable<any>>value).$call.subscribe(data => {
                    (<JsonSerializable<any>>this).$call.emit(this);
                });
            }
            nativefunc.apply(this, arguments);
        }
    }
}

export function JsonPropArray() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.$$JsonPropArrayList) {
            target.$$JsonPropArrayList = [];
        }
        target.$$JsonPropArrayList.push(propertyKey);
    }
}
export function JsonModelArray(T: any) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.$$JsonModelArrayList) {
            target.$$JsonModelArrayList = [];
            target.$$JsonModelArrayTypeMap = new Map<string, any>();
        }
        target.$$JsonModelArrayList.push(propertyKey);
        target.$$JsonModelArrayTypeMap.set(propertyKey, T);
    }
}

export abstract class JsonSerializable<T> {

    public $call: EventEmitter<T> = new EventEmitter<T>();

    public $watch: Function;

    constructor() {
        /** 表层触发回调 */
        this.$call.subscribe(data => {
            if (data.$watch != null) {
                data.$watch(data);
            }
        });
    }

    public $check(): void {
        let submit: EventEmitter<any> = Reflect.get(this, "$call");
        submit.emit(this);
    }

    public Serializable(): string {
        let obj = this.Subline(this);
        // console.log(obj);
        return JSON.stringify(obj);
    };

    private Subline(item: JsonSerializable<T>): any {
        if (!item) {
            return null;
        }
        let result = {};
        var orginal = Object.getPrototypeOf(item);
        if (orginal.$$JsonPropList && orginal.$$JsonPropList.length > 0) {
            (<any[]>orginal.$$JsonPropList).every(x => {
                result[x] = item[x] != null ? item[x] : null;
                return true;
            });
        }
        if (orginal.$$JsonModelList && orginal.$$JsonModelList.length > 0) {
            (<any[]>orginal.$$JsonModelList).every(x => {
                result[x] = item[x] != null ? this.Subline(item[x]) : null;
                return true;
            });
        }
        if (orginal.$$JsonPropArrayList && orginal.$$JsonPropArrayList.length > 0) {
            (<any[]>orginal.$$JsonPropArrayList).every(x => {
                result[x] = item[x] instanceof Array && item[x].length > 0 ? item[x] : null;
                return true;
            });
        }
        if (orginal.$$JsonModelArrayList && orginal.$$JsonModelArrayList.length > 0) {
            (<any[]>orginal.$$JsonModelArrayList).every(x => {
                let model_array = [];
                if (item[x]) {
                    (<any[]>item[x]).every(y => {
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

    private static pullBuffer(item: any, standard: any): any {
        var orginal = Object.getPrototypeOf(standard);
        if (orginal.$$JsonPropList && orginal.$$JsonPropList.length > 0) {
            (<any[]>orginal.$$JsonPropList).every(x => {
                if (item != null && item[x] != null) {
                    standard[x] = item[x]
                } else {
                    standard[x] = null;
                }
                return true;
            });
        }
        if (orginal.$$JsonModelList && orginal.$$JsonModelList.length > 0) {
            (<any[]>orginal.$$JsonModelList).every(x => {
                if (item != null && item[x] != null) {
                    let standerProp = orginal.$$JsonModelTypeMap.get(x);
                    standard[x] = this.pullBuffer(item[x], new standerProp());
                }
                /** 若为空否则不予set访问器赋值否则自动挂载触发连锁异常 */
                return true;
            });
        }
        if (orginal.$$JsonPropArrayList && orginal.$$JsonPropArrayList.length > 0) {
            (<any[]>orginal.$$JsonPropArrayList).every(x => {
                if (item != null && item[x] != null && item[x] instanceof Array) {
                    standard[x] = item[x] instanceof Array && item[x].length > 0 ? item[x] : null;
                } else {
                    standard[x] = null;
                }
                return true;
            });
        }
        if (orginal.$$JsonModelArrayList && orginal.$$JsonModelArrayList.length > 0) {
            (<any[]>orginal.$$JsonModelArrayList).every(x => {
                let model_array = [];
                if (item != null && item[x] != null && item[x] instanceof Array) {
                    let standerProp_model = orginal.$$JsonModelArrayTypeMap.get(x);
                    (<any[]>item[x]).every(y => {
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

    public static InstanceOf<T>(json: string, T: any): JsonSerializable<T> {
        let standard = null;
        try {
            let tempdata = JSON.parse(json);
            if (tempdata instanceof Array) {
                standard = [];
                (<any[]>tempdata).every(x => {
                    let standard_item = new T();
                    standard.push(this.pullBuffer(x, standard_item));
                    return true;
                });
            }
            if (tempdata instanceof Object) {
                standard = new T();
                this.pullBuffer(tempdata, standard);
            }
        }
        catch (ex) {
            console.log(ex);
            return null;
        }
        return standard;
    }


}
