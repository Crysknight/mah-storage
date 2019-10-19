import { AnyObject, AnyItem, Id } from '$types';

export type RawItem = AnyObject;
export interface Item extends AnyItem {
    __deleted?: boolean;
};
export type CollectionTypeRaw = Array<AnyObject>;
export type CollectionType = Array<Item>;
export type IdsArray = Array<Id>;
