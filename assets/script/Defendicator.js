//TODO
// - Export array to CSV
// - Add Hunting query generation

function formatIndicators(){
    const arrIndicators=document.getElementById("txtInput").value.split("\n")
    
    // CSV headers
    let arrOutput = ["IndicatorType,IndicatorValue,ExpirationTime,Action,Severity,Title,Description,RecommendedActions,RbacGroups,Category,MitreTechniques,GenerateAlert"]

    for (const indicator of arrIndicators){
        let strIndicatorType = getIOCType(indicator)
        const strIndicatorValue = cleanIOC(indicator,strIndicatorType)
        const strExpirationTime = getExpirationDate()
        const strIndicatorAction = getIOCAction(strIndicatorType)
        const strSeverity = getIOCSeverity(strIndicatorType)
        const strTitle = "Possible Indicator of Compromise Observed"
        const strDescription = "This indicator was added by another user & may indicate malicious activity."
        const strRecommendedActions = ""
        const strRbacGroups = ""
        const strCategory = "Malware"
        const strMitreTechniques = ""
        const strGenerateAlert = isGenerateAlert()

        if (strIndicatorType === "Url" && document.getElementById("chkUrlConvertToggle").checked){
            strIndicatorType = "DomainName"
        }
        // Join all strings as CSV values
        const strNewRow = strIndicatorType + "," + strIndicatorValue + "," + strExpirationTime + "," + strIndicatorAction + "," + strSeverity + "," + strTitle + "," + strDescription + "," + strRecommendedActions + "," + strRbacGroups + "," + strCategory + "," + strMitreTechniques + "," + strGenerateAlert
        // Append row to array
        arrOutput.push(strNewRow)
    }

    // Join strings with newline
    strCSV = arrOutput.join("\n")
    strBlobUrl = downloadCSV(strCSV)

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

function getIOCAction(strType){
    if (strType.startsWith("File")){
        return "BlockAndRemediate"
    } else {
        return "Block"
    }
}

function getIOCSeverity(strType){
    if (strType.startsWith("File")){
        return "Medium"
    } else {
        return "Low"
    }
}

function isGenerateAlert(){
    if (document.getElementById("chkQueryToggle").checked){
        return "TRUE"
    } else {
        return "FALSE"
    }
}

function downloadCSV(strCsvData){
    const dateNow = new Date()
    const strDateNow = dateNow.toISOString()
    const strFileName = strDateNow + "_indicators.csv"
    // Define new data blob (https://transcoding.org/javascript/export-to-csv/)
    let blob = new Blob([strCSV], { type: 'text/csv;charset=utf-8;' });
    let strBlobUrl = URL.createObjectURL(blob)
    console.log(strBlobUrl)

    // Create DOM object
    objDownloadBtn = document.getElementById("btnDownload")
    objDownloadForm = document.getElementById("formDownload")

    // Add download URL to form
    objDownloadForm.href = strBlobUrl
    objDownloadForm.setAttribute('download',strDateNow + "_indicators.csv")

    // Unhide button
    objDownloadBtn.removeAttribute("hidden")
    objDownloadBtn.click()

    return strBlobUrl
}