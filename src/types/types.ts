export type Id = string;

export interface AnyObject {
    [key: string]: any;
};

export interface AnyItem extends AnyObject {
    id: Id;
};

export interface AnyRecord<T> {
    [key: string]: T;
};
