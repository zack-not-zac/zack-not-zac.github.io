---
title: Defendicator - Defender IOC Formatter
description: Defendicator - the tool to help you format IOC's for Microsoft Defender XDR on your device.
date: 2025-07-03
categories: [Tools]
tags: [Microsoft Security, developer]
permalink: "/Defendicator"
---
<div id=divChooseMode>
    <input type=radio id=btnSimpleMode name="btnChooseMode" value="Simple" checked>
    <label for=btnSimpleMode>Simple Mode </label>
    <input type=radio id=btnAdvMode name="btnChooseMode" value="Advanced" style="margin-left: 10px">
    <label for=btnAdvMode>Advanced Mode </label>
</div>
<div id=divOptions hidden>
    <div id=divOptionsFreetext>
        <label for=txtIndicatorTitle>Indicator Title: </label>
        <input type=text id=txtIndicatorTitle placeholder="Possible Indicator of Compromise Observed" style="width:100%; margin:5px"><br>
        <label for=txtIndicatorDescription>Indicator Description: </label>
        <input type=text id=txtIndicatorDescription placeholder="This indicator was added by another user & may indicate malicious activity." style="width:100%; margin:5px"><br>
        <label for=txtIndicatorRecommendedActions>Recommended Actions: </label>
        <input type=text id=txtIndicatorRecommendedActions placeholder="e.g 'Launch a full AV scan.'" style="width:100%; margin:5px">
        <label for=txtIndicatorRbacGroups>Device Groups: </label>
        <input type=text id=txtIndicatorRbacGroups placeholder="e.g 'Group1,Group2'" style="width:100%; margin:5px">
        <label for=txtIndicatorTechniques>MITRE Techniques: </label>
        <input type=text id=txtIndicatorTechniques placeholder="e.g 'T1566'" style="width:100%; margin:5px">
        <label for=txtExpiry>Days Until Expiry: </label>
        <input type=number id=txtExpiry placeholder=90 style="width:100%; margin:5px">
    </div>
    <div id=divOptionsSelect style="margin:5px">
        <label for=txtIndicatorCategory>Indicator Category: </label>
        <select name=txtIndicatorCategory id=txtIndicatorCategory>
            <option value="Malware" selected="selected">Malware</option>
            <option value="UnwantedSoftware">Unwanted Software</option>
            <option value="Ransomware">Ransomware</option>
            <option value="CommandandControl">Command & Control</option>
            <option value="LateralMovement">Lateral Movement</option>
            <option value="Persistence">Persistence</option>
            <option value="PrivilegeEscalation">Privilege Escalation</option>
            <option value="SuspiciousActivity">Suspicious Activity</option>
            <option value="Exploit">Exploit</option>
            <option value="InitialAccess">Initial Access</option>
            <option value="Execution">Execution</option>
            <option value="Exfiltration">Exfiltration</option>
            <option value="Collection">Collection</option>
            <option value="CredentialAccess">Credential Access</option>
            <option value="DefenseEvasion">Defense Evasion</option>
            <option value="Discovery">Discovery</option>
            <option value="Impact">Impact</option>
        </select>
    </div>
    <div id=divOptionsCheckbox>
        <input type=checkbox id=chkQueryToggle value="1" label="Generate Advanced Hunting queries" checked/>
        <label for="chkQueryToggle">Generate Advanced Hunting queries</label><br>
        <input type=checkbox id=chkUrlConvertToggle value="1" label="Convert URL's to domains" checked/>
        <label for="chkUrlConvertToggle">Convert URL's to domains</label><br>
        <input type=checkbox id=chkAlertsToggle value="1" label="Generate alerts for indicator events" checked/>
        <label for="chkAlertsToggle">Generate alerts for indicator events</label><br>
    </div>
</div>
<div style="margin-top: 10px">
    <textarea id=txtInput name=txtInput rows=10 style="width:100%" required autofocus placeholder="Paste your IOC's here - your data is never sent to remote servers."></textarea>
</div>
<div id=divButtons style="margin-top: 10px">
    <input type=submit id=btnSubmit value=Submit onclick="formatIndicators()">
</div>

<div id=divQueryOutput hidden style="margin:5px">
    <p style="font-size:20px">Advanced Hunting Queries<br></p>
    <textarea id=txtQueryOutput name=txtQueryOutput rows=10 style="width:100%" readonly></textarea>
</div>

<script type="text/javascript" src="/assets/script/Defendicator.js"></script>

<script>
    document.getElementById("divChooseMode").addEventListener('change',function(){
        if (document.getElementById("btnAdvMode").checked) {
            console.log("Switching to advanced mode...");
            document.getElementById("divOptions").hidden = false;
        } else {
            console.log("Switching to simple mode...");
            document.getElementById("divOptions").hidden = true;
        }
    })
</script>