import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppGuestService } from '../app/v2/guest.js';
import { randomUUID } from 'node:crypto';
import { problem } from '../app/problem.js';
export function createAppGuestRouter({db,config,service=new AppGuestService(db,config)}) {
 const router=Router();router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});
 router.use(rateLimit({windowMs:60000,limit:90,standardHeaders:true,legacyHeaders:false}));
 router.post('/installations',rateLimit({windowMs:3600000,limit:10,standardHeaders:true,legacyHeaders:false}),async(req,res,next)=>{try{if(Object.keys(req.body||{}).length)return res.status(400).json({code:'invalid_payload'});res.status(201).json(await service.installation());}catch(e){next(e);}});
 router.use(async(req,res,next)=>{try{req.guestActor=await service.actor(req.get('X-App-Guest'),req.get('Authorization')?.replace(/^Bearer /,''));next();}catch(e){next(e);}});
 const handle=fn=>async(req,res,next)=>{try{res.json(await fn(req));}catch(e){next(e);}};
 router.get('/conversations',handle(req=>service.list(req.guestActor)));
 router.post('/conversations',handle(req=>service.start(req.guestActor,req.body,req.get('Idempotency-Key'))));
 router.patch('/conversations/:id',handle(req=>service.rename(req.guestActor,req.params.id,req.body)));
 router.get('/conversations/:id/timeline',handle(req=>service.timeline(req.guestActor,req.params.id,req.query)));
 router.post('/conversations/:id/turns',handle(req=>service.turn(req.guestActor,req.params.id,req.body)));
 router.get('/conversations/:id/message-receipts',handle(req=>service.receipts(req.guestActor,req.params.id,req.query)));
 router.post('/conversations/:id/message-receipts',handle(req=>service.receipts(req.guestActor,req.params.id,{},req.body,req.get('Idempotency-Key'))));
 router.post('/conversations/:id/bind',handle(req=>service.bind(req.guestActor,req.params.id)));
 router.get('/operations/:id',handle(req=>service.operation(req.guestActor,req.params.id)));
 router.post('/operations/:id/retry',handle(req=>service.operation(req.guestActor,req.params.id,true)));
 router.use((error,req,res,next)=>problem(res,error,randomUUID()));
 return router;
}
