---
title: Splunk Hunting Queries
description: This page contains a collection of useful splunk hunting queries I have created while investigating incidents & writing detections.
date: 2022-05-19
categories: [Blog Posts]
tags: [tips & tricks,blue team,splunk]
---
# Windows Security Event Log Searches

### General Activity
```
(index=*win*) sourcetype=*wineventlog* "USER"
| fillnull action value="unknown"
| stats earliest(_time) as Earliest latest(_time) as Latest values(name) as description values(user) as user values(src_user) as src_user values(src) as source values(dest) as dest count by EventCode, action
| sort - latest
| convert ctime(Earliest) ctime(Latest) timeformat="%H:%M:%S %d/%m/%y"
```

### Check For Password Resets
```
index=*win* EventCode IN (4722, 4723, 4724, 4725, 4726) user="USER*"
| stats earliest(_time) as earliest latest(_time) as latest values(signature) as Description values(ComputerName) as Host values(Account_Domain) as Domain values(action) count by user EventCode
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
```

### Check Installed Services Details
```
index=*win* EventCode=4697 "HOST*"
| stats earliest(_time) as earliest latest(_time) as latest values(signature) as Description values(host) as Host values(SubjectDomainName) as Domain values(ServiceFileName) as Command values(start_mode) as start_mode count by user ServiceName
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
```

### View Details of Group Changes
```
index=*win* sourcetype=*wineventlog* EventCode IN (631, 632, 633, 634, 635, 636, 637, 638, 639, 641, 658, 659, 660, 661, 662, 668, 687, 688, 689, 690, 691, 692, 693, 4728, 4729, 4730, 4731, 4732, 4733, 4734, 4735, 4737, 4754, 4755, 4758, 4764, 4783, 4784, 4785, 4786, 4787, 4788, 4789, 4790, 4791, 4792, 4798, 4799, 6144, 6145) "USER"
| fillnull action value="unknown"
|  stats earliest(_time) as Earliest latest(_time) as Latest values(name) as description values(user) as user values(src_user) as src_user values(src) as source values(dest) as dest values(Group_Name) as group values(Group_Domain) as group_domain count by EventCode, action
| sort - latest
| convert ctime(Earliest) ctime(Latest) timeformat="%H:%M:%S %d/%m/%y"
```

# Datamodel Searches

### View All Log Sources in Splunk
```
| tstats summariesonly=t values(sourcetype) WHERE index=* earliest=-7d@d by index
```

### Query Web DM
```
| tstats summariesonly=t earliest(_time) as earliest latest(_time) as latest values(Web.http_referrer) as http_referrer values(Web.http_user_agent) as user_agent count as connections FROM datamodel=Web
WHERE Web.url IN ("DEST") OR Web.dest IN ("DEST")
BY Web.url Web.src Web.user Web.action Web.status sourcetype index
| sort - latest
| rename Web.* as *
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
```

### Query IDS DM
```
| tstats summariesonly=t earliest(_time) as earliest latest(_time) as latest values(IDS_Attacks.signature) values(IDS_Attacks.user) values(IDS_Attacks.dest) values(IDS_Attacks.transport) count FROM datamodel=Intrusion_Detection WHERE IDS_Attacks.src IN ("DEST") OR IDS_Attacks.dest IN ("DEST") BY sourcetype IDS_Attacks.vendor_product IDS_Attacks.src IDS_Attacks.category IDS_Attacks.action IDS_Attacks.severity
| sort - latest
| rename values(IDS_Attacks.*) as *, IDS_Attacks.* as *
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
| table earliest latest src dest transport user signature category severity action vendor_product sourcetype count
```
 

### Query Network Traffic DM
```
| tstats summariesonly=t earliest(_time) as earliest latest(_time) as latest values(All_Traffic.dest_port) as dest_port values(All_Traffic.src_port) as src_port count as connections sum(All_Traffic.bytes_in) as downloaded sum(All_Traffic.bytes_out) as uploaded FROM datamodel=Network_Traffic
WHERE All_Traffic.src IN ("DEST") OR All_Traffic.dest IN ("DEST")
BY All_Traffic.dest All_Traffic.src All_Traffic.user All_Traffic.action sourcetype index
| eval Uploaded_MB=round(uploaded/1024/1024,2), Downloaded_MB=round(downloaded/1024/1024,2)
| fields - uploaded, downloaded
| sort - latest
| rename All_Traffic.* as *
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
```

### Query Authentication DM
```
| tstats summariesonly=t earliest(_time) as earliest latest(_time) as latest values(Authentication.user) values(Authentication.app) values(Authentication.dest) values(Authentication.signature) count FROM datamodel=Authentication WHERE Authentication.src IN ("SRC") by Authentication.src Authentication.action sourcetype
| rename values(Authentication.*) as *, Authentication.* as *
| sort - latest
| iplocation src
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
| table earliest latest src Country user app dest signature sourcetype action count
```

### Query Malware DM
```
| tstats summariesonly=t earliest(_time) as earliest latest(_time) as latest values(Malware_Attacks.category) values(Malware_Attacks.dest) values(Malware_Attacks.src) values(Malware_Attacks.file_hash) values(Malware_Attacks.signature) values(Malware_Attacks.user) values(Malware_Attacks.file_path) values(Malware_Attacks.file_name) count FROM datamodel=Malware WHERE Malware_Attacks.src="DEST" OR Malware_Attacks.dest="DEST" by Malware_Attacks.action sourcetype Malware_Attacks.vendor_product
| rename Malware_Attacks.* as *, values(Malware_Attacks.*) as *
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
| table earliest latest src dest user signature category action file_path file_name file_hash sourcetype count
``` 

### Query DNS DM
```
| tstats summariesonly=t earliest(_time) as earliest latest(_time) as latest values(DNS.dest) values(DNS.src) values(DNS.reply_code) values(DNS.record_type) values(DNS.answer) count FROM datamodel=Network_Resolution WHERE DNS.query="*DOMAIN*" BY DNS.query index sourcetype DNS.vendor_product
| rename values(DNS.*) as *, DNS.* as *
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
```

# AWS CloudTrail Searches

### General Activity
```
index=*aws* sourcetype="aws:cloudtrail" "USERNAME"
| iplocation sourceIPAddress
| stats earliest(_time) as earliest latest(_time) as latest values(user) values(user_id) values(sourceIPAddress) values(signature) values(userAgent) values(Country) count by eventName
| rename values(*) as *
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
| table earliest latest user user_id sourceIPAddress Country eventName signature userAgent count
```

### CreateRole Details
```
index=*aws* sourcetype=aws:cloudtrail eventName=CreateRole "ROLE"
| stats earliest(_time) as earliest latest(_time) as latest values(userIdentity.principalId) as SourceUser values(responseElements.role.roleName) as CreatedRole values(responseElements.role.createDate) as Timestamp values(region) as Region count by eventName status src responseElements.role.roleName
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
| table earliest latest SourceUser eventName status src CreatedRole Timestamp count
```
 
### CreateSecurityGroup
```
index=*aws* sourcetype=aws:cloudtrail eventName=CreateSecurityGroup "GROUP_ID"
| stats earliest(_time) as earliest latest(_time) as latest values(userIdentity.sessionContext.attributes.mfaAuthenticated) as UsedMFA values(requestParameters.groupName) as Group_Name values(requestParameters.groupDescription) as Description values(region) as Region count by eventName user responseElements.groupId
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
| table earliest latest user eventName UsedMFA Group_Name Description count
```

### Rule Policy Changes
```
index=*aws* sourcetype=aws:cloudtrail eventName IN (DeleteRolePolicy, UpdateAssumeRolePolicy) "*USER"
| stats Earliest(_time) as Earliest Latest(_time) as Latest values(requestParameters.policyName) as Policy values(requestParameters.policyDocument) as Policy_Document count by userName awsRegion eventName requestParameters.roleName
| fillnull value="N/A"
| sort - latest
| convert ctime(Earliest) ctime(Latest) timeformat="%H:%M:%S %d/%m/%y"
```

### PutRolePolicy
```
index=*aws* sourcetype=aws:cloudtrail eventName=PutRolePolicy userName="*USER"
| table _time user_arn userName src_ip user_agent errorCode app eventName msg requestParameters.roleName requestParameters.policyName object requestParameters.policyDocument recipientAccountId
| sort -_time
```

### AuthorizeSecurityGroupIngress/Egress
```
index=*aws* sourcetype=aws:cloudtrail eventName IN ("*SecurityGroupIngress", "*SecurityGroupEgress", "CreateSecurityGroup", "DeleteSecurityGroup") ("*USER*")
| iplocation sourceIPAddress
| rename requestParameters.securityGroupRuleIds.items{}.securityGroupRuleId as requestRuleId, responseElements.securityGroupRuleSet.items{}.securityGroupRuleId as responseRuleId, userIdentity.principalId as PrincipalID
| eval RuleID=if(eventName=="RevokeSecurityGroupIngress",requestRuleId, responseRuleId)
| stats  earliest(_time) as Earliest latest(_time) as Latest values(userIdentity.type) as LoginType values(userName) as ActualUser values(userAgent) as UserAgent values(msg) as Status values(requestParameters.groupId) as GroupID values(sourceIPAddress) as SourceIP values(requestParameters.ipPermissions.items{}.ipRanges.items{}.cidrIp) as CIDR values(requestParameters.ipPermissions.items{}.fromPort) as Source_Port values(requestParameters.ipPermissions.items{}.toPort) as Dest_Port values(requestParameters.ipPermissions.items{}.ipRanges.items{}.description) as Rule_Description values(RuleID) as RuleID by eventName aws_account_id PrincipalID userIdentity.accessKeyId
| sort - latest
| convert ctime(Earliest) ctime(Latest)
| fields Earliest Latest aws_account_id eventName GroupID CIDR Source_Port Dest_Port Rule_Description RuleID ActualUser LoginType Status SourceIP PrincipalID userIdentity.accessKeyId
| fillnull value="N/A"
```

### ChangePassword
```
index=*aws* sourcetype=aws:cloudtrail eventName=ChangePassword "*USER*"
| table _time userIdentity.arn userName userIdentity.sessionContext.attributes.mfaAuthenticated
| rename _time AS Time userIdentity.arn AS ARN userName as User userIdentity.sessionContext.attributes.mfaAuthenticated as Used_MFA
| convert ctime(Time) timeformat="%H:%M:%S %d/%m/%y"
```

### PutBucketPublicAccessBlock
```
index=*aws* sourcetype="aws:cloudtrail" eventName=PutBucketPublicAccessBlock requestParameters.bucketName="BUCKET"
| table _time eventName userIdentity.accessKeyId user userIdentity.sessionContext.sessionIssuer.userName userIdentity.sessionContext.attributes.mfaAuthenticated requestParameters.bucketName requestParameters.PublicAccessBlockConfiguration* user_agent
| rename userIdentity.sessionContext.sessionIssuer.userName as AssumedRole userIdentity.sessionContext.attributes.mfaAuthenticated as UsedMFA
```

### AssumeRole
```
index=*aws* sourcetype=aws:cloudtrail eventName IN (AssumeRole) requestParameters.roleSessionName="ROLE_NAME"
| stats earliest(_time) as earliest latest(_time) as latest values(responseElements.credentials.accessKeyId) as accessKey latest(responseElements.credentials.expiration) as expires by userName action
| sort - latest
| convert ctime(earliest) ctime(latest) timeformat="%d/%m/%y %H:%M:%S"
```

### Instance Information
```
index=*aws* sourcetype=aws:cloudtrail eventName IN ("RunInstances") "INSTANCE_ID"
| fields responseElements.instancesSet.items{}.groupSet.items{}.groupName requestParameters.iamInstanceProfile.name responseElements.instancesSet.items{}.instanceId
| rename responseElements.instancesSet.items{}.instanceId as instance responseElements.instancesSet.items{}.groupSet.items{}.groupName as instanceGroup requestParameters.iamInstanceProfile.name as instanceName
```