'use strict';

export function asyncUpdate(callback) {
  $effect(()=>{
  });
  return callback();
}

export function func1(v) {
  console.log(v);
}