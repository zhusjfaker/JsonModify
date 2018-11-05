import { Subject } from 'rxjs';
export function JsonProp(check: boolean = true) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.$$JsonPropList) {
            target.$$JsonPropList = [];
        }
        target.$$JsonPropList.push(propertyKey);
        /** 自动订阅事件 */
        let nativefunc = descriptor.set;
        descriptor.set = function (value) {
            nativefunc!.apply(this, arguments);
            if (check) {
                (<JsonSerializable>this).$call.next(this);
            }
        }
    }
}
export function JsonModel(T: any, check: boolean = true, recursion: boolean = true) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        if (!target.$$JsonModelList) {
            target.$$JsonModelList = [];
            target.$$JsonModelTypeMap = new Map<string, any>();
        }
        target.$$JsonModelList.push(propertyKey);
        target.$$JsonModelTypeMap.set(propertyKey, T);
        /** 自动订阅事件 */
        let nativefunc = descriptor.set;
        descriptor.set = function (value) {
            nativefunc!.apply(this, arguments);
            if (check) {
                (<JsonSerializable>this).$call.next(this);
            }
            if (check && recursion) {
                (<JsonSerializable>value).$call.subscribe((data: any) => {
                    (<JsonSerializable>this).$call.next(this);
                });
            }
        }
    }
}
export function JsonPropArray() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.$$JsonPropArrayList) {
            target.$$JsonPropArrayList = [];
        }
        target.$$JsonPropArrayList.push(propertyKey);
    }
}
export function JsonModelArray(T: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.$$JsonModelArrayList) {
            target.$$JsonModelArrayList = [];
            target.$$JsonModelArrayTypeMap = new Map<string, any>();
        }
        target.$$JsonModelArrayList.push(propertyKey);
        target.$$JsonModelArrayTypeMap.set(propertyKey, T);
    }
}
export abstract class JsonSerializable {
    public $call: Subject<any> = new Subject<any>();
    public $watch: Function | undefined;
    constructor() {
        /** 表层触发回调 */
        this.$call.subscribe((data: any) => {
            if (data.$watch != null) {
                data.$watch(data);
            }
        });
        /** 添加对应数组扩扩展方法 */
        let prototype = <any>(Array.prototype);
        if (!prototype.SerializableList) {
            prototype.SerializableList = function () {
                let list: any[] = [];
                if (this && this.length > 0) {
                    this.every((p: any) => {
                        list.push(p.SerializableObject());
                        return true;
                    });
                    return list;
                }
                else {
                    return null;
                }
            }
        }
        if (!prototype.SerializableListStringify) {
            prototype.SerializableListStringify = function () {
                return JSON.stringify(this.SerializableList());
            };
        }
    }
    public $check(): void {
        let submit: Subject<any> = Reflect.get(this, "$call");
        submit.next(this);
    }
    public Serializable(): string {
        let obj = this.Subline(this);
        return JSON.stringify(obj);
    };
    public SerializableObject(): any {
        return this.Subline(this);
    };
    private Subline(item: JsonSerializable): any {
        if (!item) {
            return null;
        }
        let result: any = {};
        var orginal = Object.getPrototypeOf(item);
        if (orginal.$$JsonPropList && orginal.$$JsonPropList.length > 0) {
            (<any[]>orginal.$$JsonPropList).every(x => {
                result[x] = (item as any)[x] != null ? (item as any)[x] : null;
                return true;
            });
        }
        if (orginal.$$JsonModelList && orginal.$$JsonModelList.length > 0) {
            (<any[]>orginal.$$JsonModelList).every(x => {
                result[x] = (item as any)[x] != null ? this.Subline((item as any)[x]) : null;
                return true;
            });
        }
        if (orginal.$$JsonPropArrayList && orginal.$$JsonPropArrayList.length > 0) {
            (<any[]>orginal.$$JsonPropArrayList).every(x => {
                result[x] = (item as any)[x] instanceof Array && (item as any)[x].length > 0 ? (item as any)[x] : null;
                return true;
            });
        }
        if (orginal.$$JsonModelArrayList && orginal.$$JsonModelArrayList.length > 0) {
            (<any[]>orginal.$$JsonModelArrayList).every(x => {
                let model_array: any[] = [];
                if ((item as any)[x]) {
                    (<any[]>(item as any)[x]).every(y => {
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
    public static InstanceOf<T>(T: any, json: string): T | null {
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
    public static ListOf<T extends JsonSerializable>(T: any, json: string): JsonList<T> | null {
        let standard: any = null;
        try {
            let tempdata = JSON.parse(json);
            if (tempdata instanceof Array) {
                standard = [];
                (<any[]>tempdata).every(x => {
                    let standard_item = new T();
                    let obj = this.pullBuffer(x, standard_item);
                    standard.push(obj);
                    return true;
                });
            } else {
                throw new Error("object type is not Array");
            }
        }
        catch (ex) {
            return null;
        }
        return standard;
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
                let model_array: any[] = [];
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
}

export interface JsonList<T extends JsonSerializable> extends Array<T> {
    SerializableList?(): any[];
    SerializableListStringify?(): string;
}