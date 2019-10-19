import { AnyObject, AnyItem } from './types';

export interface typeGuardFunction<T> {
    (target: any): target is T
};

export const isAnyObject: typeGuardFunction<AnyObject> =
    (target: any): target is AnyObject => {
        return Object.prototype.toString.call(target) === '[object Object]';
    };

export const isAnyArray: typeGuardFunction<any[]> =
    (target: any): target is Array<any> => {
        return Array.isArray(target);
    };

export const isAnyItem: typeGuardFunction<AnyItem> =
    (target: any): target is AnyItem => {
        if (!isAnyObject(target)) {
            return false;
        }

        return !!target.id;
    };

export const isArrayOf = <T>(
    target: any,
    typeGuard: typeGuardFunction<T>
): target is Array<T> => {
    if (!isAnyArray(target)) {
        return false;
    }

    return target.every((item: any) => {
        return typeGuard(item);
    });
};

export const isArrayOfAnyItem: typeGuardFunction<AnyItem[]> =
    (target: any): target is AnyItem[] => {
        return isArrayOf(target, isAnyItem);
    };
