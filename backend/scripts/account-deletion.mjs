// Herramienta operativa privada; no hay endpoint de administración público.
import fs from 'node:fs/promises';
import { db } from '../src/db.js';
import { createDeletionReview } from '../src/services/account-deletion-review.js';
import { accountDeletion } from '../src/services/account-deletion.js';

const [command,userId,...args]=process.argv.slice(2);
const options=Object.fromEntries(args.flatMap((value,index)=>value.startsWith('--')?[[value.slice(2),args[index+1]]]:[]));
const review=createDeletionReview({db});
process.umask(0o077);
let output;
async function writeResult(data) {
  await output.writeFile(JSON.stringify(data,null,2)+'\n');
  console.log('Resultado guardado en archivo privado.');
}
try {
  if (!userId) throw new Error('Uso: account-deletion.mjs inventory|review|retained|queue|retry-mail USER_ID --out ARCHIVO [--decision JSON --execute yes --actor REF --authority REF]');
  if (!options.out) throw new Error('Se requiere --out con ruta de archivo privado nuevo');
  output=await fs.open(options.out,'wx',0o600);
  if (command==='inventory') await writeResult(await review.inventory(userId));
  else if(command==='intake') {
    if(options.execute!=='yes'||options.verified!=='yes') throw new Error('Titularidad comprobada: requiere --execute yes --verified yes --actor REF --authority REF');
    await writeResult(await accountDeletion.requestVerified(userId,{actorRef:options.actor,authorityRef:options.authority,verified:true}));
  }
  else if (command==='review') {
    const decision=JSON.parse(await fs.readFile(options.decision,'utf8'));
    const inventory=await review.inventory(userId);
    const {validateDeletionDecision}=await import('../src/services/account-deletion-review.js');
    validateDeletionDecision(decision,inventory);
    if(options.execute!=='yes') await writeResult({preview:true,inventory,decision,warning:'Registrar esta revisión permite que el worker complete la baja y elimine el perfil de cuenta. No registra ni ejecuta nada sin --execute yes.'});
    else await writeResult({reviewId:(await review.record(userId,decision)).id,registered:true});
  } else if (command==='retained') await writeResult(await review.readRetained(userId,{actorRef:options.actor,authorityRef:options.authority}));
  else if(command==='queue') {
    await writeResult(await db.accountDeletionRequest.findMany({select:{id:true,userId:true,status:true,requestedAt:true,completedAt:true,result:true,notificationStatus:true,notificationAttempts:true},take:100,orderBy:{requestedAt:'asc'}}));
  } else if(command==='retry-mail') {
    if(options.execute!=='yes'||!options.actor||!options.authority) throw new Error('Reintento requiere --execute yes --actor REF --authority REF');
    await db.$transaction(async tx=>{
      const request=await tx.accountDeletionRequest.findUnique({where:{userId}});
      if(!request||request.notificationStatus!=='failed'||!request.contactEmailEncrypted) throw new Error('No hay comunicación fallida con destino pendiente');
      const updated=await tx.accountDeletionRequest.updateMany({where:{id:request.id,notificationStatus:'failed'},data:{notificationStatus:'pending',notificationAttempts:0,notificationNextAttempt:null,notificationClaimId:null,notificationLockedUntil:null}});
      if(updated.count!==1) throw new Error('Comunicación modificada concurrentemente');
      await tx.accountDeletionReview.create({data:{requestId:request.id,action:'retry_mail',actorRef:options.actor,authorityRef:options.authority,inventoryHash:'completed',decision:{reason:options.authority}}});
    });
    await writeResult({queued:true});
  } else throw new Error('Comando no reconocido');
} catch(error) {
  // No imprimir errores Prisma con registros o valores privados.
  console.error(error.code?'Operación no completada; revisar la base de datos y el archivo de entrada privado.':error.message);
  process.exitCode=1;
} finally {await output?.close();await db.$disconnect();}
