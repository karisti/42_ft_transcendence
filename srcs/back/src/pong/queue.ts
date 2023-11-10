export class Queue<T>
{
    private elements: T[] = [];

    public enqueue(element: T): void {
        this.elements.push(element);
    }

    public dequeue(): T | undefined {
        return this.elements.shift();
    }

    public peek(): T | undefined {
        return this.elements[0];
    }

    public get length(): number {
        return this.elements.length;
    }

    public get isEmpty(): boolean {
        return this.length === 0;
    }
}