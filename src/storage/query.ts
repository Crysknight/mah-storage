import { AnyObject } from '$types';
import { MESSAGES } from '$constants';
import { objectClone } from '$utils';

enum Conjuction {
    AND,
    OR
}
export { Conjuction };

export interface QueryNotation {
    __not?: any;
    __in?: Array<any>;
    __nin?: Array<any>;
    __gt?: Number;
    __lt?: Number;
    __gte?: Number;
    __lte?: Number;
};
export const isQueryNotation = (value: any): value is QueryNotation => {
    if (!value) {
        return false;
    }

    const {
        __not,
        __in,
        __nin,
        __gt,
        __lt,
        __gte,
        __lte
    } = value;
    return (
        __not !== undefined ||
        __in !== undefined ||
        __nin !== undefined ||
        __gt !== undefined ||
        __lt !== undefined ||
        __gte !== undefined ||
        __lte !== undefined
    );
};

export interface QueryType<Item> {
    __type?: Conjuction;
    __filter?: (item: Item) => boolean;
    [key: string]: any | QueryNotation;
};

interface ExecOptions<Item> {
    first?: boolean;
    last?: boolean;
    clone?: boolean;
    callback?: (item: Item) => void;
}
enum Comparation {
    GT,
    LT,
    GTE,
    LTE
}
class Query {
    public exec<Item extends AnyObject>(
        items: Array<Item>,
        query: QueryType<Item>,
        options: ExecOptions<Item> = {}
    ): Item | Array<Item> | null {
        const { first, last, clone = true, callback } = options;

        if (first) {
            for (let item of items) {
                const queriedItem = this.queryItem<Item>(query, item, clone, callback);
                if (queriedItem) {
                    return queriedItem;
                }
            }

            return null;
        } else if (last) {
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                const queriedItem = this.queryItem<Item>(query, item, clone, callback);
                if (queriedItem) {
                    return queriedItem;
                }
            }

            return null;
        }

        return items.reduce((queriedItems, item): Array<Item> => {
            const queriedItem = this.queryItem<Item>(query, item, clone, callback);
            if (queriedItem) {
                queriedItems.push(queriedItem);
            }

            return queriedItems;
        }, []);
    }

    private queryItem<Item>(
        query: QueryType<Item>,
        item: Item,
        clone: boolean,
        callback?: (item: Item) => void
    ): Item | null {
        if (this.matchItem<Item>(query, item)) {
            const newItem = clone ? objectClone<Item>(item) : item;
            if (callback) {
                callback(newItem);
            }

            return newItem;
        }

        return null;
    }

    private matchItem<Item>(query: QueryType<Item>, item: Item): boolean {
        const { __type, __filter } = query;
        let isMatchingByQuery: boolean;
        if (__type === Conjuction.AND || __type === undefined) {
            isMatchingByQuery = Object.keys(query).every(key => {
                return this.matchParam(item[key], query[key]);
            });
        } else if (__type === Conjuction.OR) {
            isMatchingByQuery = Object.keys(query).some(key => {
                return this.matchParam(item[key], query[key]);
            });
        }

        if (!isMatchingByQuery) {
            return false;
        }

        if (__filter) {
            return __filter(item);
        }

        return true;
    }

    private matchParam(param: any, queryParam: any | QueryNotation): boolean {
        if (!isQueryNotation(queryParam)) {
            return this.is(param, queryParam);
        } else {
            const {
                __not,
                __in,
                __nin,
                __gt,
                __lt,
                __gte,
                __lte
            } = queryParam;

            if (__not && this.is(param, __not)) {
                return false;
            }

            if (__in && !this.isIn(param, __in)) {
                return false;
            }

            if (__nin && this.isIn(param, __nin)) {
                return false;
            }

            if (__gt && this.compare(param, __gt, Comparation.LTE)) {
                return false;
            }

            if (__lt && this.compare(param, __lt, Comparation.GTE)) {
                return false;
            }

            if (__gte && this.compare(param, __gte, Comparation.LT)) {
                return false;
            }

            if (__lte && this.compare(param, __lte, Comparation.GT)) {
                return false;
            }

            return true;
        }
    }

    private is(param: any, value: any): boolean {
        return JSON.stringify(param) === JSON.stringify(value);
    }

    private isIn(param: any, __in: Array<any>): boolean {
        return __in.some((value): boolean => {
            return this.is(param, value);
        });
    }

    private compare(
        param: Number | String,
        value: Number | String,
        comparation: Comparation
    ): boolean {
        if (typeof param !== 'number' && typeof param !== 'string') {
            throw new Error(MESSAGES.QUERY_WRONG_OPERATION);
        }

        switch (comparation) {
            case Comparation.GT: {
                return param > value;
            }
            case Comparation.LT: {
                return param < value;
            }
            case Comparation.GTE: {
                return param >= value;
            }
            case Comparation.LTE: {
                return param <= value;
            }
        }
    }
}

export default new Query();
