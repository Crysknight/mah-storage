import { isObjectEmpty, stringRandom } from '$utils';

type LastError = typeof chrome.runtime.lastError;

class Storage {
    private storage = chrome.storage.sync;
    private _lastError: LastError;
    private get lastError(): LastError | undefined {
        const { lastError } = chrome.runtime;

        if (lastError === this._lastError) {
            return undefined;
        }

        this._lastError = lastError;
        return lastError;
    }

    public createId(): string {
        return stringRandom();
    }

    public async register(
        entityName: string,
        initialState: any
    ): Promise<void> {
        const state = await this.get(entityName);
        if (state) {
            return;
        }

        await this.set(entityName, initialState);
    }

    public get(entityNameWithId: string): Promise<any> {
        return new Promise((resolve, reject): void => {
            this.storage.get(entityNameWithId, (result?: any): void => {
                const { lastError } = this;
                if (lastError) {
                    reject(lastError);
                    return;
                } else if (isObjectEmpty(result)) {
                    resolve();
                    return;
                }

                resolve(result[entityNameWithId]);
            });
        });
    }

    public set(entityNameWithId: string, state: any): Promise<void> {
        return new Promise((resolve, reject): void => {
            this.storage.set({ [entityNameWithId]: state }, (): void => {
                const { lastError } = this;
                if (lastError) {
                    reject(lastError);
                } else {
                    resolve();
                }
            });
        });
    }
}

export default new Storage();
