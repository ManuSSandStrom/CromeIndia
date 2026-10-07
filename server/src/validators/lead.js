const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
export function parseLead(input={}){
 const name=field(input.name,100),email=field(input.email,160).toLowerCase(),message=field(input.message,2000);
 const requestTypes=['enquiry','quote','call','product-finder','product','sports','service','assistant','whatsapp'];
 const requestType=requestTypes.includes(input.requestType)?input.requestType:'enquiry';
 if(input.consent!=='true'&&input.consent!==true)return {error:'Please confirm that Crome India may contact you about this enquiry.'};
 if(name.length<2)return {error:'Please enter your name.'};
 if(requestType==='call'&&!field(input.phone,24))return {error:'Please enter a phone number for the call request.'};
 if(!email&&requestType!=='call')return {error:'Please enter your email address.'};
 if(email&&!emailPattern.test(email))return {error:'Please enter a valid email address.'};
 if(message.length<4)return {error:'Please include a short project message.'};
 const area=Number(input.areaValue);
 return {value:{name,email,message,consentGiven:true,company:field(input.company,140),phone:field(input.phone,24),city:field(input.city,100),state:field(input.state,100),sport:field(input.sport,100),application:field(input.application,140),product:field(input.product,140),areaValue:Number.isFinite(area)&&area>0?area:undefined,areaUnit:['sq ft','sq m'].includes(input.areaUnit)?input.areaUnit:'',interestedService:field(input.interestedService,120),projectType:field(input.projectType,100),requestType,preferredContact:['email','phone','whatsapp'].includes(input.preferredContact)?input.preferredContact:'',preferredContactTime:field(input.preferredContactTime,120),sourcePage:field(input.sourcePage,300),landingPage:field(input.landingPage,300),referrer:field(input.referrer,500),utm:{source:field(input.utmSource,150),medium:field(input.utmMedium,150),campaign:field(input.utmCampaign,150),content:field(input.utmContent,150),term:field(input.utmTerm,150)}}};
}
