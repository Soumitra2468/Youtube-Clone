class ApiError extends Error {
  constructor(
    message = "Internal Server Error", 
    statusCode,
    errors = [],
    stack = ""
){
   super(message);
   this.statusCode = statusCode || 500;
   this.data = null;
   this.message = message || "Internal Server Error";
   this.success = false;
   this.errors = errors || null;
   if (stack) {
     this.stack = stack;
   }
   Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };