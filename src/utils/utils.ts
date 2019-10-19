import { AnyObject, AnyItem, isAnyItem } from '../types';

export const isObject = (target: any): target is AnyObject => {
    return Object.prototype.toString.call(target) === '[object Object]';
}

export const isObjectEmpty = (object: AnyObject): boolean => {
    return Object.getOwnPropertyNames(object).length === 0;
};

export const objectClone = <T>(object: T): T => {
    return JSON.parse(JSON.stringify(object));
};

interface UpdateOptions {
    mutate?: boolean;
    whole?: boolean;
}
export const itemArrayUpdate = <Item extends AnyItem>(
    array: Array<Item>,
    param2: Item | Array<Item>,
    options?: UpdateOptions
): Array<Item> => {
    const { mutate = true, whole = true } = options || {};
    const itemsToUpdate = isAnyItem(param2) ? [param2] : param2;
    const newArray = mutate ? array : objectClone<Item[]>(array);

    itemsToUpdate.forEach(item => {
        const itemIndex: number = array.findIndex(({ id }): boolean => id === item.id);
        if (itemIndex !== -1) {
            const oldItem = array[itemIndex];
            const newItem = whole ? item : { ...oldItem, ...item };
    
            newArray.splice(itemIndex, 1, newItem);
        }
    });

    return newArray;
};

export const itemArrayAdd = <Item extends AnyItem>(
    array: Array<Item>,
    item: Item
): void => {
    if (array.every(({ id }) => id !== item.id)) {
        array.push(item);
    }
}

export const arrayDelete = (array: Array<any>, item: any, mutate: boolean = true) => {
    const itemIndex: number = array.indexOf(item);
    if (itemIndex !== -1) {
        const newArray = mutate ? array : [...array];

        newArray.splice(itemIndex, 1);

        return new Array;
    }
};

export const arrayLast = <T>(array: Array<T>): T => {
    return array[array.length - 1];
};

export const stringRandom = (length: number = 9): string => {
    return Math.random().toString(36).substr(2, length);
};

export const pause = (duration: number = 300) => new Promise(resolve => {
    setTimeout(resolve, duration);
});
