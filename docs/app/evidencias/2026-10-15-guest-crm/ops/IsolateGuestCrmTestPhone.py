import subprocess,re,json,urllib.request,pathlib,os
os.umask(0o077)
raw=subprocess.check_output(['docker','exec','lidia-app-gestadia-pro','dotnet','/tmp/guest-crm-probe/GuestCrmOps.dll','SELECT AccessToken FROM IntegrationTokens WHERE ConnectionId=4'],text=True)
token=re.search(r'AccessToken=([^\s]+)',raw).group(1)
u='https://www.zohoapis.eu/crm/v2/Leads/588164000147948490'
h={'Authorization':'Zoho-oauthtoken '+token,'Content-Type':'application/json'}
with urllib.request.urlopen(urllib.request.Request(u,headers=h),timeout=30) as r:a=json.load(r)['data'][0]
assert a['Full_Name']=='Prueba CRM App Invitado' and a['Mobile']=='+34555555555' and a['Phone'] is None and a['Owner']['id']=='588164000000756001' and a['Campa_a']=='Canje' and a['Lead_Source']=='App'
with pathlib.Path('/tmp/guest-crm-fixture-mobile.before.private.json').open('x') as f:json.dump({'LeadId':a['id'],'Mobile':a['Mobile']},f)
p={'data':[{'id':a['id'],'Mobile':None}],'trigger':[],'skip_feature_execution':[{'name':'cadences'}]}
with urllib.request.urlopen(urllib.request.Request(u,data=json.dumps(p).encode(),headers=h,method='PUT'),timeout=30) as r:assert json.load(r)['data'][0]['status']=='success'
with urllib.request.urlopen(urllib.request.Request(u,headers=h),timeout=30) as r:b=json.load(r)['data'][0]
assert b['Mobile'] is None and b['Owner']['id']==a['Owner']['id'] and b['Campa_a']=='Canje'
print('OWN_FIRST_TEST_LEAD_MOBILE_DETACHED_WITH_PRIVATE_PREIMAGE')
