const _ = require('lodash');

class CustomError extends Error {
  constructor(message) {

    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;

  }
}

class DistilleryValidationError extends CustomError {

  constructor(message) {

    super(message);

  }

}

class DistilleryStillError extends CustomError {

  constructor(message) {

    super(message);
    
  }

}

export { DistilleryValidationError, DistilleryStillError }
