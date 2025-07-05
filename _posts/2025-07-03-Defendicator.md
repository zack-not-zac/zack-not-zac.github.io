---
title: Defendicator - Defender IOC Formatter
description: Defendicator - the tool to help you format IOC's for Microsoft Defender XDR on your device.
date: 2025-07-03
categories: [Tools]
tags: [Microsoft Security]
permalink: "/Defendicator"
---
<div id=divChooseMode>
    <input type=radio id=btnSimpleMode name="btnChooseMode" value="Simple" checked>
    <label for=btnSimpleMode>Simple Mode </label>
    <input type=radio id=btnAdvMode name="btnChooseMode" value="Advanced">
    <label for=btnAdvMode>Advanced Mode </label>
</div>
<div id=divOptions hidden>
    <input type=checkbox id=chkQueryToggle value="1" label="Generate Advanced Hunting queries" checked/>
    <label for="chkQueryToggle">Generate Advanced Hunting queries</label><br>
    <input type=checkbox id=chkUrlConvertToggle value="1" label="Convert URL's to domains" checked/>
    <label for="chkUrlConvertToggle">Convert URL's to domains</label><br>
    <input type=checkbox id=chkAlertsToggle value="1" label="Generate alerts for indicator events" checked/>
    <label for="chkAlertsToggle">Generate alerts for indicator events</label><br>
</div>
<div>
    <textarea id=txtInput name=txtInput rows=10 cols=75 required autofocus placeholder="Paste your IOC's here - your data is never sent to remote servers."></textarea>
</div>
<div id=divButtons>
    <input type=submit id=btnSubmit value=Submit onclick="formatIndicators()">
    <a id=formDownload>
        <input type=submit id=btnDownload value=Save hidden>
    </a>
</div>

<p id=pQueryOutput hidden>
    Advanced Hunting Queries
    <textarea id=txtQueryOutput name=txtQueryOutput rows=10 cols=75 readonly></textarea>
</p>

<script type="text/javascript" src="/assets/script/Defendicator.js"></script>

<script>
    let objChooseMode = document.getElementById("divChooseMode")
    objChooseMode.addEventListener('change',function(){
        if (document.getElementById("btnAdvMode").checked) {
            console.log("Switching to simple mode...")
            document.getElementById("divOptions").hidden = false
        } else {
            console.log("Switching to simple mode...")
            document.getElementById("divOptions").hidden = true
        }
    })
</script>