import React,{createContext,useContext,useEffect,useState} from 'react';import {api} from '../lib/api.js';import {settings} from '../data/content.js';
const SiteContext=createContext(settings);
export function SiteProvider({children}){const[value,setValue]=useState(settings);useEffect(()=>{api.get('/settings').then(r=>{const data=r.data.data||{};setValue({...settings,...data,social:{...settings.social,...data.social},phones:Array.isArray(data.phones)&&data.phones.length?data.phones:settings.phones,markets:Array.isArray(data.markets)&&data.markets.length?data.markets:settings.markets})}).catch(()=>{})},[]);return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>}
export function useSiteSettings(){return useContext(SiteContext)}
