import { collectionItems, CollectionItemsItem } from './data';
import Query from '$storage/query';

describe('Query', () => {
    test(
        'filters by simple object',
        async () => {
            const result = Query.exec<CollectionItemsItem>(collectionItems, { married: true });
            const expectedResult = [collectionItems[1], collectionItems[3]];

            expect(result).toEqual(expectedResult);
        }
    )
});