using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using MySqlConnector;
const string path="/app/App_Data/app-conversations.json", expected="56b5a9c525b5fb66bcbecff92f4e3afdd12cf9f99fed2351b56a81d32227f71a";
const string dir="/app/App_Data/ops-guest-crm-20261015";
var bytes=File.ReadAllBytes(path);var hash=Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
if(hash!=expected)throw new Exception("Configuration preimage changed; inspect before proceeding");
var config=JsonNode.Parse(bytes)!;var before=config.DeepClone();
var integrations=config["AppConversations"]!["Integrations"]!.AsArray();
var guest=integrations.Single(x=>x?["Id"]?.ToString()=="gestadia-app-pro-guest")!;
if(guest["Audience"]?.ToString()!="gestadia-app-pro-guest"||guest["ProjectId"]?.GetValue<int>()!=104||guest["AgentId"]?.GetValue<int>()!=123||guest["Environment"]?.ToString()!="pro"||guest["GuestV2Enabled"]?.GetValue<bool>()!=true||guest["Crm"]!=null)throw new Exception("Unexpected guest profile");
if(guest["Permissions"]!.ToJsonString()!="[\"sondeo\",\"history\"]")throw new Exception("Permissions changed");
guest["GuestCrmEnabled"]=true;guest["Permissions"]=new JsonArray("sondeo","history","crm_prepare","callback_schedule");
guest["Crm"]=new JsonObject{["ConnectionId"]=4,["ExpectedEnvironment"]="Production",["OwnerKeyField"]="LidIA_App_Owner_Key",["UniqueOwnerKeyConfirmed"]=true};
var verify=config.DeepClone();var vg=verify["AppConversations"]!["Integrations"]!.AsArray().Single(x=>x?["Id"]?.ToString()=="gestadia-app-pro-guest")!;
vg.AsObject().Remove("GuestCrmEnabled");vg["Permissions"]=before["AppConversations"]!["Integrations"]!.AsArray().Single(x=>x?["Id"]?.ToString()=="gestadia-app-pro-guest")!["Permissions"]!.DeepClone();vg["Crm"]=null;
if(!JsonNode.DeepEquals(before,verify))throw new Exception("Unrelated config delta");
using var db=new MySqlConnection(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"));db.Open();
using(var c=new MySqlCommand("SELECT c.Provider,c.Environment,c.IsActive,t.ApiDomain,t.AccessToken FROM IntegrationConnections c JOIN IntegrationTokens t ON t.ConnectionId=c.Id WHERE c.Id=4",db)){
 using var r=c.ExecuteReader();if(!r.Read()||r.GetString(0)!="Zoho CRM"||r.GetString(1)!="Production"||!r.GetBoolean(2)||r.GetString(3)!="https://www.zohoapis.eu")throw new Exception("CRM mismatch");var token=r.GetString(4);r.Close();
 using var http=new HttpClient();http.DefaultRequestHeaders.TryAddWithoutValidation("Authorization","Zoho-oauthtoken "+token);
 foreach(var module in new[]{"Leads","Contacts"}){var res=http.GetAsync("https://www.zohoapis.eu/crm/v2/settings/fields?module="+module).GetAwaiter().GetResult();if(!res.IsSuccessStatusCode)throw new Exception("Fields HTTP "+(int)res.StatusCode);var f=JsonNode.Parse(res.Content.ReadAsStringAsync().GetAwaiter().GetResult())!["fields"]!.AsArray().Single(x=>x?["api_name"]?.ToString()=="LidIA_App_Owner_Key")!;if(f["unique"]?["casesensitive"]?.ToString()!="0")throw new Exception("Unique owner field not verified");Console.WriteLine(module+" unique owner verified");}
}
var apply=args.SequenceEqual(new[]{"apply-guest-123"});
if(!apply){Console.WriteLine("Prepared: only guest104/123, connection4, three original tool definitions; no mutation");return;}
Directory.CreateDirectory(dir,UnixFileMode.UserRead|UnixFileMode.UserWrite|UnixFileMode.UserExecute);
if(Directory.EnumerateFiles(dir,"phase.*.public.json").Any())throw new Exception("Previous journal exists; reconcile before retry");
using(var backup=new FileStream(dir+"/app-conversations.before.private.json",FileMode.CreateNew,FileAccess.Write,FileShare.None)){backup.Write(bytes);backup.Flush(true);}
File.SetUnixFileMode(dir+"/app-conversations.before.private.json",UnixFileMode.UserRead|UnixFileMode.UserWrite);
using var tx=db.BeginTransaction();
object? Scalar(string sql){using var c=new MySqlCommand(sql,db,tx);return c.ExecuteScalar();}
int Exec(string sql){using var c=new MySqlCommand(sql,db,tx);return c.ExecuteNonQuery();}
if(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM Agents WHERE Id=123 AND ProjectId=104 AND IsActive=1 AND IsFlowAgent=0 AND IntegrationConnectionId IS NULL FOR UPDATE"))!=1)throw new Exception("Agent preimage changed");
if(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM AgentAllowedFunctions WHERE AllowedAgentsId=123 AND AllowedFunctionsId=10372"))!=1||Convert.ToInt32(Scalar("SELECT COUNT(*) FROM AgentAllowedFunctions WHERE AllowedAgentsId=123"))!=1)throw new Exception("Guest assignment preimage changed");
const string cols="Name,Description,IsActive,ParametersSchema,IntegrationConnectionId,ApiMethod,ApiEndpoint,BodyTemplate,IsGlobal,ProjectId,AgentFunctionCategoryId,OutputSchema,CreatedAt,UpdatedAt";
var hashes=new Dictionary<int,string>{{10357,"388eab617e05cee9db74bc3459a4ec1a3636b0cc4373930330c724b1e2d07644"},{10359,"f493004abf24a1ab8c24a6c0b1de5dc92f9c37d5270477f5001babfa3368cc68"},{10360,"d3b901d675c0cc0a4a8d087bb4a31a78eb17d25e5ef46cded57c8a49c0d63986"}};
var ids=new List<long>();foreach(var source in new[]{10357,10359,10360}){
 var definitionHash=Scalar($"SELECT SHA2(JSON_ARRAY(Name,Description,IsActive,ParametersSchema,IntegrationConnectionId,ApiMethod,ApiEndpoint,BodyTemplate,IsGlobal,ProjectId,AgentFunctionCategoryId,OutputSchema,CreatedAt,UpdatedAt),256) FROM AgentFunctions WHERE Id={source} FOR UPDATE")?.ToString();
 if(definitionHash!=hashes[source])throw new Exception("Reference definition changed: "+source);
 if(Convert.ToInt32(Scalar($"SELECT AllowedFunctionsId FROM AgentAllowedFunctions WHERE AllowedAgentsId=119 AND AllowedFunctionsId={source} FOR UPDATE"))!=source)throw new Exception("Source assignment changed");
 var count=Convert.ToInt32(Scalar($"SELECT COUNT(*) FROM AgentFunctions f JOIN AgentAllowedFunctions a ON a.AllowedFunctionsId=f.Id AND a.AllowedAgentsId=119 WHERE f.Id={source} AND f.ProjectId=102 AND f.IsActive=1"));if(count!=1)throw new Exception("Reference tool changed");
 if(Convert.ToInt32(Scalar($"SELECT COUNT(*) FROM AgentFunctions WHERE ProjectId=104 AND Name=(SELECT Name FROM AgentFunctions WHERE Id={source})"))!=0)throw new Exception("Guest tool name already exists; reconcile");
 if(Exec($"INSERT INTO AgentFunctions ({cols}) SELECT Name,Description,IsActive,ParametersSchema,4,ApiMethod,ApiEndpoint,BodyTemplate,IsGlobal,104,AgentFunctionCategoryId,OutputSchema,CreatedAt,UpdatedAt FROM AgentFunctions WHERE Id={source}")!=1)throw new Exception("Clone failed");
 var id=Convert.ToInt64(Scalar("SELECT LAST_INSERT_ID()"));ids.Add(id);if(Exec($"INSERT INTO AgentAllowedFunctions(AllowedAgentsId,AllowedFunctionsId) VALUES(123,{id})")!=1)throw new Exception("Assignment failed");
}
if(Exec("UPDATE Agents SET IntegrationConnectionId=4 WHERE Id=123 AND ProjectId=104 AND IntegrationConnectionId IS NULL")!=1)throw new Exception("Agent changed");
if(Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(path))).ToLowerInvariant()!=expected)throw new Exception("Config changed during preparation");
var next=JsonSerializer.SerializeToUtf8Bytes(config,new JsonSerializerOptions{WriteIndented=true});
var temp=dir+"/app-conversations.next.private.json";File.WriteAllBytes(temp,next);File.SetUnixFileMode(temp,UnixFileMode.UserRead|UnixFileMode.UserWrite);
var afterHash=Convert.ToHexString(SHA256.HashData(next)).ToLowerInvariant();
void Journal(string phase){using var f=new FileStream(dir+"/phase."+phase+".public.json",FileMode.CreateNew,FileAccess.Write,FileShare.Read);var b=JsonSerializer.SerializeToUtf8Bytes(new{Phase=phase,ClonedToolIds=ids,BeforeHash=expected,AfterHash=afterHash,GuestAgent=123,GuestProject=104,Connection=4});f.Write(b);f.Flush(true);}
Journal("prepared-before-config-and-commit");
File.Move(temp,path,true);
try{tx.Commit();}catch{Journal("commit-uncertain-reconcile-primary-no-retry-no-restart");throw;}
Journal("committed-needs-primary-readback");
using(var checkDb=new MySqlConnection(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"))){checkDb.Open();using var check=new MySqlCommand($"SELECT COUNT(*) FROM AgentAllowedFunctions a JOIN AgentFunctions f ON f.Id=a.AllowedFunctionsId JOIN Agents g ON g.Id=a.AllowedAgentsId WHERE g.Id=123 AND g.ProjectId=104 AND g.IntegrationConnectionId=4 AND f.ProjectId=104 AND f.IntegrationConnectionId=4 AND f.IsActive=1 AND f.Id IN ({string.Join(',',ids)})",checkDb);if(Convert.ToInt32(check.ExecuteScalar())!=3)throw new Exception("Primary readback mismatch");}
if(Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(path))).ToLowerInvariant()!=afterHash)throw new Exception("Configuration readback mismatch");
Journal("committed-and-readback-verified");
var receipt=JsonSerializer.Serialize(new{GuestAgent=123,GuestProject=104,Connection=4,ClonedToolIds=ids,BeforeHash=expected,AfterHash=Convert.ToHexString(SHA256.HashData(next)).ToLowerInvariant()});File.WriteAllText(dir+"/applied.public.json",receipt);Console.WriteLine(receipt);
