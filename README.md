# JsonModify
Solution about Typescript in JsonSerializable 


## 代码环境
* 需要配置NG2的core和Rxjs 加载环境进行npm i/install 恢复代码依赖

## 推荐插件

* typescript-toolbox alt+shift+G 自动生成getter/setter 选择器

## 文件结构

#### _base
* jsonModify.ts 核心操作类
#### demo
* responseModel.ts 实例响应实体
* demo.ts 操作类操作响应实体，实现实例代码

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

*  `$call` 默认每一个Json序列化对象都有一个观察者事件，改变通过set访问器触发$call.emit()
*  `$watch` 订阅后提交触发自己的回调函数 若为null 则不触发。
*  `$check()` 手动触发$call的提交事件，PS一般作用在数组属性或递归子数组属性 有长度内容变化时手动提交对象自检。
*  `json_object.Serializable()` 转化装饰器构建的JSON字符串 PS： json_object instanceof JsonSerializable<any> ==true
*  `ModelClass.InstanceOf<ModelClass>(json,ModelClass)` 用于还原JSON对象包含JS原型 静态方法
*  调用实例 还原类型.InstanceOf(json字符串，还原类型)=>ModelClass.InstanceOf<ModelClass>(json,ModelClass)
*  `注意：ModelClass extends JsonSerializable<ModelClass> 还原类型必须继承本抽象类！`


#### 抽象类使用实例代码
responseModel.ts
<pre>
<code>
export class TestMoel extends JsonSerializable<TestMoel> {

    constructor() {
        super();
    }

    .... .....
    .... .....
}
</code>
</pre>

#### 装饰器
包含4种装饰器：
* JSON对象简值装饰器 `JsonProp(check)` =>check默认为true 可以设置false 
* 用来控制属性的改变是否触发对象的原有的$watch事件
  (PS:一般设在string number 这种值类型非结构化属性访问器上)

responseModel.ts
<pre>
<code>
export class TestMoel extends JsonSerializable<TestMoel> {

    constructor() {
        super();
    }

    private _name: string;
    
    /** 标识为一般值类型的属性用JsonProp */
    @JsonProp()
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    ...... ......
    ...... ......
}

</code>
</pre>

* JSON对象引用装饰器 `@JsonModel(Classtype,check,recursion)` => 装饰器要求传入引用对象的Class类型 
* 该Class 必须继承 JsonSerializable<T> 
* check默认为true 可以设置false 用来控制属性的改变是否触发对象的原有的$watch事件  object.json_object = new jsonClass() 触发
* recursion 递归 默认为true修改子属性对象上的属性值则会触发父对象的$watch
  
  example: 
       
        test.inner = new TestMoel();
        test.inner.name = "666"; //触发test.$watch
        test.inner.age = 888; //触发test.$watch

  (PS:一般设在object 这种引用类型结构化属性访问器上)

responseModel.ts
<pre>
<code>
export class TestMoel extends JsonSerializable<TestMoel> {

    constructor() {
        super();
    }

    /** 标识为引用类型的属性用JsonModel PS: 该引用类型必须继承 JsonSerializable<T> 且加载访问器上  */
    @JsonModel(TestMoel)
    public get inner(): TestMoel {
        return this._inner;
    }

    public set inner(value: TestMoel) {
        this._inner = value;
    }

    private _inner: TestMoel;

    ...... ......
    ...... ......
}

</code>
</pre>


* JSON简值数组引用装饰器 `@JsonPropArray()` => 数组修改必须手动调用object.$check()方法 目前尚待改进
(PS: 一般作用在简单的string[] / number[])

responseModel.ts
<pre>
<code>
export class TestMoel extends JsonSerializable<TestMoel> {

    constructor() {
        super();
    }

    /** 标识为值类型数组 一般为string[] number[] */
    @JsonPropArray()
    public get array(): number[] {
        return this._array;
    }
    public set array(value: number[]) {
        this._array = value;
    }

    private _array: number[];

    ...... ......
    ...... ......
}

</code>
</pre>


