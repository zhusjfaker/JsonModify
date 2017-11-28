import { JsonConvert, JsonList } from './../_base/jsonModify';
import { TestMoel } from './responseModel';
export class Demo {

    /** 新增数组特性 */
    public list: JsonList<TestMoel>;

    constructor() {
        let test = new TestMoel();
        test = new TestMoel();
        test.$watch = (data) => {
            /** 赋值触发的观察回调事件 data=>test当前 */
            console.log(data);
        };
        /** 赋值触发以上的回调事件 */
        test.array = [1, 2, 3];
        test.name = "123";
        test.age = 12;
        test.inner = new TestMoel();
        test.inner.name = "666";
        test.inner.age = 888;
        test.modelarray = [];
        test.modelarray.push(new TestMoel());
        test.modelarray.push(new TestMoel());
        /** 手动触发对象自检 */
        test.$check();
        /** 根据注解器转成需要的JSON格式 */
        let a = test.Serializable();
        /** 根据JSON字符串 和类型 生成带有原型实体的对象 */
        let obj = JsonConvert.InstanceOf<TestMoel>(TestMoel, '{"name":"123","age":12,"inner":{"name":"666","age":888,"inner":null,"array":null,"modelarray":null},"array":[1,2,3],"modelarray":[{"name":null,"age":null,"inner":null,"array":null,"modelarray":null},{"name":null,"age":null,"inner":null,"array":null,"modelarray":null}]}');

        debugger
        /** 新增数组特性 */
        this.list.push(test);
        /** 批量序列化 */
        let objlist = this.list.SerializableList();
        let str = this.list.SerializableListStringify();
        /** 数组批量还原 */
        this.list = JsonConvert.ListOf<TestMoel>(TestMoel, str);

        debugger

    }
}