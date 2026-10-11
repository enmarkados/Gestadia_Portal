import React from 'react';
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { render,cleanup,screen,fireEvent,waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from './Contact.jsx';
const mocked=vi.hoisted(()=>({request:vi.fn(),close:vi.fn()}));
vi.mock('./api.js',()=>({request:mocked.request}));
vi.mock('./AppContext.jsx',()=>({useApp:()=>({data:{profile:{nombre:'Ana',apellidos:'Prueba',telefono:'600000000'}}})}));
beforeEach(()=>{mocked.request.mockReset();mocked.close.mockReset();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};});
afterEach(cleanup);
const mount=()=>render(<MemoryRouter initialEntries={['/tramites']}><Contact onClose={mocked.close}/></MemoryRouter>);
it('sin asignación muestra solicitud de llamada, conserva clave en reintento y no abre LidIA',async()=>{
 let calls=0;const keys=[];mocked.request.mockImplementation(async(path,o)=>{
  if(path.endsWith('/context'))return {kind:'call'};
  expect(path).toBe('/api/app/contact/callback');keys.push(o.headers['Idempotency-Key']);expect(JSON.parse(o.body)).toEqual({nombre:'Ana Prueba',telefono:'600000000'});
  if(!calls++)throw Error('offline');return {status:'confirmed'};
 });mount();await screen.findByText(/Déjanos tu nombre/);fireEvent.click(screen.getByRole('button',{name:'Solicitar llamada de un gestor'}));
 await screen.findByRole('alert');expect(screen.getByLabelText('Teléfono de contacto')).toHaveValue('600000000');
 fireEvent.click(screen.getByRole('button',{name:'Solicitar llamada de un gestor'}));await screen.findByText('Llamada solicitada');expect(keys[0]).toBe(keys[1]);expect(mocked.close).not.toHaveBeenCalled();
});
it('asignación real muestra nombre y abre únicamente la conversación confirmada del gestor',async()=>{
 mocked.request.mockImplementation(async(path)=>path.endsWith('/context')?{kind:'manager',manager_name:'Juan Carlos García',case_ref:'case1'}:{pending:false,conversation:{id:'gestor-chat',case_ref:'case1'}});
 mount();const open=await screen.findByRole('button',{name:'Abrir chat con Juan Carlos García'});fireEvent.click(open);
 await waitFor(()=>expect(mocked.close).toHaveBeenCalledWith(expect.any(Function)));
 expect(mocked.request.mock.calls[1][0]).toBe('/api/app/contact/chat');expect(mocked.request.mock.calls.some(([path])=>path.includes('/app/v1/conversations'))).toBe(false);
});
it('resultado CRM incierto no anuncia que el gestor ha recibido ni ofrece reenviar',async()=>{
 mocked.request.mockImplementation(async(path)=>path.endsWith('/context')?{kind:'call'}:{status:'pending_confirmation'});mount();await screen.findByText(/Déjanos tu nombre/);
 fireEvent.click(screen.getByRole('button',{name:'Solicitar llamada de un gestor'}));await screen.findByText('Solicitud registrada');expect(screen.queryByText('Llamada solicitada')).toBeNull();expect(screen.queryByRole('button',{name:'Solicitar llamada de un gestor'})).toBeNull();
});
