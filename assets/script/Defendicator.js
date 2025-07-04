//TODO
// - Finish remaining IOC columns

function formatIndicators(){
    const arrIndicators=document.getElementById("txtInput").value.split("\n")
    
    // CSV headers
    let arrOutput = ["IndicatorType,IndicatorValue,ExpirationTime,Action,Severity,Title,Description,RecommendedActions,RbacGroups,Category,MitreTechniques,GenerateAlert"]

    for (const indicator of arrIndicators){
        const strIndicatorType = getIOCType(indicator)
        const strIndicatorValue = cleanIOC(indicator,strIndicatorType)
        const strExpirationTime = getExpirationDate()
        
    }

    // Advanced hunting queries toggle
    if (document.getElementById("chkQueryToggle").checked){        
        // Generate queries
        let txtOutput = document.getElementById("txtQueryOutput")
        txtOutput.value = generateAdvHuntQuery()

        // Unhide paragraph
        document.getElementById("pQueryOutput").removeAttribute("hidden")
    }
}

function generateAdvHuntQuery(){
    return "Testing"
}

function getIOCType(strValue){
    const regexStatements=[
        /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?=$|\:\d+$)/,  // IP regex
        /[\w\.\-]+\/.{1,}/,                                 // URL regex
        /([\w\.\-]+\.[\w\-]+(?=\/|:|$))/,                   // Domain Regex
        /^[A-Fa-f0-9]{64}$/,                                // SHA256 regex
        /^[A-Fa-f0-9]{40}$/,                                // SHA1 regex
        /^[a-fA-F\d]{32}$/                                  // MD5 regex
    ]                                     

    const arrIOCTypes=[
        "IpAddress",
        "Url",
        "DomainName",
        "FileSha256",
        "FileSha1",
        "FileMd5",
    ]

    let i = 0

    for (const regex of regexStatements){
        if (regex.test(strValue)){
            //console.log("IOC type of " + value + ": " + arrIOCTypes[i])
            return arrIOCTypes[i]
        } else {
            i++
        }
    }
}

function cleanIOC(strValue,strType){
    // Remove defanging
    let strCleanedIOC = strValue.replace("[.]",".")

    // Convert URL to domain
    if (strType === "Url" && document.getElementById("chkUrlConvertToggle").checked){
        strCleanedIOC = strCleanedIOC.match(/([\w\.\-]+\.[\w\-]+(?=\/|:|$))/g)[0]
    }
    return strCleanedIOC
}

function getExpirationDate(){
    let dateExpiration = new Date()

    // Add 90 days for expiration
    dateExpiration.setDate(dateExpiration.getDate()+90)
    return dateExpiration.toISOString()
}