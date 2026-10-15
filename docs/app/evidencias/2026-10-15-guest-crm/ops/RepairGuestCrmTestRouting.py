import subprocess,re,json,urllib.request
raw=subprocess.check_output(['docker','exec','lidia-app-gestadia-pro','dotnet','/tmp/guest-crm-probe/GuestCrmOps.dll','SELECT AccessToken FROM IntegrationTokens WHERE ConnectionId=4'],text=True)
token=re.search(r'AccessToken=([^\s]+)',raw).group(1)
import pathlib,os
os.umask(0o077)
base='https://www.zohoapis.eu/crm/v2/'
lead='588164000147948490';call='588164000147862440';old='588164000000351001';owner='588164000000756001'
def get(module,record):
 req=urllib.request.Request(base+module+'/'+record,headers={'Authorization':'Zoho-oauthtoken '+token})
 with urllib.request.urlopen(req,timeout=30) as r:return json.load(r)['data'][0]
def put(module,record,fields):
 payload={'data':[dict(id=record,**fields)],'trigger':[],'skip_feature_execution':[{'name':'cadences'}]}
 req=urllib.request.Request(base+module+'/'+record,data=json.dumps(payload).encode(),method='PUT',headers={'Authorization':'Zoho-oauthtoken '+token,'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=30) as r: result=json.load(r)['data'][0]
 assert result['status']=='success'
a=get('Leads',lead);b=get('Calls',call)
assert a['id']==lead and a['Full_Name']=='Prueba CRM App Invitado' and a['Mobile']=='+34555555555' and a['Lead_Source']=='App'
assert a['Owner']['id']==old and not a.get('Campa_a')
assert b['Owner']['id']==old and b['What_Id']['id']==lead and 'LIDIA-OP:1aa8ccfecb6d4da69b88cbed5038464b' in b['Subject']
assert b['Call_Start_Time']=='2026-10-16T10:30:00+02:00'
p=pathlib.Path('/tmp/guest-crm-test-routing.before.private.json')
with p.open('x') as f: json.dump({'Leads':a,'Calls':b},f)
put('Leads',lead,{'Owner':{'id':owner},'Campa_a':'Canje'})
put('Calls',call,{'Owner':{'id':owner}})
a=get('Leads',lead);b=get('Calls',call)
assert a['Owner']['id']==owner and a['Campa_a']=='Canje' and a['Lead_Source']=='App'
assert b['Owner']['id']==owner and b['What_Id']['id']==lead and b['Call_Start_Time']=='2026-10-16T10:30:00+02:00'
print(json.dumps({'LeadId':lead,'CallId':call,'OwnerId':owner,'OwnerName':a['Owner']['name'],'Service':a['Campa_a'],'Source':a['Lead_Source'],'CallStart':b['Call_Start_Time'],'SameLead':True},ensure_ascii=False))
