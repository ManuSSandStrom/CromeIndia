import { api } from './api.js';

export function trackEvent(event,target='',metadata={}){
  const page=typeof window==='undefined'?'':`${window.location.pathname}${window.location.search}`;
  api.post('/analytics/events',{event,page,target,metadata},{timeout:2500}).catch(()=>{});
}
