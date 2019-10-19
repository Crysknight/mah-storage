import { Dispatcher, asyncDispatch, asyncProxifiedBy } from '$utils';

import Storage from './storage';

export default class StorageEntity<EntityType> extends Dispatcher {
    protected static Storage = Storage;

    private initialized = false;

    public get fullName(): string {
        return `${this.nameSpace}_${this.name}`;
    }

    protected constructor(
        private readonly nameSpace: string,
        private readonly name: string,
        private readonly initialState: Omit<EntityType, 'id'>[]
    ) {
        super();
        this.init();
    }

    @asyncDispatch
    private async init(): Promise<void> {
        await StorageEntity.Storage.register(
            this.fullName,
            this.initialState
        );
        this.initialized = true;
    }

    private async initializeProxy(): Promise<void> {
        if (this.initialized) {
            return;
        }

        return new Promise((resolve, reject): void => {
            this.$subscribe('init', resolve);
            this.$subscribe('errorer_init', reject);
        });
    }

    @asyncProxifiedBy('initializeProxy')
    protected async save(newState: EntityType): Promise<void> {
        await StorageEntity.Storage.set(this.fullName, newState);
    }
}
