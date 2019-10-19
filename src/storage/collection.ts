import { itemArrayUpdate, asyncProxifiedBy, objectClone, itemArrayAdd } from '$utils';
import { AnyObject, Id, isArrayOfAnyItem, AnyItem } from '$types';
import { MESSAGES } from '$constants';

import StorageEntity from './storage_entity';
import { isObject } from '$utils';

import Query, { QueryType } from './query';

import {
    CollectionTypeRaw,
    CollectionType,
    Item,
    RawItem,
    IdsArray
} from './collection.types';

interface SearchOptions {
    withDeleted?: boolean;
}
interface ReadOptions extends SearchOptions {
    onlyDeleted?: boolean;
}
interface FindOptions extends SearchOptions {
    first?: boolean;
    last?: boolean;
}
interface Aggregation<Item> {
    item?: Item;
    items?: CollectionType;
    id?: Id;
    ids?: IdsArray;
    query?: QueryType<Item>;
}
interface UpdateOptions extends SearchOptions {
    rewrite?: boolean;
}
interface UpdateParams<Item> extends Aggregation<Item> {
    payload?: AnyObject;
    callback?: (item: Item) => void;
    options?: UpdateOptions;
}
interface DeleteOptions {
    soft?: boolean;
}
interface DeleteParams<Item> extends Aggregation<Item> {
    options?: DeleteOptions;
}
export default class Collection<ItemType extends AnyItem> extends StorageEntity<ItemType> {
    private static Query = Query;

    constructor(nameSpace: string, name: string) {
        super(nameSpace, name, []);
    }

    @asyncProxifiedBy('initializeProxy')
    public async create(item: RawItem): Promise<Item> {
        const state = await this.read();

        const newItem: Item = {
            id: Collection.Storage.createId(),
            ...item
        };
        const newState = [...state, newItem];

        await this.save(newState);

        return newItem;
    }

    @asyncProxifiedBy('initializeProxy')
    public async read(options?: ReadOptions): Promise<CollectionType> {
        const {
            withDeleted = false,
            onlyDeleted = false
        } = options || {};

        const state = await Collection.Storage.get(this.fullName);

        if (!isArrayOfAnyItem(state)) {
            throw new Error(MESSAGES.STORAGE_WRONG_FORMAT);
        }

        if (withDeleted) {
            return state;
        } else if (onlyDeleted) {
            return state.filter(({ __deleted }) => !__deleted);
        }

        return state.filter(({ __deleted }) => !__deleted);
    }

    @asyncProxifiedBy('initializeProxy')
    public async find(
        param1: Id | QueryType,
        options?: FindOptions,
        state?: CollectionType
    ): Promise<Item | null> {
        const id = typeof param1 === 'string' ? param1 : null;
        const query = isObject(param1) ? param1 : null;

        const resolvedState = state || await this.read(options);

        let item: Item | null;
        if (id) {
            item = resolvedState.find(item => item.id === id);
        } else if (query) {
            const { last } = options;
            const first = options.first || !last;

            item = Collection.Query.exec<Item>(
                resolvedState,
                query,
                { first, last }
            ) as Item | null;
        }

        return item || null;
    }

    @asyncProxifiedBy('initializeProxy')
    public async filter(
        query: QueryType<Item>,
        options?: SearchOptions,
        state?: CollectionType
    ): Promise<CollectionType> {
        const resolvedState = state || await this.read(options);

        return Collection.Query.exec<Item>(
            resolvedState,
            query,
            { clone: false }
        ) as CollectionType;
    }

    @asyncProxifiedBy('initializeProxy')
    public async update(params: UpdateParams<Item>): Promise<CollectionType> {
        const {
            item,
            items,
            id,
            ids,
            query,
            payload,
            callback,
            options = {}
        } = params;

        if (
            (
                !item && !items &&
                (
                    (!id && !query && !ids) ||
                    !payload
                )
            )
        ) {
            throw new Error(MESSAGES.UPDATE_WRONG_ARGUMENTS);
        }

        const state = await this.read(options);

        const newItems = await this.aggregate(
            state,
            {
                item,
                items,
                id,
                ids,
                query
            },
            options
        );

        newItems.forEach(callback);

        const newState = itemArrayUpdate(
            state,
            newItems,
            { mutate: false, whole: options.rewrite }
        );

        await this.save(newState);

        return newState;
    }

    @asyncProxifiedBy('initializeProxy')
    public async delete(params: DeleteParams<Item>): Promise<IdsArray> {
        const {
            item,
            items,
            id,
            ids,
            query,
            options = {}
        } = params;

        const state = await this.read();

        const itemsToDelete = await this.aggregate(
            state,
            {
                item,
                items,
                id,
                ids,
                query
            }
        );
        const itemsToDeleteIds: Array<Id> = itemsToDelete.map(({ id }) => id);

        const newState = state.reduce((newState, item): CollectionType => {
            if (itemsToDeleteIds.includes(item.id)) {
                if (options.soft) {
                    const newItem = objectClone<Item>(item);
                    newItem.__deleted = true;
                    newState.push(newItem);
                }
            } else {
                newState.push(item);
            }

            return newState;
        }, []);

        await this.save(newState);

        return ids;
    }

    @asyncProxifiedBy('initializeProxy')
    public async purge(ids?: IdsArray): Promise<IdsArray> {
        const state = await this.read({ withDeleted: true });

        const resolvedIds: IdsArray = ids
            ? ids
            : state.reduce((ids: IdsArray, { id, __deleted }) => {
                if (__deleted) {
                    ids.push(id);
                }

                return ids;
            }, []);

        const newState = state.filter(({ id }) => !resolvedIds.includes(id));

        await this.save(newState);

        return resolvedIds;
    }

    @asyncProxifiedBy('initializeProxy')
    public async restore(ids: IdsArray): Promise<IdsArray> {
        const state = await this.read({ withDeleted: true });

        const newState = state.map(item => {
            if (ids.includes(item.id)) {
                item.__deleted = false;
            }

            return item;
        });

        await this.save(newState);

        return ids;
    }

    private async aggregate(
        state: CollectionType,
        aggregation: Aggregation<Item>,
        options?: SearchOptions
    ): Promise<CollectionType> {
        const {
            item,
            items,
            id,
            ids,
            query
        } = aggregation;

        const aggregatedItems: CollectionType = [];

        if (item) {
            aggregatedItems.push(objectClone<Item>(item));
        }

        if (items) {
            items.forEach(item => {
                itemArrayAdd(aggregatedItems, objectClone<Item>(item));
            });
        }

        if (id) {
            const foundItem = await this.find(id, options, state);
            itemArrayAdd(aggregatedItems, foundItem);
        }

        if (ids) {
            const query: QueryType = {
                id: { __in: ids }
            };
            const foundItems = await this.filter(query, options, state);
            foundItems.forEach(item => {
                itemArrayAdd(aggregatedItems, item);
            });
        }

        if (query) {
            const foundItems = await this.filter(query, options, state);
            foundItems.forEach(item => {
                itemArrayAdd(aggregatedItems, item);
            });
        }

        return aggregatedItems;
    }
}

export {
    CollectionTypeRaw,
    CollectionType,
    AnyItem
}
