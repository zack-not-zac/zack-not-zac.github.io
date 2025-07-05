//TODO
// - Add additional IOC fields
// - Add error handling for invalid indicator types

function formatIndicators(){
    const arrIndicators=document.getElementById("txtInput").value.split("\n")
    
    // CSV headers
    let arrOutput = ["IndicatorType,IndicatorValue,ExpirationTime,Action,Severity,Title,Description,RecommendedActions,RbacGroups,Category,MitreTechniques,GenerateAlert"]
    let arrQueryIndicators = []

    for (const indicator of arrIndicators){
        let strIndicatorType = getIOCType(indicator)
        const strIndicatorValue = cleanIOC(indicator,strIndicatorType)
        const strExpirationTime = getExpirationDate()
        const strIndicatorAction = getIOCAction(strIndicatorType)
        const strSeverity = getIOCSeverity(strIndicatorType)
        const strTitle = getTxtInput("txtIndicatorTitle",true)
        const strDescription = getTxtInput("txtIndicatorDescription",true)
        const strRecommendedActions = getTxtInput("txtIndicatorRecommendedActions")
        const strRbacGroups = getTxtInput("txtIndicatorRbacGroups")
        const strCategory = getIOCCategory()
        const strMitreTechniques = getTxtInput("txtIndicatorTechniques")
        const strGenerateAlert = isGenerateAlert()

        if (strIndicatorType === "Url" && document.getElementById("chkUrlConvertToggle").checked){
            strIndicatorType = "DomainName"
        }
        // Join all strings as CSV values
        const strNewRow = strIndicatorType + "," + strIndicatorValue + "," + strExpirationTime + "," + strIndicatorAction + "," + strSeverity + "," + strTitle + "," + strDescription + "," + strRecommendedActions + "," + strRbacGroups + "," + strCategory + "," + strMitreTechniques + "," + strGenerateAlert
        // Append row to array
        arrOutput.push(strNewRow)
        // Add to query indicators if option is selected
        if (document.getElementById("chkQueryToggle").checked){
            arrQueryIndicators.push(strIndicatorType + "," + strIndicatorValue)
        }
    }

    // Join strings with newline
    strCSV = arrOutput.join("\n")
    strBlobUrl = downloadCSV(strCSV)

    // Advanced hunting queries toggle
    if (document.getElementById("chkQueryToggle").checked){        
        // Generate queries
        let txtOutput = document.getElementById("txtQueryOutput")
        txtOutput.value = generateAdvHuntQuery(arrQueryIndicators)
        // Unhide paragraph
        document.getElementById("divQueryOutput").removeAttribute("hidden")
    }
}

function generateAdvHuntQuery(arrQueryIndicators){
    console.log("Adding Advanced Hunting queries...")

    let arrSha256Hashes = []
    let arrSha1Hashes = []
    let arrMd5Hashes = []
    let arrIpAddresses = []
    let arrDomains = []
    let strQueries = ""

    for (const indicator of arrQueryIndicators){
        const arrIndicatorTypeVal = indicator.split(",")
        const strType = arrIndicatorTypeVal[0]
        const strValue = arrIndicatorTypeVal[1]

        if (strType === "FileSha256"){
            arrSha256Hashes.push(strValue)
        } else if (strType === "FileSha1") {
            arrSha1Hashes.push(strValue)
        } else if (strType === "FileMd5") {
            arrMd5Hashes.push(strValue)
        } else if (strType === "IpAddress") {
            arrIpAddresses.push(strValue)
        } else {
            arrDomains.push(strValue)
        }
    }
    // Generate file hash query
    if (arrSha256Hashes.length > 0 || arrSha1Hashes > 0 || arrMd5Hashes > 0){
        strQueries += setHashQuery(arrSha256Hashes, arrSha1Hashes, arrMd5Hashes) + "\n\n"
    }
    // Generate IP query
    if (arrIpAddresses.length > 0){
        strQueries += setIpQuery(arrIpAddresses) + "\n\n"
    }
    if (arrDomains.length > 0) {
        strQueries += setDomainQuery(arrDomains)
    }

    return strQueries
}

function setHashQuery(arrSha256Hashes, arrSha1Hashes, arrMd5Hashes) {
    let strHashWhereClause = "| where "
    let strHashVariables = ""

    if (arrSha256Hashes.length > 0){
        strHashVariables += "let SHA256_IOCs = dynamic([\"" + arrSha256Hashes.join("\",\"") + "\"]);\n"
        strHashWhereClause += "SHA256 in~ (SHA256_IOCs)"
    }
    // if any SHA1 values
    if (arrSha1Hashes.length > 0){
        strHashVariables += "let SHA1_IOCs = dynamic([\"" + arrSha256Hashes.join("\",\"") + "\"]);\n"
        if (strHashWhereClause.length > 8){ // if query where clause is has other hash values
            strHashWhereClause += " or "
        }
        strHashWhereClause += "SHA1 in~ (SHA1_IOCs)"
    }
    // if any MD5 values
    if (arrMd5Hashes.length > 0){
        strHashVariables += "let MD5_IOCs = dynamic([\"" + arrSha256Hashes.join("\",\"") + "\"]);\n"
        if (strHashWhereClause.length > 8){ // if query where clause is has other hash values
            strHashWhereClause += " or "
        }
        strHashWhereClause += "MD5 in~ (MD5_IOCs)"
    }
    // Create file hash query
    const strFileQuery = "// File IOC Hunting\n" + strHashVariables + "union DeviceEvents, DeviceFileEvents, DeviceImageLoadEvents, EmailAttachmentInfo, DeviceProcessEvents\n" + strHashWhereClause + ")\n| sort by Timestamp asc"
    console.log(strFileQuery)
    return strFileQuery
}

function setIpQuery(arrIpAddresses){
    const strQuery = "// IP IOC Hunting\nlet IOCs = dynamic([\"" + arrIpAddresses.join("\",\"") + "\"]);\nunion DeviceNetworkEvents, CloudAppEvents, AADSignInEventsBeta\n| where Timestamp > ago(30d) and (IPAddress in (IOCs) or RemoteIP in (IOCs))\n| sort by Timestamp asc"
    console.log(strQuery)
    return strQuery
}

function setDomainQuery(arrDomains){
    const strQuery = "// Domain IOC Hunting\nlet IOCs = dynamic([\"" + arrDomains.join("\",\"") + "\"]);\nunion DeviceNetworkEvents, EmailUrlInfo, UrlClickEvents\n| where Timestamp > ago(30d) and (Url has_any (IOCs) or RemoteUrl has_any (IOCs) or AdditionalFields has_any (IOCs))\n| sort by Timestamp asc"
    console.log(strQuery)
    return strQuery
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

function getTxtInput(strElementId, usePlaceholder=false){
    const objTxtInput = document.getElementById(strElementId)
    if (objTxtInput.value.length > 0) {
        console.log(strElementId + " has been set to '" + objTxtInput.value + "'")
        return objTxtInput.value
    } else if (usePlaceholder) {
        console.log(strElementId + " has been set to '" + objTxtInput.placeholder + "'")
        return objTxtInput.placeholder
    } else {
        console.log("No input found for " + strElementId + " & usePlaceholder is false.")
        return ""
    }
}

function getIOCCategory(){
    const strCategory = document.getElementById("txtIndicatorCategory").value
    console.log("Chosen IOC category: " + strCategory)
    return strCategory
}