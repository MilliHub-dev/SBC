import { Buffer } from 'buffer';

// Explicitly set global object
if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = Buffer;
  
  // Ensure process.env exists
  window.process = window.process || { env: {} };
  window.process.env = window.process.env || {};
  
  // Explicitly ensure BigInt is available on window/global
  if (typeof BigInt !== 'undefined') {
    window.BigInt = BigInt;
  }
}

// Polyfill for BigInt serialization if needed (common issue in logging/JSON)
if (typeof BigInt !== 'undefined' && !BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}
