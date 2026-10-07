import mongoose from 'mongoose';
const adminSchema=new mongoose.Schema({email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true},role:{type:String,enum:['ADMIN','EDITOR'],default:'ADMIN'},active:{type:Boolean,default:true}},{timestamps:true});export default mongoose.model('Admin',adminSchema);
