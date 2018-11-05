import { Subject } from 'rxjs';
export declare function JsonProp(check?: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function JsonModel(T: any, check?: boolean, recursion?: boolean): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
export declare function JsonPropArray(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function JsonModelArray(T: any): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare abstract class JsonSerializable {
    $call: Subject<any>;
    $watch: Function | undefined;
    constructor();
    $check(): void;
    Serializable(): string;
    SerializableObject(): any;
    private Subline(item);
}
export declare class JsonConvert {
    static InstanceOf<T>(T: any, json: string): T | null;
    /**
     * static ListOf<T>
     */
    static ListOf<T extends JsonSerializable>(T: any, json: string): JsonList<T> | null;
    private static pullBuffer(item, standard);
}
export interface JsonList<T extends JsonSerializable> extends Array<T> {
    SerializableList?(): any[];
    SerializableListStringify?(): string;
}
