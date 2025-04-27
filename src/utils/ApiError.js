class ApiError extends Error {
  constructor(
    message = "user not found", 
    statusCode,
    errors = [],
    stack = ""
){
   super(message);
   this.statusCode = statusCode || 400;
   this.data = null;
   this.message = message || "user not found";
   this.success = false;
   this.errors = errors || null;
   if (stack) {
     this.stack = stack;
   }
   Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };