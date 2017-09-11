import { JsonProp, JsonSerializable, JsonModel, JsonModelArray, JsonPropArray } from './../_base/jsonModify';
export class TestMoel extends JsonSerializable<TestMoel> {
    
        constructor() {
            super();
        }
    
        private _name: string;
    
        @JsonProp()
        public get name(): string {
            return this._name;
        }
        public set name(value: string) {
            this._name = value;
        }
    
        @JsonProp()
        public get age(): number {
            return this._age;
        }
    
        public set age(value: number) {
            this._age = value;
        }
    
        private _age: number;
    
        @JsonModel(TestMoel)
        public get inner(): TestMoel {
            return this._inner;
        }
    
        public set inner(value: TestMoel) {
            this._inner = value;
        }
    
        private _inner: TestMoel;
    
        @JsonPropArray()
        public get array(): number[] {
            return this._array;
        }
        public set array(value: number[]) {
            this._array = value;
        }
    
        private _array: number[];
    
        @JsonModelArray(TestMoel)
        public get modelarray(): TestMoel[] {
            return this._modelarray;
        }
    
        public set modelarray(value: TestMoel[]) {
            this._modelarray = value;
        }
        private _modelarray: TestMoel[];
    }