---
title: Defendicator - Defender IOC Formatter
description: Defendicator - the tool to help you format IOC's for Microsoft Defender XDR on your device.
date: 2025-07-03
categories: [Tools]
tags: [Microsoft Security]
---

<textarea id=txtInput name=txtInput rows=10 cols=75 required autofocus placeholder="Paste your IOC's here - your data is never sent to remote servers."></textarea>
<input type=submit id=btnSubmit value=Submit onclick="formatIndicators()">

<p id=pQueryOutput hidden>
    Advanced Hunting Queries
    <textarea id=txtQueryOutput name=txtQueryOutput rows=10 cols=75 readonly></textarea>
</p>

<script>
    function formatIndicators(){
        txtOutput = document.getElementById("txtQueryOutput")
        txtOutput.innerHTML="Test123"
        document.getElementById("pQueryOutput").removeAttribute("hidden")
    }
</script>