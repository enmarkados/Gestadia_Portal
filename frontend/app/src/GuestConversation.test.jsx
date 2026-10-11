import React from 'react';
import { afterEach,beforeEach,it,expect,vi } from 'vitest';
import { render,cleanup,screen,fireEvent,waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppConversation from './AppConversation.jsx';
const f=vi.hoisted(()=>({installation:vi.fn(),start:vi.fn(),timeline:vi.fn(),list:vi.fn(),mode:'visitor',profile:null}));
vi.mock('./guestConversations.js',()=>({guestInstallation:f.installation,guestConversationApi:{start:f.start,timeline:f.timeline,list:f.list,messageReceipts:vi.fn(),ackMessages:vi.fn(),bind:vi.fn(async()=>{})}}));
vi.mock('./AppContext.jsx',()=>({useApp:()=>({mode:f.mode,data:{profile:f.profile}})}));
beforeEach(()=>{
 window.GESTADIA_APP_CONFIG={conversationsEnabled:true};f.mode='visitor';f.profile=null;
 f.installation.mockReset().mockResolvedValue({installation_id:'installation-1'});
 f.start.mockReset().mockResolvedValue({conversation:{id:'chat-guest',purpose:'sondeo',ready:true},operation:{status:'admitted'}});
 f.list.mockReset().mockResolvedValue({conversations:[{id:'chat-guest',purpose:'sondeo',case_ref:null,ready:true,protocol:'v2'}]});
 f.timeline.mockReset().mockResolvedValue({conversation_id:'chat-guest',items:[{message_id:'hello',sequence:'1',role:'assistant',text:'Pregunta literal del agente',occurred_at:'2026-10-11T10:00:00Z',presentation:null}],pending_operations:[],turn_statuses:[],permissions:['sondeo','history'],state_revision:'1',has_more:false});
});
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('nueva sin login ofrece dos caminos y no emite sesión antes de elegir',()=>{
 render(<MemoryRouter initialEntries={['/lidia/conversacion?nueva=11111111-1111-4111-8111-111111111111']}><AppConversation/></MemoryRouter>);
 expect(screen.getByRole('link',{name:'Iniciar sesión'})).toHaveAttribute('href','/acceso');expect(screen.getByRole('button',{name:'Continuar sin registro'})).toBeInTheDocument();expect(f.start).not.toHaveBeenCalled();expect(screen.queryByLabelText(/Nombre|Teléfono|Email/)).toBeNull();
});
it('continuar sin registro inicia el motor y conserva su texto, sin pedir datos al entrar',async()=>{
 render(<MemoryRouter initialEntries={['/lidia/conversacion?nueva=11111111-1111-4111-8111-111111111111']}><AppConversation/></MemoryRouter>);
 fireEvent.click(screen.getByRole('button',{name:'Continuar sin registro'}));await screen.findByText('Pregunta literal del agente');
 expect(f.installation).toHaveBeenCalledWith(true);expect(f.start).toHaveBeenCalledWith('sondeo',null,'11111111-1111-4111-8111-111111111111',true);
 expect(screen.queryByRole('button',{name:'Nueva conversación con LidIA'})).toBeNull();
});
it('deeplink anónimo conserva origen y reanuda el id recibido sin crear otra sesión',async()=>{
 render(<MemoryRouter initialEntries={['/lidia/conversacion?conversacion=chat-guest&invitado=1']}><AppConversation/></MemoryRouter>);
 await screen.findByText('Pregunta literal del agente');expect(f.timeline).toHaveBeenCalledWith('chat-guest',{limit:'50'});expect(f.start).not.toHaveBeenCalled();
});
