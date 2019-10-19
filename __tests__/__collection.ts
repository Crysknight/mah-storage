import { Collection } from '$storage';

const collection = new Collection('test', 'files');

const ITEM_1 = { name: 'Johnny', friends: true };
const ITEM_2 = { name: 'Mark', friends: true };

describe('Collection', () => {
    test(
        'is created without initial state',
        async () => {
            const state = await collection.read();
            expect(state).toEqual([]);
        }
    );
    test(
        'creates items',
        async () => {
            await collection.create(ITEM_1);
            let state = await collection.read();
            expect(state).toMatchObject([ITEM_1]);
            expect(state[0].id).toBeDefined();

            await collection.create(ITEM_2);
            state = await collection.read();
            expect(state).toMatchObject([ITEM_1, ITEM_2]);
        }
    );
    test(
        'finds items',
        async () => {
            let item1 = await collection.find({ name: ITEM_1.name });
            expect(item1).toMatchObject(ITEM_1);
            item1 = await collection.find({ friends: true });
            expect(item1).toMatchObject(ITEM_1);
        }
    );
    test(
        'finds many items',
        async () => {
            const items = await collection.filter({ friends: true });
            expect(items).toMatchObject([ITEM_1, ITEM_2]);
        }
    );
    test(
        'updates item',
        async () => {
            const item = await collection.find({ name: ITEM_1.name });
            item.married = true;
            await collection.update(item);
            const resultingItem = await collection.find({ name: ITEM_1.name });
            expect(resultingItem).toEqual(item);
        }
    );
    test(
        'deletes items softly',
        async () => {
            
        }
    );
});