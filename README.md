# JsonModify
Solution about Typescript in JsonSerializable 


## 代码环境
* 需要配置NG2的core和Rxjs 加载环境进行npm i/install 恢复代码依赖

## 工具使用说明

#### 抽象类
JsonSerializable<T>
<pre>
<code>
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
    };

    private Subline(item: JsonSerializable<T>): any {
    }

    private static pullBuffer(item: any, standard: any): any {
        
    }

    public static InstanceOf<T>(json: string, T: any): JsonSerializable<T> {
        
    }

}
</code>
</pre>
<p>
  $call 默认每一个Json序列化对象都有一个观察者事件，改变通过set访问器触发$call.emit()
</p>


#### 装饰器
包含4种装饰器：
* JsonProp(check) =>check默认为true 可以设置false 用来控制属性的改变是否触发对象的原有的$watch事件
