
export class errorWithStatusCode extends Error {
    public statusCode: number

    constructor(message: string, statusCode : number) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}