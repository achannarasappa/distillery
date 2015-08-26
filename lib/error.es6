const _ = require('lodash');

class DistilleryError extends Error {
  constructor(message) {

    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;

  }
}

class DistilleryValidationError extends DistilleryError {

  constructor(message) {

    super(message);

  }

}

class DistilleryStillError extends DistilleryError {

  constructor(message) {

    super(message);
    
  }

}

class DistilleryResponseError extends DistilleryError {

  constructor(message) {

    super(message);

  }

}

export { DistilleryError, DistilleryValidationError, DistilleryStillError, DistilleryResponseError }
