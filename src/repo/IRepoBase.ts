export interface IRepoBase<T> {
    get(id: number): Promise<T | null>;
    getAll(): Promise<T[]>;
    create(item: T): Promise<T>;
    update(item: T): Promise<T>;
    delete(id: number): Promise<void>;
}