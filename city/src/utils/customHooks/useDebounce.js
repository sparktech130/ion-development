/* Author C1115130EF230517 */

import { useEffect, useRef } from 'react';

const debounce = (...args) => {
  let callback;
  let millis = 300;
  let instantCallback;


  //get values, their order can bary
  //useDebounce(  callback, millis   )
  //useDebounce(  millis,   callback )
  //useDebounce(  callback, instantCallback,  millis  )
  //useDebounce(  callback, millis,           instantCallback )
  //useDebounce(  millis,   callback,         instantCallback )
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (typeof arg === 'function') {
      if (!callback) {
        callback = arg;
      } else if (!instantCallback) {
        instantCallback = arg;
      }
    } else if (typeof arg === 'number') {
      millis = arg;
    }
  }




  const timeoutRef = useRef(null);

  const debouncedFunction = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (instantCallback) {
      instantCallback(...args);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, millis);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return debouncedFunction;
};

export default debounce;