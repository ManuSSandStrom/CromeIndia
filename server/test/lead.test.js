import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLead} from '../src/validators/lead.js';

test('accepts valid lead and normalizes bounded fields',()=>{
 const result=parseLead({name:'  Alex Kumar ',email:'ALEX@EXAMPLE.COM',message:'Building a cricket facility',consent:'true',phone:' 123 '.repeat(30),preferredContact:'sms',sourcePage:'/request-quote'});
 assert.equal(result.error,undefined);assert.equal(result.value.name,'Alex Kumar');assert.equal(result.value.email,'alex@example.com');assert.equal(result.value.phone.length,24);assert.equal(result.value.preferredContact,'');assert.equal(result.value.sourcePage,'/request-quote');
});
test('rejects invalid or incomplete lead submissions',()=>{
 assert.match(parseLead({name:'Alex',email:'alex@example.com',message:'A project'}).error,/confirm/);
 assert.match(parseLead({name:'A',email:'bad',message:'ok',consent:true}).error,/name/);
 assert.match(parseLead({name:'Alex',email:'bad',message:'valid message',consent:true}).error,/email/);
 assert.match(parseLead({name:'Alex',email:'alex@example.com',message:'no',consent:true}).error,/message/);
});
