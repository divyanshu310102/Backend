class ApiError extends Error {
    constructor(
        message = "something went wrong",
        errors = [],
        stack = "", 
        statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null,
        this.message = message
        this.success = false

        if(stack) {
            this.stack = stack;
        } else{
            Error.captureStackTrace(this, this.constructor);
        }
    }

};

