import { JsonProp, JsonSerializable, JsonModel, JsonModelArray, JsonPropArray } from './../_base/jsonModify';
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

    /** 标识为一般值类型的属性用JsonProp */
    @JsonProp()
    public get age(): number {
        return this._age;
    }

    public set age(value: number) {
        this._age = value;
    }

    private _age: number;

    /** 标识为引用类型的属性用JsonModel PS: 该引用类型必须继承 JsonSerializable<T>  */
    @JsonModel(TestMoel)
    public get inner(): TestMoel {
        return this._inner;
    }

    public set inner(value: TestMoel) {
        this._inner = value;
    }

    private _inner: TestMoel;

     /** 标识为值类型数组 一般为string[] number[] */
    @JsonPropArray()
    public get array(): number[] {
        return this._array;
    }
    public set array(value: number[]) {
        this._array = value;
    }

    private _array: number[];

    /** 标识为引用类型数组 PS：目前只支持单一类型数组，且该类型同样需要继承 JsonSerializable<T>  */
    @JsonModelArray(TestMoel)
    public get modelarray(): TestMoel[] {
        return this._modelarray;
    }

    public set modelarray(value: TestMoel[]) {
        this._modelarray = value;
    }
    private _modelarray: TestMoel[];
}